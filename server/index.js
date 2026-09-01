import "dotenv/config"
import express from "express"
import cors from "cors"
import Groq from "groq-sdk"

const app = express()
const port = Number(process.env.AI_PORT || 3001)

app.use(cors())
app.use(express.json({ limit: "30mb" }))

const model = process.env.GROQ_MODEL || "qwen/qwen3.6-27b"

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    provider: "Groq",
    model,
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
  })
})

app.post("/api/analyze", async (req, res) => {
  console.log("Received Groq/Qwen analysis request")

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ error: "Groq is not configured. Add GROQ_API_KEY to .env." })
    }

    const images = Array.isArray(req.body?.images) ? req.body.images.slice(0, 4) : []
    const hint = String(req.body?.hint || "").slice(0, 2000)

    if (!images.length) {
      return res.status(400).json({ error: "At least one image is required." })
    }

    const validImages = images.filter((value) =>
      /^data:image\/(png|jpe?g|webp);base64,/i.test(String(value || ""))
    )

    if (!validImages.length) {
      return res.status(400).json({ error: "Upload valid PNG, JPG, or WEBP images." })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `Analyze these lost-and-found item photos for a VIT Chennai campus application.

Return ONLY a valid JSON object with exactly these top-level fields:
{
  "category": "string",
  "item": "string",
  "color": "string",
  "brand": "string or empty string",
  "material": "string or empty string",
  "characteristics": ["short visible feature"],
  "confidence": 0,
  "description": "short factual description",
  "moderation": {
    "approved": true,
    "reason": "short reason",
    "flags": ["string"]
  }
}

Rules:
- Identify only what is reasonably visible in the uploaded images.
- Do not identify or name people.
- Do not infer sensitive personal information.
- If the image does not clearly show a lost/found item, set moderation.approved to false.
- Keep the description concise and useful for matching the item later.
- confidence must be a number from 0 to 100.
- characteristics should contain 0 to 6 concise visible features.
- User-provided hint: ${hint || "None"}`

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a precise visual item analysis assistant. Output valid JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...validImages.map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          ],
        },
      ],
      response_format: { type: "json_object" },
      reasoning_effort: "none",
      temperature: 0.2,
      max_completion_tokens: 1000,
    })

    const text = completion.choices[0]?.message?.content
    if (!text) throw new Error("Groq returned an empty analysis.")

    const parsed = JSON.parse(text)

    res.json({
      category: String(parsed.category || "Unknown"),
      item: String(parsed.item || "Item"),
      color: String(parsed.color || "Unknown"),
      brand: String(parsed.brand || ""),
      material: String(parsed.material || ""),
      characteristics: Array.isArray(parsed.characteristics) ? parsed.characteristics.slice(0, 6).map(String) : [],
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
      description: String(parsed.description || ""),
      moderation: {
        approved: Boolean(parsed.moderation?.approved),
        reason: parsed.moderation?.reason ? String(parsed.moderation.reason) : undefined,
        flags: Array.isArray(parsed.moderation?.flags) ? parsed.moderation.flags.map(String) : [],
      },
    })
  } catch (error) {
    console.error("Groq/Qwen analysis error:", error?.message || error)
    res.status(500).json({
      error: error?.message || "Groq/Qwen analysis failed. Please try again.",
    })
  }
})

app.listen(port, () => {
  console.log(`AI server running on http://localhost:${port}`)
  console.log(`AI provider: Groq | Model: ${model}`)
})
