/* Grammar/vocabulary analytics from exam history — localStorage mastery profile */
const AnalyticsStore = (() => {
  const KEY = 'lc_mastery';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {
      /* ignore */
    }
    return { profiles: {} };
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function profileKey(goal) {
    if (!goal) return 'global';
    return goal.id || `${goal.subject}_${goal.level}`;
  }

  function emptyProfile() {
    return {
      grammarTags: {},
      topicTags: {},
      vocabularyGaps: {},
      examsTaken: 0,
      lastUpdated: null,
    };
  }

  function getProfile(goal) {
    const data = load();
    const key = profileKey(goal);
    return data.profiles[key] || emptyProfile();
  }

  function bumpTag(map, tag, ok) {
    if (!tag) return;
    if (!map[tag]) map[tag] = { correct: 0, total: 0 };
    map[tag].total++;
    if (ok) map[tag].correct++;
  }

  function walkScorable(examData, fn) {
    if (!examData || typeof forEachGoetheQ !== 'function') return;
    forEachGoetheQ(examData, (mod, q) => fn(q, mod));
    examData.horenParts?.forEach((p) => {
      p.noteFields?.forEach((f) => fn(f, 'note'));
    });
  }

  function computeTagStats(examData, answers) {
    const grammarTags = {};
    const topicTags = {};
    if (!examData) return { grammarTags, topicTags };

    const scoreQ = (q, mod) => {
      const user = answers?.[mod + '_' + q.id];
      let ok = false;
      if (typeof goetheAnswersMatch === 'function') ok = goetheAnswersMatch(user, q.correct);
      else ok = user === q.correct;
      (q.grammarTags || []).forEach((t) => bumpTag(grammarTags, t, ok));
      (q.topicTags || []).forEach((t) => bumpTag(topicTags, t, ok));
    };

    walkScorable(examData, scoreQ);
    return { grammarTags, topicTags };
  }

  function recordExamResult(goal, entry, examData, answers) {
    const data = load();
    const key = profileKey(goal);
    const profile = data.profiles[key] || emptyProfile();
    const tagStats = computeTagStats(examData, answers);

    Object.entries(tagStats.grammarTags).forEach(([tag, stat]) => {
      if (!profile.grammarTags[tag]) profile.grammarTags[tag] = { correct: 0, total: 0 };
      profile.grammarTags[tag].correct += stat.correct;
      profile.grammarTags[tag].total += stat.total;
    });
    Object.entries(tagStats.topicTags).forEach(([tag, stat]) => {
      if (!profile.topicTags[tag]) profile.topicTags[tag] = { correct: 0, total: 0 };
      profile.topicTags[tag].correct += stat.correct;
      profile.topicTags[tag].total += stat.total;
    });

    (entry?.savedWords || []).forEach((w) => {
      if (!profile.vocabularyGaps[w]) profile.vocabularyGaps[w] = 0;
      profile.vocabularyGaps[w]++;
    });

    profile.examsTaken++;
    profile.lastUpdated = Date.now();
    data.profiles[key] = profile;
    save(data);
    return tagStats;
  }

  function tagAccuracy(stat) {
    if (!stat?.total) return 100;
    return Math.round((stat.correct / stat.total) * 100);
  }

  function getWeakGrammarTags(goal, limit = 3) {
    const profile = getProfile(goal);
    return Object.entries(profile.grammarTags)
      .filter(([, s]) => s.total >= 2)
      .map(([tag, s]) => ({ tag, accuracy: tagAccuracy(s), total: s.total }))
      .filter((x) => x.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit)
      .map((x) => x.tag);
  }

  function getVocabularyGaps(goal, limit = 10) {
    const profile = getProfile(goal);
    return Object.entries(profile.vocabularyGaps)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  return {
    load,
    getProfile,
    computeTagStats,
    recordExamResult,
    getWeakGrammarTags,
    getVocabularyGaps,
    tagAccuracy,
  };
})();

if (typeof window !== 'undefined') window.AnalyticsStore = AnalyticsStore;
