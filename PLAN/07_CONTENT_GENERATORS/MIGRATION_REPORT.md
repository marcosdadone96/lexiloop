# Phase 07 — Content Generators Migration Report

## Status: Complete

Phase 07 introduces AI execution layers that consume `ContentSpecification` objects produced by `KnowledgeEngine` and prompts from `PromptBuilder`.

## New files

| File | Role |
|------|------|
| `js/engine/generators/chunkRunner.js` | Shared chunked AI loop (retry, quota handling) |
| `js/engine/generators/ExamGenerator.js` | Full exams + personalized vocabulary exams |
| `js/engine/generators/ExerciseGenerator.js` | Quick modules (reading, listening, writing, gapfill) |
| `js/engine/generators/FlashcardGenerator.js` | Flashcard JSON from spec |
| `js/engine/generators/StoryGenerator.js` | CEFR story content |
| `js/engine/generators/DialogueGenerator.js` | Dialogue + comprehension |
| `js/engine/generators/ContentGenerator.js` | Routes `contentType` → generator |
| `js/engine/lexicoilEngine.js` | Browser facade (`LexiCoilEngine`) |

## Wired in `index.html`

1. Script tags for all generator modules + `lexicoilEngine.js` (after `PromptBuilder.js`).
2. `getGeneratorHooks()` — passes `callAI`, `parseExamJson`, `mergeExamParts`, etc. into generators.
3. `generateExamChunks()` — uses `LexiCoilEngine.generateExam()` when `lc_engine_v2 !== '0'`; legacy fallback preserved.
4. `startQuick()` — uses `LexiCoilEngine.generateQuickExercise()`.
5. `generatePersonalExam()` AI path — uses `LexiCoilEngine.generatePersonalExam()`.

## Pipeline

```
User action (exam / quick / personal)
  → LexiCoilEngine facade
  → KnowledgeEngine.buildSpec()
  → PromptBuilder.buildPrompt(spec)
  → ExamGenerator | ExerciseGenerator | ContentGenerator
  → callAI (claude-chat)
  → normalizeExam / renderExam
```

## Enhancements in this phase

- `KnowledgeEngine.buildSpec()` accepts optional `skills[]` for personalized exams.
- `PromptBuilder.buildVocabExamPrompt()` emits only selected module keys (`lesenParts`, `schreibenParts`, etc.).
- Story and Dialogue content types have single-prompt builders (not yet exposed in main UI).

## Feature flag

- `localStorage.lc_engine_v2 = '0'` forces legacy `ExamModulePrompts` / `buildQuickPrompt` / `buildVocabPrompt`.

## Tests

```bash
npm run test:generators
npm run test:engine   # includes domain, knowledge engine, prompt builder
```

## Legacy retained (Phase 08 cleanup)

- `goethePrompts.js`, `cambridgePrompts.js`, `examModulePrompts.js`
- `buildQuickPrompt()`, `buildVocabPrompt()`, `examPromptFor()` in `index.html`
- `TOPICS_DE` / `TOPICS_EN` topic arrays (duplicate of `knowledge/languages/`)

## Next: Phase 08 — Provider Adapters

Move provider-specific chunk expansion fully into `knowledge/providers/*.json` adapters; remove remaining prompt duplication from legacy JS files after production parity validation.
