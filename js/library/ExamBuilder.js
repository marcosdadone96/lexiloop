/* Assembles official-format exams from pre-generated question library */
const ExamBuilder = (() => {
  const CERT = {
    de: {
      B1: { certificate: 'Goethe-Zertifikat B1', board: 'Goethe-Institut' },
      B2: { certificate: 'Goethe-Zertifikat B2', board: 'Goethe-Institut' },
    },
    en: {
      B2: { certificate: 'B2 First (FCE)', board: 'Cambridge Assessment English' },
      C1: { certificate: 'C1 Advanced (CAE)', board: 'Cambridge Assessment English' },
    },
    es: {
      B2: { certificate: 'DELE B2', board: 'Instituto Cervantes' },
      C1: { certificate: 'DELE C1', board: 'Instituto Cervantes' },
    },
  };

  const MODULE_TIME = {
    de: { lesen: '65 Minuten', horen: '40 Minuten', schreiben: '60 Minuten', sprechen: '15 Minuten' },
    en: { lesen: '75 minutes', horen: '40 minutes', schreiben: '80 minutes', sprechen: '15 minutes' },
    es: { lesen: '70 min', horen: '40 min', schreiben: '80 min', sprechen: '20 min' },
  };

  const MODULE_TITLE = {
    de: { lesen: 'Lesen', horen: 'Hören', schreiben: 'Schreiben', sprechen: 'Sprechen' },
    en: { lesen: 'Reading', horen: 'Listening', schreiben: 'Writing', sprechen: 'Speaking' },
    es: { lesen: 'Comprensión de lectura', horen: 'Comprensión auditiva', schreiben: 'Expresión escrita', sprechen: 'Expresión oral' },
  };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickQuestions(pool, count, filterFn) {
    const filtered = filterFn ? pool.filter(filterFn) : pool;
    if (!filtered.length) return shuffle(pool).slice(0, count);
    return shuffle(filtered).slice(0, Math.min(count, filtered.length));
  }

  function questionMatchesTags(q, grammarTags, topicTags) {
    if (grammarTags?.length) {
      const g = q.grammarTags || [];
      if (!grammarTags.some((t) => g.includes(t))) return false;
    }
    if (topicTags?.length) {
      const t = q.topicTags || [];
      if (!topicTags.some((x) => t.includes(x))) return false;
    }
    return true;
  }

  function questionContainsWords(q, bank, words) {
    if (!words?.length) return false;
    const passage = q.passageId ? LibraryLoader.getPassage(bank, q.passageId) : null;
    const blob = [q.question, q.transcript, passage?.text].filter(Boolean).join(' ').toLowerCase();
    return words.some((w) => blob.includes(String(w).toLowerCase()));
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
      difficulty: q.difficulty,
    };
    if (q.options?.length) out.options = [...q.options];
    return out;
  }

  function buildLesenParts(bank, selected) {
    const byPassage = {};
    selected.forEach((q) => {
      const pid = q.passageId || 'default';
      if (!byPassage[pid]) byPassage[pid] = [];
      byPassage[pid].push(q);
    });
    const parts = [];
    let teil = 1;
    Object.entries(byPassage).forEach(([pid, qs]) => {
      const passage = LibraryLoader.getPassage(bank, pid);
      const part = {
        teil: qs[0].teil || teil,
        instruction: passage
          ? bank.meta.language === 'de'
            ? 'Lesen Sie den Text und beantworten Sie die Fragen.'
            : bank.meta.language === 'es'
              ? 'Lea el texto y responda las preguntas.'
              : 'Read the text and answer the questions.'
          : 'Answer the following questions.',
        questions: qs.map((q, i) => toExamQuestion(q, i)),
      };
      if (passage) {
        part.textTitle = passage.title || '';
        part.text = passage.text || '';
      }
      parts.push(part);
      teil++;
    });
    return parts;
  }

  function buildHorenParts(bank, selected) {
    const bySegment = {};
    selected.forEach((q) => {
      const key = q.passageId || q.segmentLabel || 'default';
      if (!bySegment[key]) bySegment[key] = [];
      bySegment[key].push(q);
    });
    const parts = [];
    let teil = 1;
    Object.entries(bySegment).forEach(([key, qs]) => {
      const passage = LibraryLoader.getPassage(bank, key);
      const transcript = passage?.text || qs[0].transcript || '';
      const part = {
        teil: qs[0].teil || teil,
        instruction:
          bank.meta.language === 'de'
            ? 'Hören Sie die Aufnahme und beantworten Sie die Fragen.'
            : bank.meta.language === 'es'
              ? 'Escuche la grabación y responda las preguntas.'
              : 'Listen to the recording and answer the questions.',
        segments: [
          {
            id: `seg_${teil}`,
            label: qs[0].segmentLabel || `Recording ${teil}`,
            transcript,
            questions: qs.map((q, i) => toExamQuestion(q, i)),
          },
        ],
      };
      parts.push(part);
      teil++;
    });
    return parts;
  }

  function collectTopicTags(questions) {
    const tags = new Set();
    questions.forEach((q) => (q.topicTags || []).forEach((t) => tags.add(t)));
    return [...tags];
  }

  function blueprintEngine() {
    if (typeof ExamBlueprint !== 'undefined') return ExamBlueprint;
    if (typeof globalThis !== 'undefined' && globalThis.ExamBlueprint) return globalThis.ExamBlueprint;
    if (typeof window !== 'undefined' && window.ExamBlueprint) return window.ExamBlueprint;
    return null;
  }

  function buildFromBlueprint(lang, level, bank, blueprint, options = {}) {
    const {
      mode = 'standard',
      grammarTags = [],
      topicTags = [],
      targetWords = [],
      skills = ['lesen', 'horen', 'schreiben'],
      assembled: preAssembled = null,
    } = options;

    const BP = blueprintEngine();
    if (!BP && !preAssembled) throw new Error('ExamBlueprint engine not loaded');

    const filter =
      mode === 'weakness' && grammarTags.length
        ? (q) => questionMatchesTags(q, grammarTags, topicTags)
        : null;

    const assembled = preAssembled || BP.assemble(bank, blueprint, { filter });
    let { lesenParts, horenParts, grammatikParts, useOfEnglishParts, schreibenParts, selected, coverage } = assembled;

    if (!skills.includes('lesen')) lesenParts = [];
    if (!skills.includes('horen')) horenParts = [];
    if (!skills.includes('schreiben')) schreibenParts = [];

    if (mode === 'personal' && targetWords.length) {
      const vocab = selected.filter((q) => questionContainsWords(q, bank, targetWords));
      if (vocab.length >= 2) {
        const vLesen = vocab.filter((q) => q.module === 'lesen');
        const vHoren = vocab.filter((q) => q.module === 'horen');
        if (vLesen.length && skills.includes('lesen')) {
          lesenParts = buildLesenParts(bank, vLesen);
        }
        if (vHoren.length && skills.includes('horen')) {
          horenParts = buildHorenParts(bank, vHoren);
        }
      }
    }

    const cert = CERT[lang]?.[level] || { certificate: `${level} Exam`, board: 'Goethe-Institut' };
    const topicTagList = collectTopicTags(selected);
    const cov = BP ? BP.coverageSummary(coverage) : { total: coverage.length, complete: 0, ratio: 0 };
    const topicLabel =
      mode === 'personal'
        ? `Personal: ${targetWords.slice(0, 3).join(', ')}${targetWords.length > 3 ? '…' : ''}`
        : mode === 'weakness'
          ? `Weakness focus: ${grammarTags.slice(0, 2).join(', ')}`
          : topicTagList[0] || `${cert.certificate} practice`;

    const exam = {
      topic: topicLabel,
      level,
      lang,
      goetheFormat: true,
      libraryBuilt: true,
      blueprintId: blueprint.id,
      blueprintCoverage: coverage,
      blueprintComplete: cov.ratio >= 1,
      libraryVersion: bank.meta?.version || 1,
      topicTags: topicTagList,
      difficulty: 5,
      official: {
        board: cert.board,
        certificate: cert.certificate,
        note: 'Assembled from question library using official exam blueprint (no runtime AI).',
      },
      modules: {
        lesen: { title: MODULE_TITLE[lang]?.lesen || 'Lesen', time: MODULE_TIME[lang]?.lesen || '' },
        horen: { title: MODULE_TITLE[lang]?.horen || 'Hören', time: MODULE_TIME[lang]?.horen || '' },
        schreiben: { title: MODULE_TITLE[lang]?.schreiben || 'Schreiben', time: MODULE_TIME[lang]?.schreiben || '' },
      },
      lesenParts,
      horenParts,
      schreibenParts,
    };
    if (grammatikParts.length) exam.grammatikParts = grammatikParts;
    if (useOfEnglishParts?.length) exam.useOfEnglishParts = useOfEnglishParts;
    if (blueprint.examType === 'cambridge') exam.cambridgeFormat = true;
    return exam;
  }

  function build(lang, level, bank, options = {}) {
    const {
      mode = 'standard',
      grammarTags = [],
      topicTags = [],
      targetWords = [],
      skills = ['lesen', 'horen'],
      difficultyRange = null,
    } = options;

    const filter = (q) => {
      if (!questionMatchesTags(q, grammarTags, topicTags)) return false;
      if (difficultyRange && q.difficulty != null) {
        if (q.difficulty < difficultyRange[0] || q.difficulty > difficultyRange[1]) return false;
      }
      return true;
    };

    let lesenPool = LibraryLoader.questionsByModule(bank, 'lesen');
    let horenPool = LibraryLoader.questionsByModule(bank, 'horen');

    if (mode === 'weakness' && grammarTags.length) {
      const weakLesen = lesenPool.filter((q) => filter(q));
      const weakHoren = horenPool.filter((q) => filter(q));
      if (weakLesen.length) lesenPool = weakLesen;
      if (weakHoren.length) horenPool = weakHoren;
    }

    if (mode === 'personal' && targetWords.length) {
      const vocabLesen = lesenPool.filter((q) => questionContainsWords(q, bank, targetWords));
      const vocabHoren = horenPool.filter((q) => questionContainsWords(q, bank, targetWords));
      if (vocabLesen.length >= 2) lesenPool = vocabLesen;
      if (vocabHoren.length >= 2) horenPool = vocabHoren;
    }

    const lesenCount = Math.max(3, Math.min(6, lesenPool.length));
    const horenCount = Math.max(2, Math.min(4, horenPool.length));

    const lesenSel = skills.includes('lesen') ? pickQuestions(lesenPool, lesenCount, mode === 'standard' ? null : filter) : [];
    const horenSel = skills.includes('horen') ? pickQuestions(horenPool, horenCount, mode === 'standard' ? null : filter) : [];

    const cert = CERT[lang]?.[level] || { certificate: `${level} Exam`, board: 'Official' };
    const topicTagList = collectTopicTags([...lesenSel, ...horenSel]);
    const topicLabel =
      mode === 'personal'
        ? `Personal: ${targetWords.slice(0, 3).join(', ')}${targetWords.length > 3 ? '…' : ''}`
        : mode === 'weakness'
          ? `Weakness focus: ${grammarTags.slice(0, 2).join(', ')}`
          : topicTagList[0] || `${cert.certificate} practice`;

    const exam = {
      topic: topicLabel,
      level,
      lang,
      goetheFormat: true,
      libraryBuilt: true,
      libraryVersion: bank.meta?.version || 1,
      topicTags: topicTagList,
      difficulty: 3,
      official: {
        board: cert.board,
        certificate: cert.certificate,
        note: 'Assembled from pre-generated question library (no runtime AI).',
      },
      modules: {
        lesen: { title: MODULE_TITLE[lang]?.lesen || 'Reading', time: MODULE_TIME[lang]?.lesen || '' },
        horen: { title: MODULE_TITLE[lang]?.horen || 'Listening', time: MODULE_TIME[lang]?.horen || '' },
      },
      lesenParts: buildLesenParts(bank, lesenSel),
      horenParts: buildHorenParts(bank, horenSel),
    };

    if (lang === 'es' && typeof normalizeSpanishExam === 'function') {
      return normalizeSpanishExam(exam);
    }
    return exam;
  }

  return { build, buildFromBlueprint, questionContainsWords, questionMatchesTags };
})();

if (typeof window !== 'undefined') window.ExamBuilder = ExamBuilder;
if (typeof module !== 'undefined') module.exports = ExamBuilder;
