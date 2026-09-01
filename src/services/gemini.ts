import type { GeminiAnalysis, ModerationResult } from "@/types"

// ===== CONFIG =====
// Set your Gemini API key in .env as VITE_GEMINI_API_KEY to enable real Vision calls.
// If empty, the app uses a realistic mock so the demo works offline.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const MODEL = "gemini-1.5-flash" // vision capable

export interface AnalysisResult {
  analysis: GeminiAnalysis
  moderation: ModerationResult
}

// --- Real Gemini Vision call ---
async function analyzeWithGemini(imagesBase64: string[], promptHint?: string): Promise<AnalysisResult> {
  if (!API_KEY) throw new Error("No API key")

  const prompt = `
You are moderation + vision for Found@VIT, a campus lost & found.
Analyze the provided image(s) of a lost/found item.

Return STRICT JSON only, no markdown, with this shape:
{
  "category": "string (e.g. Electronics, Bag, Wallet, Keys, Bottle, Eyewear, Accessories, Book, etc)",
  "item": "specific item name",
  "color": "dominant color(s)",
  "brand": "brand if visible else 'Unknown'",
  "material": "material if discernible",
  "characteristics": ["3-5 visible characteristics"],
  "confidence": 0-100,
  "description": "1 sentence description",
  "moderation": { "approved": boolean, "reason": "if rejected, short reason", "flags": ["flag strings"] }
}

AUTOMODERATION RULES - REJECT if:
- Image contains people / faces / selfies (flag: "contains_people")
- Inappropriate / NSFW / violent content (flag: "inappropriate")
- Content unrelated to lost/found items — e.g. memes, screenshots, pets without item, food plating only, landscapes (flag: "unrelated")
Otherwise approve.
Hint from user description: "${promptHint ?? ""}"
`

  const parts: any[] = [{ text: prompt }]
  for (const b64 of imagesBase64) {
    const clean = b64.includes(",") ? b64.split(",")[1] : b64
    parts.push({ inline_data: { mime_type: "image/jpeg", data: clean } })
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" } }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Gemini API ${res.status}: ${txt.slice(0,300)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Empty Gemini response")
  const parsed = JSON.parse(text)
  const analysis: GeminiAnalysis = {
    category: parsed.category ?? "Unknown",
    item: parsed.item ?? "Item",
    color: parsed.color ?? "Unknown",
    brand: parsed.brand,
    material: parsed.material,
    characteristics: parsed.characteristics ?? [],
    confidence: Math.round(parsed.confidence ?? 85),
    description: parsed.description ?? "",
  }
  const moderation: ModerationResult = {
    approved: parsed.moderation?.approved ?? true,
    reason: parsed.moderation?.reason,
    flags: parsed.moderation?.flags ?? [],
  }
  return { analysis, moderation }
}

// --- Realistic mock for demo / offline ---
const MOCK_CATALOG: Array<Omit<GeminiAnalysis, "confidence"> & { confidence: [number,number]}> = [
  { category: "Electronics", item: "Wireless Earbuds Case", color: "White", brand: "Apple", material: "Matte plastic", characteristics: ["Compact case", "LED indicator", "Light scratches"], description: "White wireless earbuds charging case.", confidence: [88,97] },
  { category: "Bag", item: "Backpack", color: "Navy Blue", brand: "Wildcraft", material: "Polyester", characteristics: ["Front zip pocket", "Padded straps", "Water bottle holder"], description: "Navy blue backpack with padded straps.", confidence: [85,94] },
  { category: "Wallet", item: "Leather Wallet", color: "Brown", brand: "Unknown", material: "Leather", characteristics: ["Bifold design", "Card slots", "Worn edges"], description: "Brown bifold leather wallet.", confidence: [86,93] },
  { category: "Bottle / Flask", item: "Water Bottle", color: "Matte Black", brand: "Milton", material: "Stainless steel", characteristics: ["Insulated", "Screw lid", "Dent on base"], description: "Matte black insulated water bottle.", confidence: [84,92] },
  { category: "Accessories", item: "Wrist Watch", color: "Silver", brand: "Titan", material: "Metal", characteristics: ["Analog dial", "Metal bracelet", "Date window"], description: "Silver analog wrist watch with metal strap.", confidence: [88,96] },
  { category: "Keys", item: "Key Bunch", color: "Silver", brand: "Unknown", material: "Metal", characteristics: ["3 keys", "Keychain ring", "Blue tag"], description: "Set of silver keys with a blue keychain.", confidence: [82,91] },
  { category: "Eyewear", item: "Spectacles", color: "Black", brand: "Unknown", material: "Acetate", characteristics: ["Round frame", "Clear lenses", "Lightweight"], description: "Black round-frame spectacles.", confidence: [87,93] },
  { category: "Book", item: "Textbook", color: "White / Blue", brand: "Pearson", material: "Paper", characteristics: ["Soft cover", "Highlighted pages", "VIT stamp"], description: "White textbook with blue cover.", confidence: [80,90] },
]

function mockAnalyze(fileNames: string[], hint?: string): AnalysisResult {
  const lower = (hint ?? fileNames.join(" ") ?? "").toLowerCase()
  // simple keyword boost
  let pick = MOCK_CATALOG[Math.floor(Math.random()*MOCK_CATALOG.length)]
  if (lower.includes("watch")) pick = MOCK_CATALOG[4]
  if (lower.includes("wallet")) pick = MOCK_CATALOG[2]
  if (lower.includes("bottle")||lower.includes("flask")) pick = MOCK_CATALOG[3]
  if (lower.includes("airpod")||lower.includes("earbud")) pick = MOCK_CATALOG[0]
  if (lower.includes("bag")||lower.includes("backpack")) pick = MOCK_CATALOG[1]
  if (lower.includes("key")) pick = MOCK_CATALOG[5]
  if (lower.includes("glass")||lower.includes("spectacle")) pick = MOCK_CATALOG[6]

  // moderation heuristics for demo
  const flags: string[] = []
  let approved = true
  let reason: string|undefined
  if (lower.includes("person")||lower.includes("selfie")||lower.includes("face")) { approved=false; flags.push("contains_people"); reason="Image appears to contain people/faces. Please upload only the item." }
  else if (lower.includes("meme")||lower.includes("screenshot")||lower.includes("inappropriate")||lower.includes("nsfw")) { approved=false; flags.push(lower.includes("meme")?"unrelated":"inappropriate"); reason= lower.includes("meme")||lower.includes("screenshot") ? "Content unrelated to lost/found items." : "Inappropriate content detected." }

  // also random 3% unrelated rejection for demo realism - but deterministic via hint hash? keep low
  const [lo,hi] = pick.confidence
  const analysis: GeminiAnalysis = { category: pick.category, item: pick.item, color: pick.color, brand: pick.brand, material: pick.material, characteristics: pick.characteristics, confidence: Math.floor(lo + Math.random()*(hi-lo)), description: pick.description }
  return { analysis, moderation: { approved, reason, flags } }
}

export async function analyzeImages(opts: { files: File[]; base64s: string[]; hint?: string; onProgress?: (p:string)=>void }): Promise<AnalysisResult> {
  const { files, base64s, hint, onProgress } = opts
  onProgress?.("Analyzing with Gemini Vision…")
  await new Promise(r=>setTimeout(r, 900)) // UX delay for mock

  if (API_KEY) {
    try {
      onProgress?.("Contacting Gemini API…")
      return await analyzeWithGemini(base64s, hint)
    } catch (e:any) {
      console.warn("Gemini API failed, falling back to mock:", e?.message)
      onProgress?.("Gemini unavailable — using demo analysis")
      await new Promise(r=>setTimeout(r, 400))
      return mockAnalyze(files.map(f=>f.name), hint)
    }
  }
  return mockAnalyze(files.map(f=>f.name), hint)
}

// simple semantic search mock using analysis + title matching
export function scoreMatch(query: string, post: { title:string; description:string; analysis?: GeminiAnalysis; locationLabel:string }): number {
  if (!query.trim()) return 1
  const q = query.toLowerCase().split(/\s+/).filter(Boolean)
  const hay = [post.title, post.description, post.analysis?.category, post.analysis?.item, post.analysis?.color, post.analysis?.brand, ...(post.analysis?.characteristics??[]), post.locationLabel].join(" ").toLowerCase()
  let score=0
  for (const tok of q) if (hay.includes(tok)) score+=1
  // bonus for exact item
  if (post.analysis?.item && q.some(t=> post.analysis!.item.toLowerCase().includes(t))) score+=0.5
  return score
}
