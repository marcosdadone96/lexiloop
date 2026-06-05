# LexiLoop

AI-powered simulator for official **English** (Cambridge / IELTS oral) and **German** (Goethe-Institut) exams.

## Live site

**https://lexiloop.netlify.app**

GitHub: https://github.com/marcosdadone96/lexiloop

Pushes to `main` auto-deploy via Netlify.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Full written exam: Reading, Listening, Writing, Speaking (Goethe + Cambridge) |
| `oral.html` | Oral mode with microphone: IELTS and Goethe-Zertifikat |

## Requirements

- Modern browser (Chrome or Edge recommended for speech recognition)
- **Server-side** Anthropic API key (users no longer paste keys in the browser)

## Environment variables

Set in **Netlify ? Site settings ? Environment variables** (and locally in `.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `CLAUDE_MODEL` | No | Default: `claude-sonnet-4-20250514` |
| `LEXILOOP_ALLOWED_ORIGINS` | No | Extra CORS origins, comma-separated |

Copy `.env.example` to `.env` for local development.

## Local development

**Easy option (Windows):** double-click `start.bat`

**Terminal:**

```powershell
cd c:\Users\marco\Desktop\MDR\lexiloop
copy .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm start
```

Open [http://localhost:5173](http://localhost:5173).

**With Netlify Functions (matches production):**

```powershell
npm run dev
```

## AI proxy

Claude calls go through `/.netlify/functions/claude-chat` — the API key never reaches the browser.

## Deployment

Hosted on Netlify (MechAssist team), linked to this GitHub repo.

**Automatic:** push to `main`.

**Manual (CLI):**

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'
netlify deploy --prod --dir .
```

Netlify admin: https://app.netlify.com/projects/lexiloop
