# Found@VIT

A hyperlocal lost-and-found feed for the VIT Chennai campus. Students post items they've lost or found, tag them by campus location, and use AI-assisted image analysis to auto-fill item details and speed up matching.

![Powered by Groq + Qwen Vision](https://img.shields.io/badge/AI-Groq%20%2B%20Qwen%20Vision-6d28d9)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Lost / Found feed** — browse and filter posts by type (lost/found), campus location, and free-text search
- **AI-assisted tagging** — upload up to 4 photos of an item and a server-side Groq + Qwen vision model extracts category, color, brand, material, and other visible features automatically
- **Built-in moderation** — the same AI pass flags uploads that don't clearly show a lost/found item
- **Smart matching** — text search scores posts by title, description, AI-extracted attributes, and location, with a substring fallback if nothing scores well
- **20+ VIT campus locations** — pre-populated location list (academic blocks, hostels, food courts, etc.), easy to edit
- **Light/dark theme**, contact modal, and post detail view
- **No database required** — posts persist to `localStorage` for demo purposes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS, shadcn/ui, Radix UI primitives |
| Icons | lucide-react |
| Backend | Express 5 (Node.js) |
| AI | Groq API running a Qwen vision-language model |
| Linting | oxlint |

## Project Structure

```
Found-VIT-main/
├── server/
│   └── index.js          # Express server — proxies image analysis to Groq (keeps API key server-side)
├── src/
│   ├── components/       # UI components (Header, PostCard, PostDetail, CreatePostDialog, ContactModal, ui/*)
│   ├── data/
│   │   ├── locations.ts  # VIT campus locations
│   │   └── samplePosts.ts# Seed/demo posts
│   ├── services/
│   │   └── groq.ts       # Client-side calls to /api/analyze + text-matching logic
│   ├── types/             # Shared TypeScript types (Post, GeminiAnalysis, ModerationResult, etc.)
│   ├── App.tsx            # Main app shell, feed, filters, state
│   └── main.tsx
├── public/
│   └── images/            # Drop sample item photos here
├── AI_SETUP.md            # Detailed Groq/Qwen setup guide
├── .env.example
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Groq API key](https://console.groq.com/) (optional — the app runs with mock/sample data without one, but AI image analysis requires it)

### Installation

```bash
git clone <your-repo-url>
cd Found-VIT-main
npm install
```

### Configure environment variables

Copy the example env file and add your Groq key:

```bash
cp .env.example .env
```

```env
GROQ_API_KEY=your_real_groq_key
GROQ_MODEL=qwen/qwen3.6-27b
AI_PORT=3001
```

Never commit your real `.env` file — it's already in `.gitignore`.

### Run the app

To run the frontend and the AI server together:

```bash
npm run dev:full
```

Or run them separately:

```bash
npm run server   # Express AI server on http://localhost:3001
npm run dev      # Vite dev server (frontend)
```

Then open the Vite dev URL printed in your terminal (typically `http://localhost:5173`).

### Verify the AI server

Visit `http://localhost:3001/api/health` — you should see:

```json
{
  "ok": true,
  "provider": "Groq",
  "model": "qwen/qwen3.6-27b",
  "groqConfigured": true
}
```

See [`AI_SETUP.md`](./AI_SETUP.md) for full details on how the image-analysis pipeline works.

## Other Scripts

```bash
npm run build     # Type-check and build for production
npm run preview   # Preview the production build locally
npm run lint       # Run oxlint
```

## Customization

- **Campus locations** — edit `src/data/locations.ts` to add/remove locations for your own campus
- **Sample/demo posts** — edit `src/data/samplePosts.ts`; drop matching images into `public/images/` as `sample-1.jpg`, `sample-2.jpg`, etc.
- **AI model** — change `GROQ_MODEL` in `.env` to any vision-capable model your Groq account supports

## Security Notes

- The Groq API key lives only in the server's `.env` file and is never exposed to the browser
- Image analysis requests are proxied through the Express server (`/api/analyze`)
- Rotate your Groq key immediately if it's ever accidentally committed or exposed

## License

MIT — see [`LICENSE`](./LICENSE) for details.
