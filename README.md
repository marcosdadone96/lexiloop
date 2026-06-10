# LexiCoil

AI-powered simulator for official **English** (Cambridge) and **German** (Goethe-Institut) exams.

## Live site

**https://www.lexicoil.com**

## Features

- Full written exams (Reading, Listening, Writing, Speaking)
- Shared exam pool (reduces AI costs ù pool hits do not use quota)
- Oral mode with microphone (IELTS & Goethe)
- Flashcard deck with spaced repetition and word-type filters
- **Accounts** with cloud sync (flashcards, history, saved exams)
- Server-side quota enforcement (guest / free / pro)
- Stripe Checkout for Pro upgrade (ù9.99 one-time)
- Secure Claude API proxy (no keys in the browser)
- PDF correction export

## Environment variables (Netlify)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key (secret) |
| `AUTH_JWT_SECRET` | Yes | Random string, min 32 chars recommended (secret) |
| `CLAUDE_MODEL` | No | Default: `claude-sonnet-4-6` |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key (`sk_live_...` or test key) |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signing secret (`whsec_...`) |
| `LEXICOIL_SITE_URL` | Recommended | Canonical URL: `https://www.lexicoil.com` |
| `LEXICOIL_ALLOWED_ORIGINS` | No | Extra CORS origins, comma-separated |

Copy `.env.example` to `.env` for local development.

Generate a JWT secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

## Local development

```powershell
cd c:\Users\marco\Desktop\MDR\lexicoil
copy .env.example .env
npm install
npm start          # static + AI proxy (quota not enforced ù use netlify dev for full stack)
npm run dev        # full Netlify Functions (auth, quota, pool, Stripe)
```

## Deployment (Netlify + www.lexicoil.com)

1. Connect the repo to a Netlify site and enable **Netlify Blobs** (Starter plan or higher).
2. **Domain setup** in Netlify ? Domain management:
   - Add custom domain `lexicoil.com`
   - Set primary domain to **`www.lexicoil.com`**
   - Netlify will provide DNS records (A/ALIAS for apex, CNAME for `www`)
   - At your registrar, point `lexicoil.com` and `www` to Netlify
   - `netlify.toml` redirects apex `lexicoil.com` ? `www.lexicoil.com`
3. Set environment variables (see table above). Minimum for production:
   - `ANTHROPIC_API_KEY`, `AUTH_JWT_SECRET`, `LEXICOIL_SITE_URL=https://www.lexicoil.com`
   - For payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
4. **Stripe** (Dashboard ? Developers ? Webhooks):
   - Endpoint URL: `https://www.lexicoil.com/.netlify/functions/stripe-webhook`
   - Event: `checkout.session.completed`
   - Copy signing secret ? `STRIPE_WEBHOOK_SECRET` in Netlify
   - Checkout success/cancel URLs use the request origin (your live domain)
5. Push to `main` ù Netlify auto-deploys.

## Quota limits

| Plan | Limit |
|------|-------|
| Guest (no account) | 2 exam generations per device/IP |
| Free (registered) | 2 exam generations per calendar month |
| Pro (paid) | 20 exam generations per calendar month |

**Counts toward quota:** new exams from the library or AI.  
**Does not count:** retaking a **saved exam** you already generated.

## Email (optional)

Set `RESEND_API_KEY` and `RESEND_FROM` in Netlify for Pro welcome emails and password reset (legacy JWT accounts). Supabase handles its own reset emails when Supabase auth is enabled.
