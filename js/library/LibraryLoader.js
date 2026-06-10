/* Question library loader — /library/{lang}/{level}/questions.json */
const LibraryLoader = (() => {
  const SUPPORTED = {
    de: ['B1', 'B2'],
    en: ['B2', 'C1'],
    es: ['B2', 'C1'],
  };
  const CACHE = {};
  const AVAIL = {};

  function cacheKey(lang, level) {
    return `${lang}_${level}`;
  }

  function filePath(lang, level) {
    return `library/${lang}/${level}/questions.json`;
  }

  function hasLibrary(lang, level) {
    const key = cacheKey(lang, level);
    if (AVAIL[key] === true) return true;
    if (AVAIL[key] === false) return false;
    return !!(SUPPORTED[lang] && SUPPORTED[lang].includes(level));
  }

  function supportedLevels(lang) {
    return SUPPORTED[lang] ? [...SUPPORTED[lang]] : [];
  }

  async function probeLevel(lang, level) {
    const key = cacheKey(lang, level);
    if (AVAIL[key] !== undefined) return AVAIL[key];
    try {
      const res = await fetch(filePath(lang, level), { method: 'HEAD', cache: 'no-store' });
      AVAIL[key] = res.ok;
      return res.ok;
    } catch (_) {
      AVAIL[key] = false;
      return false;
    }
  }

  async function load(lang, level) {
    const key = cacheKey(lang, level);
    if (CACHE[key]) return CACHE[key];
    const res = await fetch(filePath(lang, level));
    if (!res.ok) throw new Error(`Question library not found for ${lang} ${level}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.questions) || !data.questions.length) {
      throw new Error(`Question library is empty for ${lang} ${level}`);
    }
    CACHE[key] = data;
    AVAIL[key] = true;
    return data;
  }

  function getPassage(bank, passageId) {
    return (bank.passages || []).find((p) => p.id === passageId) || null;
  }

  function questionsByModule(bank, module) {
    return (bank.questions || []).filter((q) => q.module === module);
  }

  function lookupVocabulary(bank, word) {
    if (!bank?.vocabulary || !word) return null;
    const key = Object.keys(bank.vocabulary).find((k) => k.toLowerCase() === String(word).toLowerCase());
    return key ? { word: key, ...bank.vocabulary[key] } : null;
  }

  return {
    SUPPORTED,
    hasLibrary,
    supportedLevels,
    probeLevel,
    load,
    getPassage,
    questionsByModule,
    lookupVocabulary,
    filePath,
  };
})();

if (typeof window !== 'undefined') window.LibraryLoader = LibraryLoader;
