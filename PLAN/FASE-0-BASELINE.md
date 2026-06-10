# Fase 0 · Línea base (refactor UI/UX)

**Fecha:** 2026-06-10  
**Rama:** `refactor/fase-0-baseline`  
**Commit base:** snapshot del estado previo al Plan Maestro (`00-CURSOR-MASTER-PLAN.md`).

---

## Objetivo Fase 0

Poder iterar el refactor (Fases 1–6) sin miedo: rama dedicada, tests verdes, flujos críticos documentados.

---

## Verificación automática (2026-06-10)

| Check | Resultado |
|-------|-----------|
| `npm run validate:demo` | ✅ 54/54 variants + 9/9 base files |
| `npm run test:acceptance` | ✅ ALL TESTS PASSED (9 cert cases) |
| `npm run test:engine` | ✅ All dry engine E2E checks passed |
| `npm run validate:knowledge` | ✅ All knowledge files valid |
| `node scripts/assemble-dist.mjs` | ✅ dist/ assembled (landing/out present) |
| `node --check server.mjs` | ✅ OK |
| `node --check js/syncMerge.js` | ✅ OK |
| `node --check js/authClient.js` | ✅ OK |
| HTTP `127.0.0.1:5173/index.html` | ✅ 200 (~371 KB) |
| HTTP `127.0.0.1:5173/demo.html` | ✅ 200 (~24 KB) |

**Nota:** `npm start` / `server.mjs` usa puerto **5173**. Si `EADDRINUSE`, ya hay una instancia activa (verificado vía HTTP 200).

**Build producción completo:** `npm run build:site` (landing `npm install` + assemble). No ejecutado en esta fase — `assemble-dist` OK con `landing/out` existente.

---

## Flujos críticos — estado baseline

Verificación: **automática** donde hay script; **manual** en navegador antes de Fase 1.

### 1. Login / auth
- **Código:** `js/authClient.js`, `requireAppAuth()`, Netlify functions `auth-*`
- **Storage:** sesión Supabase + JWT local
- **Manual:** abrir `/app` o `index.html` → login/register → sesión persiste tras reload

### 2. Examen
- **Código:** `openGoalWorkspace` → `openModeChooser` → `finishExam` (~5086)
- **Historial:** `S.history[]` → `lc_hist` → `Auth.pushSync()`
- **Automático:** `test:acceptance`, `test:engine`, `test:exam-validator`
- **Manual:** Official o Practice exam completo → results → history entry

### 3. Vocabulario
- **Código:** vocab hub `openGoalWorkspace(id,'vocabulary')`, `manualVocab.js`, `saveToFCData`
- **Storage:** `S.flashcards[]` → `lc_fc`
- **Manual:** guardar palabra desde examen o manual add → aparece en hub por POS

### 4. Flashcards
- **Código:** `openDeckHub`, `saveFC`, spaced review en `flashcardScreen`
- **Manual:** abrir deck → flip/review → `nextReview` / `interval` actualizados

---

## Hallazgos UI relevantes para Fase 1

| Elemento | Estado actual | Acción Fase 1 |
|----------|---------------|---------------|
| Cabecera | `header` + `profile-bar` + `app-nav` (3 bandas) | Colapsar a `.topbar` |
| `homeCoachSection` | `display:none` — hooks ocultos | Revelar coach banner |
| `renderCoachDashboard()` | Existe; alimenta progress tab + hooks ocultos | Dashboard visible arriba |
| `renderHomeScreen()` | Solo grid de goal cards | + coach, KPIs, weak areas |
| `getRecommendedActionForGoal` | 🟢 Implementado | Consumir en dashboard |
| `getReadinessPctForGoal` | 🟢 Implementado | Anillo SVG (reemplazar barra) |
| Streak / Time studied | 🔴 No existe | Placeholder `—` hasta Fase 3 |

---

## Persistencia (no romper)

| Clave | Contenido |
|-------|-----------|
| `lc_goals`, `lc_active_goal` | Objetivos |
| `lc_hist` | Historial exámenes |
| `lc_fc` | Flashcards |
| `lc_saved` | Exámenes guardados |
| `lc_goal` | Legacy subject/level (Fase 5) |

**Sync merge** (`js/syncMerge.js`): solo `flashcards`, `history`, `savedExams`.

---

## Criterios de aceptación Fase 0

- [x] Rama `refactor/fase-0-baseline` creada
- [x] Snapshot/commit del estado actual
- [x] Tests automatizados verdes (4 suites del plan)
- [x] Servidor responde HTTP 200
- [ ] Manual smoke: login, examen, vocab, flashcards *(checklist para el desarrollador antes de Fase 1)*

---

## Siguiente paso

**Fase 1** — Cabecera única + Dashboard-Coach (`refactor/fase-1-coach`).
