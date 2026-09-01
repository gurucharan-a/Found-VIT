import type { GeminiAnalysis, ModerationResult } from "@/types"

export interface AnalysisResult {
  analysis: GeminiAnalysis
  moderation: ModerationResult
}

export async function analyzeImages(opts: {
  files: File[]
  base64s: string[]
  hint?: string
  onProgress?: (p: string) => void
}): Promise<AnalysisResult> {
  const { base64s, hint, onProgress } = opts
  onProgress?.("Analyzing images with Groq + Qwen…")

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: base64s, hint }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || "Groq/Qwen analysis failed.")
  }

  const analysis: GeminiAnalysis = {
    category: payload.category ?? "Unknown",
    item: payload.item ?? "Item",
    color: payload.color ?? "Unknown",
    brand: payload.brand,
    material: payload.material,
    characteristics: payload.characteristics ?? [],
    confidence: Math.round(Number(payload.confidence ?? 0)),
    description: payload.description ?? "",
  }

  const moderation: ModerationResult = {
    approved: Boolean(payload.moderation?.approved),
    reason: payload.moderation?.reason,
    flags: payload.moderation?.flags ?? [],
  }

  onProgress?.("Analysis complete")
  return { analysis, moderation }
}

export function scoreMatch(query: string, post: { title: string; description: string; analysis?: GeminiAnalysis; locationLabel: string }): number {
  if (!query.trim()) return 1
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const haystack = [
    post.title,
    post.description,
    post.analysis?.category,
    post.analysis?.item,
    post.analysis?.color,
    post.analysis?.brand,
    ...(post.analysis?.characteristics ?? []),
    post.locationLabel,
  ].join(" ").toLowerCase()

  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0)
}
