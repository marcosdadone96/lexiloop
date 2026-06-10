/**
 * ExamValidator — structural validation for AI-generated exams.
 * Rejects exams with missing or ambiguous answer keys before users or pool see them.
 */
class ExamValidator {
  validate(exam) {
    const errors = [];
    if (!exam || typeof exam !== 'object' || Array.isArray(exam)) {
      return { valid: false, errors: ['exam_not_object'] };
    }

    let scorable = 0;
    this._walk(exam, (item, path, kind) => {
      let err = null;
      if (kind === 'mcq') err = this._validateMcq(item, path);
      else if (kind === 'match') err = this._validateMatch(item, path);
      else if (kind === 'gap') err = this._validateGap(item, path);
      if (err) errors.push(err);
      else scorable++;
    });

    if (!this._hasRenderableContent(exam)) errors.push('exam_missing_modules');
    if (scorable === 0) errors.push('exam_no_answer_keys');

    return { valid: errors.length === 0, errors };
  }

  _walk(exam, fn) {
    const parts = [
      ['lesenParts', 'lesen'],
      ['horenParts', 'horen'],
      ['readingParts', 'reading'],
      ['listeningParts', 'listening'],
    ];
    for (const [key, mod] of parts) {
      (exam[key] || []).forEach((part, pi) => {
        const base = `${key}[${pi}]`;
        (part.items || []).forEach((it, ii) => fn(it, `${base}.items[${ii}]`, 'mcq'));
        (part.questions || []).forEach((q, qi) => this._dispatchQuestion(q, `${base}.questions[${qi}]`, part, fn));
        (part.segments || []).forEach((seg, si) => {
          if (seg.options || seg.correct != null) fn(seg, `${base}.segments[${si}]`, 'mcq');
        });
        (part.noteFields || []).forEach((f, fi) => fn(f, `${base}.noteFields[${fi}]`, 'gap'));
      });
    }

    if (exam.lesen?.questions) {
      exam.lesen.questions.forEach((q, i) => this._dispatchQuestion(q, `lesen.questions[${i}]`, exam.lesen, fn));
    }
    if (exam.horen?.questions) {
      exam.horen.questions.forEach((q, i) => this._dispatchQuestion(q, `horen.questions[${i}]`, exam.horen, fn));
    }
    if (exam.reading?.questions) {
      exam.reading.questions.forEach((q, i) => this._dispatchQuestion(q, `reading.questions[${i}]`, exam.reading, fn));
    }
    if (exam.listening?.questions) {
      exam.listening.questions.forEach((q, i) => this._dispatchQuestion(q, `listening.questions[${i}]`, exam.listening, fn));
    }
    (exam.gapfill?.sentences || []).forEach((s, i) => fn(s, `gapfill.sentences[${i}]`, 'gap'));
  }

  _dispatchQuestion(q, path, part, fn) {
    if (!q || typeof q !== 'object') return;
    const type = String(q.type || 'multiple').toLowerCase();
    if (type === 'gap_fill' || type === 'gap') return fn(q, path, 'gap');
    if (type === 'match' || type === 'matching' || type === 'person_match') return fn(q, path, 'match');
    if (type === 'multiple' || type === 'abcd' || type === 'tf' || type === 'rf' || type === 'yn' || type === 'rfn' || type === 'true_false' || type === 'richtig_falsch' || type === 'ja_nein' || type === 'r_f_n') {
      return fn(q, path, 'mcq');
    }
    if (q.options && q.correct != null) return fn(q, path, 'mcq');
    if (q.options && type === 'person_multi') return fn(q, path, 'match');
  }

  _validateMcq(q, path) {
    const type = String(q.type || '').toLowerCase();
    const isTf = type === 'tf' || type === 'true_false' || type === 'rf' || type === 'richtig_falsch' || type === 'rfn' || type === 'r_f_n';
    const isYn = type === 'yn' || type === 'ja_nein';

    if (!isTf && !isYn && Array.isArray(q.options) && q.options.length) {
      const optErr = this._validateMcqOptions(q.options, path);
      if (optErr) return optErr;
    }

    if (q.correct == null || q.correct === '') return `${path}: mcq_missing_correct`;
    const correct = q.correct;
    if (Array.isArray(correct)) {
      if (correct.length !== 1) return `${path}: mcq_multiple_correct`;
      return this._correctInOptions(correct[0], q, path);
    }
    if (isTf) {
      const c = String(correct).toUpperCase();
      if (!['R', 'F', 'T', 'W', 'N', 'TRUE', 'FALSE', 'RICHTIG', 'FALSCH'].includes(c)) {
        return `${path}: mcq_invalid_tf_correct`;
      }
      return null;
    }
    if (isYn) {
      const c = String(correct).toUpperCase();
      if (!['J', 'N', 'Y', 'JA', 'NEIN', 'YES', 'NO'].includes(c)) return `${path}: mcq_invalid_yn_correct`;
      return null;
    }
    return this._correctInOptions(correct, q, path);
  }

  _validateMcqOptions(options, path) {
    if (!Array.isArray(options) || !options.length) return `${path}: mcq_missing_options`;
    const keys = [];
    let flaggedCorrect = 0;
    for (let i = 0; i < options.length; i++) {
      const parsed = this._parseOption(options[i]);
      if (!parsed.text) return `${path}: mcq_empty_option_text[${i}]`;
      if (parsed.key) {
        if (keys.includes(parsed.key)) return `${path}: mcq_duplicate_options`;
        keys.push(parsed.key);
      }
      if (parsed.flaggedCorrect) flaggedCorrect++;
    }
    if (flaggedCorrect > 1) return `${path}: mcq_multiple_correct`;
    return null;
  }

  _parseOption(o) {
    if (typeof o === 'string') {
      const m = o.match(/^([A-Za-z0-9]+)\)\s*(.*)$/s);
      const key = m ? this._normKey(m[1]) : this._normKey(o);
      const text = (m ? m[2] : o).trim();
      return { key, text, flaggedCorrect: false };
    }
    if (o && typeof o === 'object') {
      const rawKey = o.key != null ? o.key : o.id;
      const text = String(o.text ?? o.label ?? o.option ?? '').trim();
      const key = rawKey != null ? this._normKey(rawKey) : null;
      return { key, text, flaggedCorrect: o.correct === true };
    }
    return { key: null, text: '', flaggedCorrect: false };
  }

  _validateMatch(q, path) {
    if (q.correct == null || q.correct === '') return `${path}: match_missing_correct`;
    const keys = this._optionKeys(q.options || q.matchLabels);
    if (!keys.length) return `${path}: match_missing_options`;
    const vals = Array.isArray(q.correct) ? q.correct : [q.correct];
    for (const v of vals) {
      const k = this._normKey(v);
      if (!keys.includes(k)) return `${path}: match_invalid_reference`;
    }
    return null;
  }

  _validateGap(item, path) {
    const ans = item.answer != null ? item.answer : item.correct;
    if (ans == null || String(ans).trim() === '') return `${path}: gap_missing_answer`;
    return null;
  }

  _correctInOptions(correct, q, path) {
    const keys = this._optionKeys(q.options);
    if (!keys.length) return `${path}: mcq_missing_options`;
    const k = this._normKey(correct);
    if (!keys.includes(k)) return `${path}: mcq_correct_not_in_options`;
    const flagged = (q.options || []).filter((o) => o && typeof o === 'object' && o.correct === true);
    if (flagged.length === 1) {
      const fk = flagged[0].key != null ? this._normKey(flagged[0].key) : null;
      if (fk && fk !== k) return `${path}: mcq_correct_flag_mismatch`;
    }
    return null;
  }

  _optionKeys(options) {
    if (!Array.isArray(options)) return [];
    return options
      .map((o) => this._parseOption(o).key)
      .filter(Boolean);
  }

  _normKey(v) {
    return String(v ?? '')
      .trim()
      .replace(/^\s*([a-zA-Z0-9]+)\)\s*/, '$1')
      .toUpperCase();
  }

  _hasRenderableContent(exam) {
    const hasPart = (arr, mod) => (arr || []).some((p) => this._partHasContent(p, mod));
    if (exam.goetheFormat) {
      return hasPart(exam.lesenParts, 'lesen') && hasPart(exam.horenParts, 'horen');
    }
    if (hasPart(exam.lesenParts, 'lesen') || hasPart(exam.readingParts, 'lesen')) return true;
    if (hasPart(exam.horenParts, 'horen') || hasPart(exam.listeningParts, 'horen')) return true;
    if (exam.lesen?.text && exam.lesen?.questions?.length) return true;
    if (exam.horen?.questions?.length) return true;
    if (exam.gapfill?.sentences?.length) return true;
    return false;
  }

  _partHasContent(part, mod) {
    if (!part || typeof part !== 'object') return false;
    if (mod === 'lesen') {
      return !!(part.items?.length || part.text || part.questions?.length || part.ads?.length);
    }
    if (mod === 'horen') {
      return !!(part.segments?.length || part.questions?.length || part.transcript || part.noteFields?.length);
    }
    return false;
  }
}

if (typeof window !== 'undefined') window.ExamValidator = ExamValidator;
if (typeof module !== 'undefined') module.exports = ExamValidator;
