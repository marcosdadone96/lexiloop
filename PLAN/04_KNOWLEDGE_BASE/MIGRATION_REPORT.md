# Phase 04 — Knowledge Base — Migration Report

**Date:** June 2026  
**Status:** Complete  
**Content generation:** None (data + validation only)

---

## Delivered

### Directory structure

```
knowledge/
  cefr/          A1.json … C2.json
  languages/     german.json, english.json, spanish.json
  providers/     goethe.json, cambridge.json, dele.json
  schemas/       cefr-level, language, provider JSON Schema
```

### Loader (read-only)

- `js/engine/knowledge/KnowledgeLoader.js` — browser fetch from `/knowledge/`

### Validation

- `scripts/validate-knowledge.mjs` — ajv validation + provider/language cross-check
- `npm run validate:knowledge`

### Build

- `scripts/assemble-dist.mjs` copies `knowledge/` to `dist/`

---

## Data sources migrated

| New canonical source | Replaces (eventually) |
|----------------------|------------------------|
| `languages/german.json` → `topics` | `EXAM_TOPICS.de` in `appFeatures.js`, `TOPICS_DE` in `index.html` |
| `languages/english.json` → `topics` | `EXAM_TOPICS.en`, `TOPICS_EN` |
| `languages/spanish.json` | **New** — DELE preparation |
| `providers/goethe.json` | Module timing/structure from `data/exams/de_B1.json` + `LEVELS.de` |
| `providers/cambridge.json` | `LEVELS.en` + Cambridge format knowledge |
| `providers/dele.json` | **New** |
| `cefr/*.json` | **New** — single CEFR source (Rule 2) |

**Legacy files not deleted yet** — parallel operation until phase 05–06 cutover.

---

## Provider files contain

- structure (modules, parts)
- timing (minutes)
- scoring (passPercent, scale)
- task types

**Zero prompt strings** (Rule 4, 5).

---

## Tests

```
npm run validate:knowledge
```

All 15 JSON files pass schema validation.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Topics still duplicated in app until KnowledgeEngine | Phase 05 merge; then deprecate `EXAM_TOPICS` |
| CEFR can-dos are summaries not official full descriptors | Expand from CEFR official inventory later without schema break |
| DELE/Cambridge timings approximate | Refine from official handbooks; structure is adapter-ready |

---

## Next phase

**05_KNOWLEDGE_ENGINE** — `KnowledgeEngine.buildSpec({ language, level, provider, contentType, targetWords })` merging cefr + language + provider into `ContentSpecification`.
