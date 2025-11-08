import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const validKeys = [
      "4f9c8a2b-3d7e-4f1b-b0e5-6a2f9e8d0c3a",
      "EXEMPLO-CHAVE-001",
      "EXEMPLO-CHAVE-002",
      "EXEMPLO-CHAVE-003",
    ]

    // Trim and normalize the input key
    const inputKey = key.trim()

    // Check if the provided key is valid (exact match, case-sensitive)
    const isValid = validKeys.includes(inputKey)

    console.log("[v0] Key validation:", { inputKey, isValid })

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("[v0] Error validating key:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
