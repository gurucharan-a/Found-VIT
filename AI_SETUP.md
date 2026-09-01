# Found@VIT Chennai

## Gemini AI setup

This project uses a server-side Gemini integration so the API key is not exposed to the browser.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the key

Copy `.env.example` to `.env` and replace the placeholder with your Gemini API key.

```env
GEMINI_API_KEY=your_real_key
AI_PORT=3001
```

Do not commit `.env`.

### 3. Run the full application

```bash
npm run dev:full
```

The React application runs through Vite and the AI server runs on port 3001.

### 4. Test Gemini

Open the Create Post dialog, upload an item image, and select **Analyze Images**. The browser sends the image to the local server at `/api/analyze`; the server securely calls Gemini and returns structured JSON.

If the AI server is not running or Gemini is unavailable, the UI shows an error rather than exposing the API key.

## Security

- Never use `VITE_GEMINI_API_KEY` for a secret key.
- Keep `GEMINI_API_KEY` only in the server environment.
- Never commit `.env`.
- Use a restricted/auth Gemini key and rotate it if it is exposed.
