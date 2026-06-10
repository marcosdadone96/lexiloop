# LexiCoil — Current Architecture (Discovery)

**Date:** June 2026  
**Scope:** As-is audit before Universal CEFR Content Engine refactor  
**Code changes in this phase:** None

---

## 1. System overview

LexiCoil is a static-first SPA with Netlify serverless backend.

| Layer | Location | Role |
|-------|----------|------|
| Landing | `landing/` (Next.js static export) | Marketing, SEO, guest CTAs |
| App shell | `index.html` → `dist/app.html` | Goals, workspace, exam UI, ~5300 lines inline JS |
| Client modules | `js/*.js` | Auth, prompts, library, demo, Claude client |
| Static knowledge | `data/exams/*.json` | Curated German exam JSON (A1–C2) |
| Serverless API | `netlify/functions/` | AI proxy, auth, pool, Stripe, sync |
| Build | `scripts/assemble-dist.mjs` | Merges landing + app into `dist/` |

Production: https://lexicoil.com — landing at `/`, app at `/app.html`.

---

## 2. Product navigation (recent)

Goal Workspace model (implemented):

```
Dashboard (goal selection)
  → Workspace /#/workspace/{slug}
      → Exams | Vocabulary | Training | Progress
```

Auth, billing, quota, and sync are orthogonal to content generation.

---

## 3. Language logic (current)

| Code | Meaning today | Exam generation |
|------|---------------|-----------------|
| `de` | German / Goethe | Full support A1–C2 |
| `en` | English / Cambridge | Full support A1–C2 |
| `es` | Translation language for EN practice vocab only | **Not an exam language** |

- `S.subject` selects exam language (`de` | `en`).
- `S.vocabLang` defaults to `en` for DE practice, `es` for EN practice.
- `LEVELS` object in `index.html` defines CEFR cards per subject.
- **Spanish as L2 and DELE do not exist.**

---

## 4. Provider logic (current)

Provider knowledge is **embedded in prompts**, not isolated adapters.

| Provider | Files | Pattern |
|----------|-------|---------|
| Goethe | `js/goethePrompts.js`, chunks in `js/examModulePrompts.js` | `buildA1()`, `buildB1()`, … monolithic JSON-schema prompts |
| Cambridge | `js/cambridgePrompts.js`, chunks in `examModulePrompts.js` | Same pattern per level |
| DELE | — | **Not present** |

Routing in `index.html`:

```
examPromptFor(topic)
  → goethePromptFor()  if subject === 'de'
  → cambridgePromptFor() if subject === 'en'
  → buildPrompt() fallback
```

`ExamModulePrompts.chunksFor(subject, level, topic)` switches on **12 hardcoded** subject+level pairs, else `genericChunks()`.

**Violation of target rules:** Rules 5–6 (provider/level-specific prompts) — entire current prompt layer.

---

## 5. Prompt generation flow (current)

There is **no** Knowledge Engine or ContentSpecification. Multiple parallel paths:

### Path A — Full exam (chunked, preferred)

```
generateExam() [appFeatures.js]
  → pickExamTopic() / pool / library / demo
  → generateExamChunks() [index.html]
      → ExamModulePrompts.chunksFor(subject, level, topic)
      → callExamChunk() → callAI(prompt) per chunk
      → mergeExamParts() → S.examData
```

### Path B — Legacy single-shot prompt

```
goethePromptFor / cambridgePromptFor / buildPrompt()
  → callAI(one large prompt)
```

Used as fallback when chunk path unavailable; still level+provider specific.

### Path C — Quick module

```
startQuick(mod) → buildQuickPrompt(mod, topic) → callAI()
```

Inline in `index.html`; not provider-aware.

### Path D — Personalized / vocab exam

```
openExamConfigurator → generatePersonalExam()
  → buildVocabPrompt(words, skills) → callAI()
```

### Path E — Dictionary / speaking eval / oral

- `vocabClick()` inline dictionary prompt in `index.html`
- `buildSpeakingEvalPrompt()` in `appFeatures.js`
- `oral.html` separate page with own prompts

**None of these pass through a unified pipeline.**

---

## 6. AI integrations

| Component | File | Notes |
|-----------|------|-------|
| Client wrapper | `js/claudeClient.js` | `callAI(prompt, maxTokens, options)` → POST `/.netlify/functions/claude-chat` |
| Server proxy | `netlify/functions/claude-chat.js` | Anthropic API, quota check, `examGeneration` flag, model selection |
| Quota | `netlify/functions/lib/quotaLib.js` | Monthly limits per user |
| Pool | `netlify/functions/exam-pool.js` | Netlify Blobs; pre-generated exams by lang+level |

Models: `claude-haiku-4-5` default; exam generation can use dedicated model env.

---

## 7. Exam generators (current)

| Generator | Entry point | Source priority |
|-----------|-------------|-----------------|
| Full AI exam | `window.generateExam` | Demo → Library JSON → Pool → AI chunks |
| Demo | `goetheDemoExams.js`, `demoExams.js`, `guidedDemo.js` | Hardcoded |
| Library | `examLibrary.js` + `data/exams/de_*.json` | Static files (DE only) |
| Pool | `exam-pool.js` + `appFeatures.js` | Server blobs |
| Quick module | `startQuick()` | AI single prompt |
| Personal exam | `generatePersonalExam()` | AI from user deck |
| Vocab quiz | `startVE()` | Client-side from flashcards |
| Oral | `oral.html` | Separate AI flow |

Post-generation: `renderExam()`, scoring, `renderResults()`, PDF (`appFeatures.js`).

---

## 8. JSON knowledge sources

| Source | Path | Content |
|--------|------|---------|
| Exam library | `data/exams/de_{A1..C2}.json` | Full Goethe-format exams, topics, modules |
| Exam pool | Netlify Blobs `pool:{lang}:{level}:{id}` | AI-generated exams, index per lang+level |
| Topics (duplicate) | `TOPICS_DE`, `TOPICS_EN` in `index.html` | Generic topic lists |
| Topics (duplicate) | `EXAM_TOPICS` in `appFeatures.js` | Per-level topic lists |
| Demo exams | `js/goetheDemoExams.js`, `js/demoExams.js` | Inline exam objects |
| User vocabulary | `localStorage` / Supabase sync | Flashcards, not shared knowledge base |
| CEFR level metadata | `LEVELS` in `index.html` | UI labels, times — not canonical CEFR |

**No** `knowledge/cefr/`, **no** grammar catalogs, **no** provider structure JSON.

---

## 9. Key file sizes and coupling

| File | Approx. role | Coupling risk |
|------|--------------|---------------|
| `index.html` | UI + exam orchestration + prompts + merge + render | **Critical monolith** |
| `js/examModulePrompts.js` | ~540 lines, all chunk prompts | Level × provider matrix |
| `js/goethePrompts.js` | ~620 lines | Duplicate structure vs chunks |
| `js/cambridgePrompts.js` | Large | Same |
| `js/appFeatures.js` | generateExam, pool, Stripe, PDF | Extends `window.*` from index |

---

## 10. Gap summary vs PROJECT_VISION

| Target | Current state |
|--------|---------------|
| Languages DE, EN, ES | DE, EN only (ES = translation) |
| Providers Goethe, Cambridge, DELE | Goethe, Cambridge; DELE missing |
| Content types (11) | Exams, flashcards, quiz; rest missing |
| CEFR-first | Level hardcoded in prompts |
| Provider adapters only | Prompts **are** provider logic |
| Single knowledge base | Topics duplicated; no CEFR JSON |
| Pipeline KE → Spec → Prompt → LLM | Direct prompt → LLM everywhere |

---

## 11. Recommended migration order

See `PLAN/MASTER_REFACTOR_PROMPT.txt` and folders `02`–`08`. Do not implement generators until `04_KNOWLEDGE_BASE` and `05_KNOWLEDGE_ENGINE` exist.
