# LexiCoil — Dependency Graph (Current)

## High-level

```mermaid
flowchart TB
  subgraph client [Browser Client]
    APP[index.html inline JS]
    AF[js/appFeatures.js]
    EMP[js/examModulePrompts.js]
    GP[js/goethePrompts.js]
    CP[js/cambridgePrompts.js]
    EL[js/examLibrary.js]
    CC[js/claudeClient.js]
    AUTH[js/authClient.js]
  end

  subgraph static [Static Assets]
    DATA[data/exams/de_*.json]
    DEMO[js/goetheDemoExams.js]
  end

  subgraph netlify [Netlify Functions]
    CLAUDE[claude-chat.js]
    POOL[exam-pool.js]
    SYNC[user-sync.js]
    AUTHF[auth-*.js]
    STRIPE[stripe-*.js]
  end

  subgraph external [External]
    ANTHROPIC[Anthropic API]
    BLOBS[Netlify Blobs]
    SUPA[Supabase]
  end

  APP --> AF
  APP --> EMP
  APP --> GP
  APP --> CP
  APP --> EL
  APP --> CC
  APP --> AUTH
  AF --> CC
  AF --> EL
  AF --> POOL
  EL --> DATA
  APP --> DEMO
  CC --> CLAUDE
  CLAUDE --> ANTHROPIC
  POOL --> BLOBS
  AUTH --> AUTHF
  AUTHF --> SUPA
  SYNC --> SUPA
```

## Exam generation dependency chain

```mermaid
flowchart LR
  UI[User: Start exam]
  GE[generateExam appFeatures.js]
  SRC{Source?}
  DEMO[DemoExams / GuidedDemo]
  LIB[ExamLibrary.loadExams]
  POOL[GET exam-pool]
  CH[generateExamChunks index.html]
  CF[ExamModulePrompts.chunksFor]
  AI[callAI claudeClient.js]
  MERGE[mergeExamParts]
  RENDER[renderExam]

  UI --> GE
  GE --> SRC
  SRC --> DEMO
  SRC --> LIB
  SRC --> POOL
  SRC --> CH
  CH --> CF
  CF --> AI
  AI --> MERGE
  MERGE --> RENDER
```

## Prompt sources (duplication)

```mermaid
flowchart TB
  subgraph prompts [Prompt Origins — should be ONE]
    P1[goethePrompts.buildA1..C2]
    P2[cambridgePrompts.buildA1..C2]
    P3[examModulePrompts chunks per level]
    P4[buildPrompt fallback index.html]
    P5[buildQuickPrompt]
    P6[buildVocabPrompt]
    P7[buildSpeakingEvalPrompt]
    P8[oral.html inline]
    P9[vocabClick dictionary]
  end

  AI[callAI → claude-chat.js]
  P1 --> AI
  P2 --> AI
  P3 --> AI
  P4 --> AI
  P5 --> AI
  P6 --> AI
  P7 --> AI
  P8 --> AI
  P9 --> AI
```

## Knowledge data flow (current — fragmented)

```mermaid
flowchart TB
  T1[TOPICS_DE index.html]
  T2[TOPICS_EN index.html]
  T3[EXAM_TOPICS appFeatures.js]
  JSON[data/exams/de_*.json]
  BLOB[pool blobs server]
  FC[S.flashcards user state]

  T1 --> pickTopic
  T2 --> pickTopic
  T3 --> pickExamTopic
  JSON --> ExamLibrary
  BLOB --> generateExam
  FC --> buildVocabPrompt
```

## Target dependency (for phase 02 reference)

```mermaid
flowchart LR
  KB[knowledge/ JSON]
  KE[KnowledgeEngine]
  CS[ContentSpecification]
  PB[PromptBuilder]
  GEN[ContentGenerators]
  ADP[ProviderAdapters]
  LLM[Provider Adapter: Claude]

  KB --> KE
  ADP --> KE
  UserVocab[User vocabulary] --> KE
  KE --> CS
  CS --> PB
  CS --> GEN
  PB --> LLM
  GEN --> LLM
```
