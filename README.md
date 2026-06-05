# LexiLoop

AI-powered simulator for official **English** (Cambridge / IELTS oral) and **German** (Goethe-Institut) exams.

## Live site

**https://lexiloop.netlify.app**

GitHub: https://github.com/marcosdadone96/lexiloop

## Features

- Full written exams (Reading, Listening, Writing, Speaking)
- Oral mode with microphone (IELTS & Goethe)
- Flashcard deck with spaced repetition
- **Accounts** with cloud sync (flashcards, history, saved exams)
- Secure Claude API proxy (no keys in the browser)

## Environment variables (Netlify)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key (secret) |
| `AUTH_JWT_SECRET` | Yes | Random string, min 16 chars (secret) |
| `CLAUDE_MODEL` | No | Default: `claude-sonnet-4-20250514` |
| `LEXILOOP_ALLOWED_ORIGINS` | No | Extra CORS origins, comma-separated |

Copy `.env.example` to `.env` for local development.

Generate a JWT secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

## Local development

```powershell
cd c:\Users\marco\Desktop\MDR\lexiloop
copy .env.example .env
npm install
npm start          # static + AI proxy
npm run dev        # full Netlify Functions (auth + sync)
```

## Deployment

Push to `main` auto-deploys on Netlify.

Netlify admin: https://app.netlify.com/projects/lexiloop
