// app/api/roblox-user/route.ts
// Rota segura e mockada para perfil Roblox — NÃO chama APIs externas.
// Gera resposta determinística a partir do username:
// - id (hash number), displayName, created (data fictícia), avatarUrl (data URI SVG).
// Útil para garantir que o site nunca quebre por causa de CORS/limites/upstream.

function hashString(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pickColor(seedNum: number) {
  // gera cor HSL baseada em seed
  const h = seedNum % 360;
  const s = 60 + (seedNum % 20); // 60-79
  const l = 40 + (seedNum % 10); // 40-49
  return `hsl(${h} ${s}% ${l}%)`;
}

function capitalize(name: string) {
  if (!name) return name;
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isoPastDateFromSeed(seed: number) {
  // cria data no passado entre 2010 e 2021 dependendo do seed
  const start = new Date(2010, 0, 1).getTime();
  const end = new Date(2021, 11, 31).getTime();
  const r = (seed % 100000) / 100000;
  const t = Math.floor(start + r * (end - start));
  return new Date(t).toISOString();
}

function svgAvatarDataUri(username: string) {
  const seed = hashString(username);
  const bg = pickColor(seed);
  const fg = "#0f1724"; // cor do texto/ícone
  const letter = (username && username[0] ? username[0].toUpperCase() : "?");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'>
    <rect width='100%' height='100%' rx='24' fill='${bg}' />
    <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, system-ui, Arial' font-size='64' fill='${fg}' font-weight='700'>${letter}</text>
  </svg>`;
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("username") || "").trim();

    if (!username) {
      return new Response(JSON.stringify({ error: "username_required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const seed = hashString(username.toLowerCase());
    const payload = {
      id: seed >>> 0,
      name: username.toLowerCase().replace(/\s+/g, ""),
      displayName: capitalize(username),
      created: isoPastDateFromSeed(seed),
      avatarUrl: svgAvatarDataUri(username),
      // meta: indica que é mock
      mock: true,
      note: "Resposta mockada e segura — sem chamadas externas",
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // cache curto
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
