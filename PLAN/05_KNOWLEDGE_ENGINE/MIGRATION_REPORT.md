# Phase 05 — Knowledge Engine — Migration Report

**Date:** June 2026  
**Status:** Complete  
**LLM / prompts:** Not used

---

## Delivered

| Artifact | Path |
|----------|------|
| KnowledgeEngine | `js/engine/knowledge/KnowledgeEngine.js` |
| Node-capable loader | `js/engine/knowledge/KnowledgeLoader.js` (fs + fetch) |
| Tests | `scripts/test-knowledge-engine.mjs` |
| npm script | `npm run test:knowledge-engine` |

## API

```javascript
const spec = await KnowledgeEngine.buildSpec({
  language: 'German',   // or de, german
  level: 'B1',
  provider: 'Goethe',   // optional; auto-inferred for Exam
  contentType: 'Exam',  // default Exam
  targetWords: [],      // optional user vocabulary
  topic: '...',         // optional; else random from knowledge
});
// → ContentSpecification (validated via LexiCoilDomain)
```

## Merge rules implemented

1. **CEFR** → `canDoStatements`, `grammarExpectations` (merged), `constraints` text lengths, `vocabularySize`
2. **Language** → grammar topic labels, `vocabularyDomains`, `topics` (for topic pick)
3. **Provider** → `examStructure`, `constraints.chunkPlan` (module → expectKey mapping)
4. **targetWords** → appended; never replaces canonical grammar/topics
5. **Generic exercises** (`VocabularyExercise`, etc.) → CEFR + language only; provider ignored

## Provider → chunk keys

| Language | Module ids | JSON keys |
|----------|------------|-----------|
| german | lesen, horen, … | lesenParts, horenParts, … |
| english / spanish | reading, listening, … | readingParts, listeningParts, … |

## Tests (all pass)

- Goethe B1 Exam (German input aliases)
- Cambridge B1 Exam
- DELE B1 Exam (Spanish + es code)
- VocabularyExercise + targetWords
- Auto provider inference (`de` + Exam → goethe)

```
npm run test:knowledge-engine
```

## Not wired to production yet

- `generateExam()` still uses `ExamModulePrompts` + `pickExamTopic`
- `index.html` does not load engine scripts
- Next: **Phase 06 PromptBuilder** consumes `ContentSpecification`

## Risks

| Risk | Mitigation |
|------|------------|
| Topic randomness non-deterministic in tests | Pass explicit `topic` in production flows |
| MiniExam without provider gets no chunk plan | Pass provider or extend `useProvider` in phase 07 |

## Next phase

**06_PROMPT_ENGINE** — `buildPrompt(spec)` replacing `goethePrompts`, `cambridgePrompts`, `examModulePrompts.chunksFor`.
