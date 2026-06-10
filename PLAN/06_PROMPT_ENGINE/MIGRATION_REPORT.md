# Phase 06 — Prompt Engine — Migration Report

**Date:** June 2026  
**Status:** Complete (v2 active with legacy fallback)

---

## Delivered

| Artifact | Path |
|----------|------|
| Prompt shell | `js/engine/prompts/promptShell.js` |
| Module instructions | `js/engine/prompts/moduleInstructions.js` |
| **PromptBuilder** | `js/engine/prompts/PromptBuilder.js` |
| Tests | `scripts/test-prompt-builder.mjs` |
| App wiring | `index.html` → `resolveExamChunks()` |

## API

```javascript
const spec = await KnowledgeEngine.buildSpec({ ... });
const result = PromptBuilder.buildPrompt(spec);
// result.mode === 'chunks' | 'single'
// chunks: [{ expectKey, label, maxTokens, prompt }]
```

**Only allowed entry point:** `buildPrompt(specification)`

## Integration

`generateExamChunks()` now calls:

1. `KnowledgeEngine.buildSpec()` from `S.subject` / `S.level` / topic  
2. `PromptBuilder.buildPrompt(spec)` → chunks  
3. Same `callExamChunk()` loop as before  

**Fallback:** if engine fails or `localStorage.lc_engine_v2 === '0'`, uses `ExamModulePrompts.chunksFor()` (legacy).

## Chunk expansion

`spec.constraints.chunkPlan` modules are split by `parts` count:

- Goethe B1 → 12 chunks (5+4+1+2) from provider knowledge  
- Old `examModulePrompts` B1 → 10 chunks (manual grouping)  

Merge logic unchanged; multiple chunks per `expectKey` still concatenate.

## Not removed yet (intentional)

| Legacy file | Reason |
|-------------|--------|
| `js/goethePrompts.js` | Fallback + `examPromptFor()` still used elsewhere |
| `js/cambridgePrompts.js` | Same |
| `js/examModulePrompts.js` | Fallback chunks |
| `buildQuickPrompt()` in index.html | Phase 07 generators |
| `buildVocabPrompt()` | Phase 07 |

Deletion after production parity validation.

## Tests

```
npm run test:prompt-builder
npm run test:engine   # domain + knowledge + prompts
```

## Disable v2 in browser

```javascript
localStorage.setItem('lc_engine_v2', '0'); // force legacy prompts
localStorage.removeItem('lc_engine_v2');    // re-enable (default)
```

## Risks

| Risk | Mitigation |
|------|------------|
| Generic prompts vs hand-tuned B1 chunks | Monitor exam quality; tune `moduleInstructions.js` |
| 12 vs 10 chunks = more API calls | Acceptable; pool still applies |
| Spanish exams not in UI yet | Engine supports DELE when `S.subject === 'es'` |

## Next phase

**07_CONTENT_GENERATORS** — `ExamGenerator.generate(spec)` wrapping chunk loop; migrate `startQuick`, `generatePersonalExam`.
