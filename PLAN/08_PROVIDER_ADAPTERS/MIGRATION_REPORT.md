# Phase 08 — Provider Adapters Migration Report

## Status: Complete

Provider-specific exam structure is now isolated in adapters. Prompts remain exclusively in `PromptBuilder` + `moduleInstructions`.

## New files

| File | Role |
|------|------|
| `js/engine/providers/baseProviderAdapter.js` | Shared adapt logic: chunk plan, exam structure, no-prompt guard |
| `js/engine/providers/goetheAdapter.js` | Goethe-Institut → German module ids (`lesen`, `horen`, …) |
| `js/engine/providers/cambridgeAdapter.js` | Cambridge → English module ids (`reading`, `listening`, …) |
| `js/engine/providers/deleAdapter.js` | DELE → Spanish module ids (same keys as English JSON) |
| `js/engine/providers/providerRegistry.js` | `apply(providerId, providerData, level, languageId)` |

## KnowledgeEngine changes

- Removed inline `buildChunkPlan` / `buildExamStructure` / `MODULE_EXPECT_KEYS`
- Provider merge delegated to `ProviderRegistry.apply()`
- `examStructure.board` populated from `knowledge/providers/{id}.json` `name` field

## `moduleInstructions.js`

- `officialMeta()` reads `spec.examStructure.board` instead of hardcoded provider switch

## Browser load order (`index.html`)

```
KnowledgeLoader → baseProviderAdapter → goethe/cambridge/dele adapters
  → providerRegistry → KnowledgeEngine → …
```

## Acceptance criteria (met)

Given `contentType=Exam`, `level=B1`, different providers:

1. `buildSpec()` → three specs with different `chunkPlan` / `examStructure`
2. `buildPrompt(spec)` → same function, different chunk plans and module keys
3. Provider JSON validated: no `prompt` / `prompts` keys

## Tests

```bash
npm run test:providers
npm run test:engine   # full pipeline including phase 08
```

## Legacy retained

When `localStorage.lc_engine_v2 = '0'`:

- `goethePrompts.js`, `cambridgePrompts.js`, `examModulePrompts.js` still load
- `generateExamChunksLegacy()` and `examPromptFor()` remain as fallback

Safe to remove legacy prompt files after production parity validation.

## Adding a new provider

1. Add `knowledge/providers/{id}.json` (structure only)
2. Add `{id}Adapter.js` extending `BaseProviderAdapter.adapt()`
3. Register in `providerRegistry.js`
4. Add domain entry in `lexicoilDomain.js` `PROVIDERS`

No new prompt files required.
