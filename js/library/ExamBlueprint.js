/**
 * Exam Blueprint — fixed official-like structure, dynamic library content.
 * Principle: structure is locked; questions/passages are selected from the bank.
 */
const ExamBlueprint = (() => {
  const INDEX = {
    de_B1: 'goethe_B1',
    de_B2: 'goethe_B2',
    en_B2: 'cambridge_B2',
    en_C1: 'cambridge_C1',
  };
  const CACHE = {};

  function key(lang, level) {
    return `${lang}_${level}`;
  }

  function blueprintPath(lang, level) {
    const id = INDEX[key(lang, level)];
    return id ? `library/blueprints/${id}.json` : null;
  }

  function hasBlueprint(lang, level) {
    return !!INDEX[key(lang, level)];
  }

  async function load(lang, level) {
    const k = key(lang, level);
    if (CACHE[k]) return CACHE[k];
    const path = blueprintPath(lang, level);
    if (!path) return null;
    const res = await fetch(path);
    if (!res.ok) return null;
    CACHE[k] = await res.json();
    return CACHE[k];
  }

  function loadSync(lang, level) {
    return CACHE[key(lang, level)] || null;
  }

  function cacheBlueprint(lang, level, blueprint) {
    CACHE[key(lang, level)] = blueprint;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normType(q) {
    const t = String(q.questionType || q.type || '').toLowerCase();
    if (t === 'multiple') return 'multiple_choice';
    if (t === 'match') return 'matching';
    if (t === 'richtig_falsch') return 'true_false';
    return t;
  }

  function typeAllowed(q, allowed) {
    if (!allowed?.length) return true;
    const t = normType(q);
    return allowed.some((a) => {
      const x = String(a).toLowerCase();
      return t === x || (x === 'multiple_choice' && t === 'multiple') || (x === 'true_false' && t === 'richtig_falsch');
    });
  }

  function modulePool(bank, moduleId) {
    const mod = String(moduleId).toLowerCase();
    return (bank.questions || []).filter((q) => {
      const m = String(q.module || '').toLowerCase();
      if (mod === 'lesen' || mod === 'reading') return m === 'lesen' || m === 'reading';
      if (mod === 'horen' || mod === 'listening') return m === 'horen' || m === 'listening';
      if (mod === 'grammatik' || mod === 'use_of_english') {
        return m === 'grammatik' || m === 'grammar' || m === 'use_of_english';
      }
      if (mod === 'schreiben' || mod === 'writing') return m === 'schreiben' || m === 'writing';
      return m === mod;
    });
  }

  function pickFromPool(pool, partSpec, used, bank, filterFn) {
    const teil = partSpec.teil;
    const target = partSpec.questionsTotal?.max || partSpec.questionsTotal?.min || 4;
    let candidates = pool.filter((q) => !used.has(q.id));
    if (teil != null) {
      const byTeil = candidates.filter((q) => (q.teil || q.part) === teil);
      if (byTeil.length) candidates = byTeil;
    }
    candidates = candidates.filter((q) => typeAllowed(q, partSpec.questionTypes));
    if (filterFn) candidates = candidates.filter(filterFn);
    if (!candidates.length) {
      candidates = pool.filter((q) => !used.has(q.id) && typeAllowed(q, partSpec.questionTypes));
      if (filterFn) candidates = candidates.filter(filterFn);
    }
    const picked = shuffle(candidates).slice(0, target);
    picked.forEach((q) => used.add(q.id));
    return picked;
  }

  function getPassage(bank, passageId) {
    return (bank.passages || []).find((p) => p.id === passageId) || null;
  }

  function groupByPassage(questions, bank) {
    const groups = new Map();
    questions.forEach((q) => {
      const pid = q.passageId || `_solo_${q.id}`;
      if (!groups.has(pid)) groups.set(pid, []);
      groups.get(pid).push(q);
    });
    return groups;
  }

  function toExamQuestion(q, idx) {
    const out = {
      id: `ql_${q.id || idx}`,
      type: q.type || 'multiple',
      question: q.question,
      correct: q.correct != null ? q.correct : q.correctAnswer,
      correctAnswer: q.correctAnswer != null ? q.correctAnswer : q.correct,
      explanation: q.explanation || '',
      grammarTags: q.grammarTags || [],
      topicTags: q.topicTags || [],
      vocabularyTags: q.vocabularyTags || [],
      difficulty: q.difficulty,
    };
    if (q.options?.length) out.options = [...q.options];
    return out;
  }

  function buildLesenPart(partSpec, questions, bank) {
    const layout = partSpec.layout || 'passage_questions';
    const part = {
      teil: partSpec.teil,
      instruction: partSpec.instruction || partSpec.label,
      blueprintSlot: partSpec.slotType,
    };

    if (layout === 'items' && questions.length) {
      part.items = questions.map((q, i) => {
        const passage = q.passageId ? getPassage(bank, q.passageId) : null;
        const eq = toExamQuestion(q, i);
        return {
          id: eq.id,
          signText: passage?.text || q.question,
          question: q.question,
          options: eq.options,
          correct: eq.correct,
          grammarTags: eq.grammarTags,
          topicTags: eq.topicTags,
          vocabularyTags: eq.vocabularyTags,
          difficulty: eq.difficulty,
          explanation: eq.explanation,
        };
      });
      return part;
    }

    const groups = groupByPassage(questions, bank);
    const [firstPid, firstQs] = [...groups.entries()][0] || ['', questions];
    const passage = firstPid && !firstPid.startsWith('_solo_') ? getPassage(bank, firstPid) : null;
    if (passage) {
      part.textTitle = passage.title || '';
      part.text = passage.text || '';
    }
    part.questions = (firstQs || questions).map((q, i) => toExamQuestion(q, i));
    return part;
  }

  function buildHorenPart(partSpec, questions, bank) {
    const groups = groupByPassage(questions, bank);
    const segments = [];
    const recWord = bank?.meta?.language === 'de' ? 'Aufnahme' : 'Recording';
    let si = 0;
    groups.forEach((qs, pid) => {
      const passage = pid && !pid.startsWith('_solo_') ? getPassage(bank, pid) : null;
      const transcript = passage?.text || qs[0]?.transcript || '';
      segments.push({
        id: `seg_${partSpec.teil}_${si}`,
        label: qs[0]?.segmentLabel || `${recWord} ${si + 1}`,
        transcript,
        questions: qs.map((q, i) => toExamQuestion(q, i)),
      });
      si++;
    });
    return {
      teil: partSpec.teil,
      instruction: partSpec.instruction || partSpec.label,
      blueprintSlot: partSpec.slotType,
      segments: segments.length ? segments : [{ id: `seg_${partSpec.teil}`, label: 'Aufnahme 1', transcript: '', questions: [] }],
    };
  }

  function buildGrammatikPart(partSpec, questions) {
    return {
      teil: partSpec.teil,
      instruction: partSpec.instruction || partSpec.label,
      blueprintSlot: partSpec.slotType,
      questions: questions.map((q, i) => toExamQuestion(q, i)),
    };
  }

  function buildSchreibenPart(partSpec, questions) {
    const q = questions[0];
    if (!q) return null;
    const words = partSpec.wordsTarget || { min: 80, max: 100 };
    return {
      aufgabe: partSpec.teil,
      fieldId: `write_bp_${partSpec.teil}`,
      task: q.question,
      minWords: words.min,
      maxWords: words.max,
      mandatory: !!partSpec.mandatory,
      taskType: partSpec.taskTypes?.[0] || partSpec.slotType,
      blueprintSlot: partSpec.slotType,
      grammarTags: q.grammarTags || [],
      topicTags: q.topicTags || [],
    };
  }

  function buildUseOfEnglishPart(partSpec, questions, bank) {
    const layout = partSpec.layout || 'questions';
    if (layout === 'passage_questions' || layout === 'items') {
      return buildLesenPart(partSpec, questions, bank);
    }
    return buildGrammatikPart(partSpec, questions);
  }

  function routeModulePart(modId, partSpec, picked, bank, result) {
    const id = String(modId).toLowerCase();
    if (!picked.length) return;

    if (id === 'lesen' || id === 'reading') {
      result.lesenParts.push(buildLesenPart(partSpec, picked, bank));
    } else if (id === 'horen' || id === 'listening') {
      result.horenParts.push(buildHorenPart(partSpec, picked, bank));
    } else if (id === 'grammatik') {
      result.grammatikParts.push(buildGrammatikPart(partSpec, picked));
    } else if (id === 'use_of_english') {
      result.useOfEnglishParts.push(buildUseOfEnglishPart(partSpec, picked, bank));
    } else if (id === 'schreiben' || id === 'writing') {
      const sp = buildSchreibenPart(partSpec, picked);
      if (sp) result.schreibenParts.push(sp);
    }
  }

  /**
   * Assemble exam sections from blueprint + question bank.
   * Returns parts arrays and a coverage report (target vs filled).
   */
  function assemble(bank, blueprint, options = {}) {
    const used = new Set();
    const filterFn = options.filter || null;
    const result = {
      lesenParts: [],
      horenParts: [],
      grammatikParts: [],
      useOfEnglishParts: [],
      schreibenParts: [],
      selected: [],
      coverage: [],
    };

    for (const mod of blueprint.modules || []) {
      const pool = modulePool(bank, mod.id);
      for (const partSpec of mod.parts || []) {
        const target = partSpec.questionsTotal?.max || partSpec.questionsTotal?.min || 1;
        const picked = pickFromPool(pool, partSpec, used, bank, filterFn);
        result.selected.push(...picked);
        result.coverage.push({
          module: mod.id,
          teil: partSpec.teil,
          slotType: partSpec.slotType,
          target,
          filled: picked.length,
          complete: picked.length >= (partSpec.questionsTotal?.min || target),
        });

        routeModulePart(mod.id, partSpec, picked, bank, result);
      }
    }

    return result;
  }

  function coverageSummary(coverage) {
    const total = coverage.length;
    const complete = coverage.filter((c) => c.complete).length;
    return { total, complete, ratio: total ? complete / total : 0 };
  }

  return {
    INDEX,
    hasBlueprint,
    load,
    loadSync,
    cacheBlueprint,
    blueprintPath,
    assemble,
    coverageSummary,
    modulePool,
    pickFromPool,
  };
})();

if (typeof window !== 'undefined') window.ExamBlueprint = ExamBlueprint;
if (typeof module !== 'undefined') module.exports = ExamBlueprint;
