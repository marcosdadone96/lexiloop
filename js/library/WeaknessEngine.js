/* Selects library questions targeting weakest grammar areas */
const WeaknessEngine = (() => {
  async function getWeakTags(goal, limit = 3) {
    if (typeof AnalyticsStore !== 'undefined') {
      const tags = AnalyticsStore.getWeakGrammarTags(goal, limit);
      if (tags.length) return tags;
    }
    if (typeof getWeakAreasForGoal === 'function' && goal) {
      const legacy = getWeakAreasForGoal(goal);
      return legacy.filter((x) => x.startsWith('g-')).slice(0, limit);
    }
    return [];
  }

  async function buildWeaknessExam(lang, level, goal, options = {}) {
    const bank = await LibraryLoader.load(lang, level);
    const blueprint =
      typeof ExamBlueprint !== 'undefined' && ExamBlueprint.hasBlueprint(lang, level)
        ? await ExamBlueprint.load(lang, level)
        : null;
    const grammarTags = options.grammarTags || (await getWeakTags(goal, options.limit || 3));
    const buildOpts = { ...options };
    if (!grammarTags.length) {
      return blueprint
        ? ExamBuilder.buildFromBlueprint(lang, level, bank, blueprint, { mode: 'standard', ...buildOpts })
        : ExamBuilder.build(lang, level, bank, { mode: 'standard', ...buildOpts });
    }
    const weaknessOpts = { mode: 'weakness', grammarTags, ...buildOpts };
    return blueprint
      ? ExamBuilder.buildFromBlueprint(lang, level, bank, blueprint, weaknessOpts)
      : ExamBuilder.build(lang, level, bank, weaknessOpts);
  }

  return { getWeakTags, buildWeaknessExam };
})();

if (typeof window !== 'undefined') window.WeaknessEngine = WeaknessEngine;
