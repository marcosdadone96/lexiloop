# LexiLoop

AI-powered simulator for official **English** (Cambridge / IELTS oral) and **German** (Goethe-Institut) exams.

## Live site

**https://lexiloop-exams.netlify.app**

## Pages

| File | Description |
|------|-------------|
| `index.html` | Full written exam: Reading, Listening, Writing, Speaking (Goethe + Cambridge) |
| `oral.html` | Oral mode with microphone: IELTS and Goethe-Zertifikat |

## Requirements

- Modern browser (Chrome or Edge recommended for speech recognition)
- [Anthropic](https://console.anthropic.com/settings/keys) API key (stored in `localStorage`)

## Local development

**Easy option (Windows):** double-click `start.bat` — starts the server and opens your browser.

**Terminal:**

```powershell
cd c:\Users\marco\Desktop\MDR\lexiloop
npm start
```

Open [http://localhost:5173](http://localhost:5173).

> Do not open `index.html` directly from the file explorer (`file://`). The app needs a local HTTP server.

## Deployment

Hosted on Netlify (MechAssist team). Redeploy after changes:

```powershell
cd c:\Users\marco\Desktop\MDR\lexiloop
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'   # only if Netlify CLI hits TLS errors on your network
netlify deploy --prod --dir .
```

Or run `.\deploy.ps1` after `netlify login`.

Netlify admin: https://app.netlify.com/projects/lexiloop-exams
