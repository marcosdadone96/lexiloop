'use strict';

const path = require('path');
const ExamValidator = require(path.join(__dirname, '../../../js/engine/validation/ExamValidator.js'));
const AnswerKeyVerifier = require(path.join(__dirname, '../../../js/engine/validation/AnswerKeyVerifier.js'));

const PLACEHOLDER_THRESHOLD = 5;
const PLACEHOLDER_RE = /\.\.\.|Option [A-D]"|"Text here"|"Question here"|Ein Text ueber|Ein Text über|An article about/gi;

function countPlaceholders(exam) {
  const text = JSON.stringify(exam || {});
  return (text.match(PLACEHOLDER_RE) || []).length;
}

/**
 * Structural + placeholder quality gate for generated exams.
 * Uses ExamValidator (answer-key structure) — does not change exam format.
 */
function validateGeneratedExam(exam) {
  const validator = new ExamValidator();
  const structural = validator.validate(exam);
  const errors = [...(structural.errors || [])];

  const placeholders = countPlaceholders(exam);
  if (placeholders > PLACEHOLDER_THRESHOLD) {
    errors.push('exam_placeholder_content');
  }

  return {
    valid: errors.length === 0,
    errors,
    placeholders,
  };
}

/**
 * Optional second pass: Haiku "solves" MCQs and compares with marked key.
 * Enabled only when EXAM_ANSWER_KEY_VERIFY=1.
 */
async function verifyAnswerKeysWithAI(exam, apiKey) {
  if (process.env.EXAM_ANSWER_KEY_VERIFY !== '1') {
    return { ok: true, skipped: true, reason: 'disabled' };
  }
  if (!apiKey) {
    return { ok: true, skipped: true, reason: 'no_api_key' };
  }

  const verifier = new AnswerKeyVerifier();
  const items = verifier.collectMcqItems(exam);
  if (!items.length) {
    return { ok: true, skipped: true, reason: 'no_mcq_items' };
  }

  const model = String(process.env.CLAUDE_VERIFY_MODEL || 'claude-haiku-4-5').trim();
  const prompt = verifier.buildSolverPrompt(items);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn('[examQualityGate] answer-key verify API error:', data?.error?.message || res.status);
    return { ok: true, skipped: true, reason: 'api_error' };
  }

  const text = (data.content || []).map((p) => p.text || '').join('');
  const solved = verifier.parseSolverResponse(text);
  const discrepancies = verifier.compare(items, solved);
  const mismatchRatio = items.length ? discrepancies.length / items.length : 0;
  const threshold = Number(process.env.EXAM_ANSWER_KEY_MISMATCH_THRESHOLD || 0.35);

  if (mismatchRatio >= threshold) {
    return {
      ok: false,
      skipped: false,
      discrepancies,
      mismatchRatio,
      message: 'answer_key_verify_mismatch',
    };
  }

  return { ok: true, skipped: false, discrepancies, mismatchRatio };
}

module.exports = {
  validateGeneratedExam,
  verifyAnswerKeysWithAI,
  PLACEHOLDER_THRESHOLD,
};
