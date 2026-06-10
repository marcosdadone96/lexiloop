/* Facade — pre-generated question library + dynamic exam assembly */
const QuestionLibrary = (() => {
  function hasLibrary(subject, level) {
    return typeof LibraryLoader !== 'undefined' && LibraryLoader.hasLibrary(subject, level);
  }

  function availableLevels(subject) {
    return LibraryLoader.supportedLevels(subject);
  }

  async function loadBlueprint(subject, level) {
    if (typeof ExamBlueprint === 'undefined' || !ExamBlueprint.hasBlueprint(subject, level)) return null;
    return ExamBlueprint.load(subject, level);
  }

  async function buildWithBlueprint(subject, level, bank, blueprint, options) {
    if (blueprint) return ExamBuilder.buildFromBlueprint(subject, level, bank, blueprint, options);
    return ExamBuilder.build(subject, level, bank, options);
  }

  async function buildExam(subject, level, options = {}) {
    const bank = await LibraryLoader.load(subject, level);
    const blueprint = options.blueprint || (await loadBlueprint(subject, level));
    return buildWithBlueprint(subject, level, bank, blueprint, { mode: 'standard', ...options });
  }

  async function buildPersonalExam(subject, level, words, skills) {
    const bank = await LibraryLoader.load(subject, level);
    const blueprint = await loadBlueprint(subject, level);
    return buildWithBlueprint(subject, level, bank, blueprint, {
      mode: 'personal',
      targetWords: words,
      skills: skills || ['lesen', 'horen'],
    });
  }

  async function buildWeaknessExam(subject, level, goal, options = {}) {
    return WeaknessEngine.buildWeaknessExam(subject, level, goal, options);
  }

  async function lookupVocab(word, subject, level, targetLang) {
    return PracticeDictionary.lookup(word, subject, level, targetLang);
  }

  return {
    hasLibrary,
    availableLevels,
    loadBlueprint,
    buildExam,
    buildPersonalExam,
    buildWeaknessExam,
    lookupVocab,
  };
})();

if (typeof window !== 'undefined') window.QuestionLibrary = QuestionLibrary;
