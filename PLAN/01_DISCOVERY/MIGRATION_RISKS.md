# LexiCoil — Migration Risks

## Critical risks

### R1 — Breaking live exam generation

**Risk:** Refactoring `generateExam()` / `ExamModulePrompts` degrades quality or breaks JSON merge.  
**Impact:** Production outage for core product value.  
**Mitigation:**
- Parity tests before cutover (`scripts/test-exam-e2e.mjs`, `test-one-chunk.mjs`)
- Strangler pattern: new pipeline behind feature flag
- Keep old path until new path passes same chunk keys and `isValidExam()` checks

### R2 — Monolith in index.html

**Risk:** ~3500 lines of exam logic inline; easy to miss call sites when extracting.  
**Impact:** Silent regressions in quick exam, personal exam, results.  
**Mitigation:**
- Inventory all `callAI(` usages before moving
- Extract to `js/engine/` one module at a time
- Do not delete old prompts until phase 06 validation complete

### R3 — Duplicated topic knowledge

**Risk:** `TOPICS_DE`, `TOPICS_EN`, `EXAM_TOPICS` diverge during migration.  
**Impact:** Wrong topics per level; pool/library mismatch.  
**Mitigation:** Consolidate into `knowledge/` in phase 04 first; single `pickTopic(spec)` API

### R4 — Pool and library keyed by lang code only

**Risk:** Today `lang` is `de`|`en`, not CEFR+provider composite.  
**Impact:** DELE B1 might collide with generic Spanish if keyed naively.  
**Mitigation:** Domain model must use `{ languageId, level, providerId? }` keys before Spanish launch

### R5 — Provider logic inside prompts

**Risk:** Removing `goethePrompts.js` without adapter layer loses format fidelity.  
**Impact:** Exams no longer match official task types.  
**Mitigation:** Phase 08 adapters extract **structure** from existing prompts into JSON; PromptBuilder uses structure, not prose templates

---

## Medium risks

### R6 — Netlify function timeout

Chunked generation already works around 26–60s limits. Centralized PromptBuilder must preserve chunk boundaries and `maxTokens` per module.

### R7 — Quota and pool economy

`appFeatures.js` ties quota to `examGeneration: true`. New generators must set ContentSpecification flags so quota rules stay consistent.

### R8 — Guest vs authenticated sync

User vocabulary feeds personalized exams. KnowledgeEngine merge must read same `deckForGoal()` data without duplicating vocab into knowledge base.

### R9 — oral.html isolation

Separate entry point bypasses app shell. Needs adapter hook or remain legacy until phase 07.

---

## Low risks

### R10 — Landing / SEO exam pages

`landing/src/app/exams/[slug]/` has Goethe slugs only. Spanish/DELE pages added later via same static params pattern.

### R11 — Build pipeline

New `knowledge/` folder must be copied in `assemble-dist.mjs` when served statically.

---

## Rollback strategy

1. Keep `js/goethePrompts.js`, `cambridgePrompts.js`, `examModulePrompts.js` until phase 06 sign-off.
2. Feature flag: `localStorage.lc_engine_v2` or URL `?engine=2`.
3. Each phase ends with migration report + acceptance checklist (see ACCEPTANCE_CRITERIA.txt).
