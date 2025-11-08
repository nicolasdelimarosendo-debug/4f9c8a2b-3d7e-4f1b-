// app/api/roblox-user/route.ts
// Rota proxy otimizada para Roblox (Next.js App Router)
// Funcionalidades:
// - cache LRU em memória com TTL
// - request coalescing (in-flight dedupe)
// - limite de concorrência (semaphore) para upstream
// - retries exponenciais com jitter e respeito a 429 / Retry-After
// - retorna 429 ao cliente com retry_after quando apropriado
//
// NOTA sobre produção:
// - memória é limitada em serverless; para muito tráfego, use Redis/Upstash/Edge KV
// - configure ENV vars se for usar cache externo (ver instruções abaixo)

import { NextResponse } from "next/server";

type Payload = {
  id: number;
  name: string;
  displayName: string;
  created: string | null;
  avatarUrl: string | null;
  user?: any;
  details?: any;
};

// -------------- Configurações --------------
const CACHE_TTL_MS = Number(process.env.ROBLOX_CACHE_TTL_MS || 1000 * 60 * 2); // 2 minutos default
const CACHE_MAX_ENTRIES = Number(process.env.ROBLOX_CACHE_MAX || 2000); // entries LRU
const MAX_CONCURRENT_UPSTREAM = Number(process.env.ROBLOX_MAX_CONCURRENCY || 8); // concurrent upstream calls
const MAX_RETRIES = Number(process.env.ROBLOX_MAX_RETRIES || 3);
const BACKOFF_BASE_MS = 300;

// -------------- LRU Cache simples --------------
class LRUCache<K, V> {
  private map = new Map<K, { ts: number; val: V }>();
  private maxEntries: number;
  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
  }
  get(key: K): V | null {
    const entry = this.map.get(key);
    if (!entry) return null;
    // move to end = most recently used
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.val;
  }
  set(key: K, value: V) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { ts: Date.now(), val: value });
    if (this.map.size > this.maxEntries) {
      // remove least-recently-used (first entry)
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }
  delete(key: K) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

const cache = (globalThis as any).__robloxLRUCache || new LRUCache<string, { ts: number; payload: Payload }>(CACHE_MAX_ENTRIES);
// persist across cold starts within same instance (best-effort)
if (!(globalThis as any).__robloxLRUCache) (globalThis as any).__robloxLRUCache = cache;

// -------------- In-flight (coalescing) --------------
const inFlight = (globalThis as any).__robloxInFlight || new Map<string, Promise<Payload>>();
if (!(globalThis as any).__robloxInFlight) (globalThis as any).__robloxInFlight = inFlight;

// -------------- Semaphore (limitar concorrência) --------------
let currentUpstream = 0;
const waitForSlot = async () => {
  while (currentUpstream >= MAX_CONCURRENT_UPSTREAM) {
    await new Promise((r) => setTimeout(r, 30)); // spin-wait curto
  }
  currentUpstream++;
};
const releaseSlot = () => {
  currentUpstream = Math.max(0, currentUpstream - 1);
};

// -------------- Helpers: backoff, parse Retry-After --------------
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const n = Number(header);
  if (!Number.isNaN(n)) return n; // seconds
  // try parse HTTP date
  const t = Date.parse(header);
  if (!Number.isNaN(t)) {
    const s = Math.ceil((t - Date.now()) / 1000);
    return s > 0 ? s : 0;
  }
  return null;
}
async function fetchWithRetries(url: string, opts: RequestInit = {}, maxRetries = MAX_RETRIES): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      await waitForSlot();
      const res = await fetch(url, opts);
      releaseSlot();
      if (res.status === 429) {
        const ra = res.headers.get("retry-after");
        const parsed = parseRetryAfter(ra);
        const err: any = new Error("rate_limited");
        err.type = "rate_limited";
        err.retryAfter = parsed ?? 5;
        throw err;
      }
      if (!res.ok) {
        const body = await res.text().catch(() => null);
        const err: any = new Error("upstream_error");
        err.status = res.status;
        err.body = body;
        throw err;
      }
      return res;
    } catch (err: any) {
      releaseSlot(); // ensure slot released if error thrown
      attempt++;
      if (err?.type === "rate_limited") throw err; // bubble up so we can respond 429
      if (attempt > maxRetries) throw err;
      // backoff with jitter
      const backoff = Math.pow(2, attempt) * BACKOFF_BASE_MS + Math.floor(Math.random() * 200);
      await sleep(backoff);
    }
  }
}

// -------------- Main handler --------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("username") || "").trim();
    if (!username) {
      return NextResponse.json({ error: "username_required" }, { status: 400 });
    }
    const cacheKey = `user:${username.toLowerCase()}`;

    // 1) check cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.ts < CACHE_TTL_MS) {
      // return cached payload
      return NextResponse.json({ cached: true, ...cachedEntry.payload }, {
        status: 200,
        headers: { "Cache-Control": `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}` },
      });
    }

    // 2) dedupe in-flight requests
    if (inFlight.has(cacheKey)) {
      // return same promise
      const payload = await inFlight.get(cacheKey);
      return NextResponse.json({ cached: false, ...payload }, { status: 200 });
    }

    // create and store promise in inFlight
    const promise = (async (): Promise<Payload> => {
      try {
        // 2a) fetch user by username (Roblox)
        const userRes = await fetchWithRetries(
          `https://users.roblox.com/v1/users/by-username/${encodeURIComponent(username)}`,
          { method: "GET", headers: { "Accept": "application/json" } }
        );

        if (userRes.status === 404) {
          const err: any = new Error("user_not_found");
          err.type = "user_not_found";
          throw err;
        }

        const userJson = await userRes.json();
        const userId = userJson?.id;
        if (!userId) {
          const err: any = new Error("invalid_user_response");
          err.type = "invalid_upstream";
          throw err;
        }

        // 2b) details
        const detailsRes = await fetchWithRetries(`https://users.roblox.com/v1/users/${userId}`, { method: "GET" });
        const detailsJson = await detailsRes.json();

        // 2c) avatar thumbnail
        const thumbRes = await fetchWithRetries(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
          { method: "GET" }
        );
        const thumbJson = await thumbRes.json();
        const avatarUrl = thumbJson?.data?.[0]?.imageUrl ?? null;

        const payload: Payload = {
          id: userId,
          name: userJson.name,
          displayName: userJson.displayName ?? userJson.name,
          created: userJson.created ?? detailsJson?.created ?? null,
          avatarUrl,
          user: userJson,
          details: detailsJson,
        };

        // store in cache
        try {
          cache.set(cacheKey, { ts: Date.now(), payload });
        } catch {
          // ignore cache errors
        }

        return payload;
      } catch (err: any) {
        // propagate special types up
        throw err;
      } finally {
        // will be cleaned by outer finally
      }
    })();

    inFlight.set(cacheKey, promise);
    try {
      const payload = await promise;
      return NextResponse.json({ cached: false, ...payload }, {
        status: 200,
        headers: { "Cache-Control": `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}` },
      });
    } catch (err: any) {
      // if rate limited upstream, bubble 429 with info
      if (err?.type === "rate_limited" || err?.message === "rate_limited") {
        const retryAfter = err.retryAfter ?? 5;
        return NextResponse.json({ error: "roblox_rate_limited", retry_after_seconds: retryAfter }, { status: 429 });
      }
      if (err?.type === "user_not_found") {
        return NextResponse.json({ error: "user_not_found" }, { status: 404 });
      }
      console.error("roblox proxy error:", err);
      return NextResponse.json({ error: "upstream_error", message: String(err?.message ?? err) }, { status: 502 });
    } finally {
      inFlight.delete(cacheKey);
    }
  } catch (topErr: any) {
    console.error("roblox route top-level error:", topErr);
    return NextResponse.json({ error: "internal_error", message: String(topErr?.message ?? topErr) }, { status: 500 });
  }
}
