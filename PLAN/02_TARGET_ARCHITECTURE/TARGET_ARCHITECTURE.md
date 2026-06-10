# LexiCoil — Target Architecture

**Status:** Design only — not implemented  
**Prerequisite:** Phase 01 Discovery complete

---

## 1. Design goals

1. **CEFR-first** — level and skills drive all content; providers are overlays.
2. **Single pipeline** — every generation: KnowledgeEngine → ContentSpecification → PromptBuilder → LLM.
3. **No duplicated knowledge** — one JSON source per fact.
4. **Scalable languages** — adding French/Italian = new `knowledge/languages/*.json` + optional provider adapter, not new prompt files.
5. **Thin UI** — `index.html` orchestrates UX; engine lives in `js/engine/`.

---

## 2. Folder structure (target)

```
lexiloop/
├── PLAN/                          # Refactor documentation (this tree)
├── knowledge/                     # 04 — canonical data (NEW)
│   ├── cefr/
│   │   ├── A1.json … C2.json
│   ├── languages/
│   │   ├── german.json
│   │   ├── english.json
│   │   └── spanish.json
│   ├── providers/
│   │   ├── goethe.json
│   │   ├── cambridge.json
│   │   └── dele.json
│   └── schemas/                   # JSON Schema for validation
│
├── js/
│   ├── engine/                    # NEW — content engine
│   │   ├── domain/                # 03 — types, ContentSpecification
│   │   ├── knowledge/             # 05 — KnowledgeEngine, loaders
│   │   ├── prompts/               # 06 — PromptBuilder only
│   │   ├── generators/            # 07 — Exam, Exercise, Flashcard, …
│   │   ├── providers/             # 08 — Goethe, Cambridge, DELE adapters
│   │   └── llm/                   # Claude adapter (wraps claudeClient)
│   │
│   ├── claudeClient.js            # Stays — low-level HTTP (08 llm)
│   ├── examLibrary.js             # Migrates to read knowledge + legacy JSON
│   └── … (auth, sync, ui — unchanged)
│
├── data/exams/                    # Legacy library — migrate into pool/knowledge over time
├── index.html                     # UI + wiring; shrinks over phases
└── netlify/functions/             # Unchanged unless new endpoints needed
```

---

## 3. Dependency flow

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  index.html, appFeatures.js — goals, workspace, renderExam   │
└───────────────────────────┬─────────────────────────────────┘
                            │ request content
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Content Generators (07)                    │
│  ExamGenerator | ExerciseGenerator | FlashcardGenerator | …  │
└───────────────────────────┬─────────────────────────────────┘
                            │ needs spec
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Knowledge Engine (05)                      │
│  merge(Cefr, Language, Provider?, UserVocab?) → Spec       │
└───────┬─────────────────────────────────────┬───────────────┘
        │ reads                               │ reads
        ▼                                     ▼
┌──────────────────┐                 ┌──────────────────────┐
│ knowledge/ (04)  │                 │ Provider Adapters (08)│
│ cefr, languages  │                 │ structure, timing only  │
└──────────────────┘                 └──────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Prompt Builder (06)                        │
│  buildPrompt(spec: ContentSpecification) → string | chunks[] │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   LLM Adapter (08 / claudeClient)            │
│  callAI(prompt, options) → raw text → parse & validate       │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** Generators never call `callAI` with hand-built strings. They always go through PromptBuilder.

---

## 4. Module interfaces

### 4.1 ContentSpecification (domain)

See `PLAN/03_DOMAIN_MODEL/CONTENT_SPECIFICATION.txt`.

Built only by KnowledgeEngine (or test fixtures).

### 4.2 KnowledgeEngine

```typescript
interface KnowledgeEngine {
  buildSpec(input: {
    language: string;      // 'german' | 'english' | 'spanish'
    level: string;           // 'A1' … 'C2'
    provider?: string;       // 'goethe' | 'cambridge' | 'dele'
    contentType: string;     // 'Exam' | 'ReadingExercise' | …
    targetWords?: string[];
    grammarTopics?: string[];
    vocabularyDomains?: string[];
  }): ContentSpecification;
}
```

### 4.3 PromptBuilder

```typescript
interface PromptBuilder {
  buildPrompt(spec: ContentSpecification): PromptResult;
}

type PromptResult =
  | { mode: 'single'; prompt: string; maxTokens: number }
  | { mode: 'chunks'; chunks: Array<{ label: string; prompt: string; maxTokens: number; expectKey: string }> };
```

**Forbidden:** `buildGoethePrompt`, `buildB1Prompt`, etc.

### 4.4 ContentGenerator

```typescript
interface ContentGenerator {
  readonly contentType: string;
  generate(spec: ContentSpecification, ctx: GeneratorContext): Promise<GeneratedContent>;
}
```

### 4.5 ProviderAdapter

```typescript
interface ProviderAdapter {
  readonly id: string;  // 'goethe'
  getExamStructure(level: string): ExamStructure;  // modules, timing, task types, scoring
  // NO getPrompt(), NO buildChunk()
}
```

### 4.6 LLMAdapter

```typescript
interface LLMAdapter {
  complete(prompt: string, options: LLMOptions): Promise<string>;
}
```

Wraps existing `callAI()`.

---

## 5. Boundaries

| Inside engine | Outside engine (unchanged) |
|---------------|----------------------------|
| CEFR definitions | Auth, JWT, Supabase |
| Grammar catalogs | Stripe billing |
| Prompt assembly | Goal workspace UI |
| Provider structure JSON | Flashcard SRS scheduling UI |
| JSON parse/merge/validate | localStorage sync merge |
| Generator orchestration | Netlify quota blobs |

---

## 6. Migration strategy (strangler)

| Step | Action |
|------|--------|
| 1 | Add `knowledge/` + schemas; no runtime change |
| 2 | Add `js/engine/domain` + KnowledgeEngine reading JSON |
| 3 | Add PromptBuilder; shadow-compare output vs old prompts in tests |
| 4 | Wire `startQuick('reading')` through new pipeline only |
| 5 | Wire full exam chunks through new pipeline |
| 6 | Delete `goethePrompts.js` / level branches in `examModulePrompts.js` |
| 7 | Add Spanish + DELE knowledge + adapters |

---

## 7. Runtime loading (browser)

Engine modules load as ES modules or IIFE bundles before `appFeatures.js`:

```html
<script src="js/engine/domain/index.js"></script>
<script src="js/engine/knowledge/KnowledgeEngine.js"></script>
<script src="js/engine/prompts/PromptBuilder.js"></script>
…
```

`assemble-dist.mjs` copies `knowledge/` and `js/engine/` to `dist/`.

---

## 8. Validation

- JSON Schema validate all `knowledge/**/*.json` in CI (`npm run validate:knowledge`).
- Golden tests: same `ContentSpecification` → comparable structure for Goethe B1 / Cambridge B1 / DELE B1.
