# Found@VIT Chennai — Groq + Qwen AI setup

The application uses a server-side Groq integration with a Qwen multimodal model for item-image analysis. The browser never receives the API key.

## 1. Install dependencies

```bash
npm install
```

If you are updating from the older Gemini version, run:

```bash
npm uninstall @google/genai
npm install groq-sdk
```

## 2. Create .env

Copy `.env.example` to `.env`.

```env
GROQ_API_KEY=your_real_groq_key
GROQ_MODEL=qwen/qwen3.6-27b
AI_PORT=3001
```

Never commit `.env`.

## 3. Start the full application

```bash
npm run dev:full
```

You should see:

```text
AI server running on http://localhost:3001
AI provider: Groq | Model: qwen/qwen3.6-27b
VITE ...
```

## 4. Test the server

Open:

`http://localhost:3001/api/health`

Expected response:

```json
{
  "ok": true,
  "provider": "Groq",
  "model": "qwen/qwen3.6-27b",
  "groqConfigured": true
}
```

## How analysis works

1. The user uploads up to four item images.
2. The React app sends the images to `/api/analyze`.
3. The Express server securely sends them to Groq.
4. Groq runs the configured Qwen vision model.
5. The model returns structured JSON containing category, item, color, features, confidence, description, and suitability flags.
6. The Create Post window displays the result.

## Security

- Keep `GROQ_API_KEY` only in `.env`.
- Never use a browser variable such as `VITE_GROQ_API_KEY` for a secret.
- Never commit your real key to GitHub.
- Rotate a key immediately if it is accidentally exposed.

## Model

The default is `qwen/qwen3.6-27b`, a vision-capable Qwen model available through Groq. You can change `GROQ_MODEL` in `.env` if your Groq account supports another compatible vision model.
