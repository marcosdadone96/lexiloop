# Phase 03 — Domain Model — Migration Report

**Date:** June 2026  
**Status:** Complete  
**Code changes:** Yes (new modules only; no changes to exam generation)

---

## Delivered

| Artifact | Path |
|----------|------|
| Domain module | `js/engine/domain/lexicoilDomain.js` |
| Smoke test | `scripts/test-domain.mjs` |
| npm script | `npm run test:domain` |

## Domain surface

- `CEFR_LEVELS`, `LANGUAGES`, `PROVIDERS`, `CONTENT_TYPES` (frozen registries)
- `createContentSpecification(partial)` — factory with validation
- `validateContentSpecification(spec)` — non-throwing validator
- Normalizers: `normalizeLanguageId`, `normalizeProviderId`, `normalizeCefrLevel`, `normalizeContentType`
- Bridges: `languageFromSubjectCode('de')` → `'german'` for legacy `S.subject`

## Invariants enforced

1. `language` + `level` + `contentType` required
2. `Exam` content type requires `provider`
3. Provider must support the language (e.g. goethe ↔ german only)
4. `metadata.version` set to engine `1.0.0`

## Not in scope (deferred)

- KnowledgeEngine merge (phase 05)
- Wiring into `index.html` / `generateExam()` (phase 06–07)
- TypeScript definitions (browser uses JSDoc)

## Tests

```
npm run test:domain
```

## Risks

- None for production: module is not loaded by app yet.
- When wiring, map `S.subject`/`S.level` through `languageFromSubjectCode` + `createContentSpecification`.

## Next phase

**05_KNOWLEDGE_ENGINE** — implement `KnowledgeEngine.buildSpec()` using `knowledge/` JSON + `LexiCoilDomain.createContentSpecification`.
