/**
 * ExamGenerator — Phase 07
 * Content types: Exam, MiniExam, personalized vocabulary exams
 */
const ExamGenerator = (() => {
  function getPromptBuilder() {
    if (typeof PromptBuilder !== 'undefined') return PromptBuilder;
    return require('../prompts/PromptBuilder.js');
  }

  function getChunkRunner() {
    if (typeof ChunkRunner !== 'undefined') return ChunkRunner;
    return require('./chunkRunner.js');
  }

  function getExamValidator() {
    if (typeof ExamValidator !== 'undefined') return ExamValidator;
    try {
      return require('../validation/ExamValidator.js');
    } catch {
      return null;
    }
  }

  function assertExamValid(exam, hooks) {
    const Validator = getExamValidator();
    if (!Validator) return exam;
    const normalized =
      typeof hooks.normalizeExam === 'function' ? hooks.normalizeExam(exam) : exam;
    const result = new Validator().validate(normalized);
    if (!result.valid) {
      const err = new Error('Generated exam failed validation: ' + result.errors.join(', '));
      err.code = 'exam_invalid';
      err.validationErrors = result.errors;
      throw err;
    }
    return normalized;
  }

  function resolveChunks(spec) {
    const PB = getPromptBuilder();
    const built = PB.buildPrompt(spec);
    if (built.mode === 'chunks' && built.chunks?.length) return built.chunks;
    throw new Error('Exam spec did not produce chunks');
  }

  async function generate(spec, hooks, options) {
    const opts = options || {};
    const chunks = opts.legacyChunks || resolveChunks(spec);

    const parts = await getChunkRunner().run(chunks, hooks);
    const topic = spec.topic || 'Exam';
    const merged = hooks.mergeExamParts(...parts, topic);
    const exam = assertExamValid(merged, hooks);
    if (hooks.commitExamQuota) await hooks.commitExamQuota();
    return exam;
  }

  /** Single-shot personalized / vocabulary exam */
  async function generatePersonal(spec, hooks) {
    const PB = getPromptBuilder();
    const built = PB.buildPrompt(spec);
    if (built.mode !== 'single') {
      throw new Error('Personal exam requires single prompt mode');
    }
    const raw = await hooks.callAI(built.prompt, built.maxTokens, {
      consumeQuota: true,
      examGeneration: true,
    });
    const parsed = hooks.parseExamJson(raw.replace(/```json|```/g, '').trim());
    return assertExamValid(parsed, hooks);
  }

  return Object.freeze({
    contentTypes: ['Exam', 'MiniExam'],
    generate,
    generatePersonal,
  });
})();

if (typeof window !== 'undefined') window.ExamGenerator = ExamGenerator;
if (typeof module !== 'undefined') module.exports = ExamGenerator;
