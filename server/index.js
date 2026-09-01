import "dotenv/config"
import express from "express"
import cors from "cors"
import { GoogleGenAI } from "@google/genai"

const app = express()
const port = Number(process.env.AI_PORT || 3001)

app.use(cors())
app.use(express.json({ limit: "15mb" }))

function parseDataUrl(value) {
  const match = String(value || "").match(/^data:(.+?);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], data: match[2] }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) })
})

app.post("/api/analyze", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini is not configured on the server." })
    }

    const images = Array.isArray(req.body?.images) ? req.body.images.slice(0, 4) : []
    const hint = String(req.body?.hint || "").slice(0, 2000)
    if (!images.length) return res.status(400).json({ error: "At least one image is required." })

    const imageParts = images.map(parseDataUrl).filter(Boolean)
    if (!imageParts.length) return res.status(400).json({ error: "Invalid image data." })

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const prompt = `You analyze lost-and-found item photos for a campus application. Return only JSON matching this schema. Identify visible item properties conservatively. Do not identify people. If an image mainly contains a person, face, explicit content, or is unrelated to a lost/found item, set moderation.approved to false. User hint: ${hint}`

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          ...imageParts.map((image) => ({ inlineData: image }))
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            item: { type: "string" },
            color: { type: "string" },
            brand: { type: "string" },
            material: { type: "string" },
            characteristics: { type: "array", items: { type: "string" } },
            confidence: { type: "number" },
            description: { type: "string" },
            moderation: {
              type: "object",
              properties: {
                approved: { type: "boolean" },
                reason: { type: "string" },
                flags: { type: "array", items: { type: "string" } }
              },
              required: ["approved", "flags"]
            }
          },
          required: ["category", "item", "color", "characteristics", "confidence", "description", "moderation"]
        }
      }
    })

    const text = response.text
    if (!text) throw new Error("Gemini returned an empty response.")
    res.json(JSON.parse(text))
  } catch (error) {
    console.error("Gemini analysis error:", error)
    res.status(500).json({ error: "AI analysis failed. Please try again." })
  }
})

app.listen(port, () => console.log(`AI server running on http://localhost:${port}`))
