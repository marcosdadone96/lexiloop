#!/usr/bin/env node
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ExamValidator = require(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js/engine/validation/ExamValidator.js'));
const v = new ExamValidator();

function assert(label, cond) {
  if (!cond) {
    console.error('FAIL:', label);
    process.exit(1);
  }
  console.log('OK:', label);
}

const validExam = {
  goetheFormat: true,
  lesenParts: [
    {
      items: [
        {
          id: 'l1',
          question: 'Test?',
          options: ['a) One', 'b) Two', 'c) Three'],
          correct: 'b',
        },
      ],
    },
  ],
  horenParts: [
    {
      segments: [
        {
          id: 'h1',
          question: 'Topic?',
          options: ['A) X', 'B) Y', 'C) Z'],
          correct: 'B',
        },
      ],
    },
  ],
  gapfill: {
    sentences: [{ id: 'g1', text: 'Hello ___', answer: 'world' }],
  },
};

assert('valid exam passes', v.validate(validExam).valid);

const badMcq = JSON.parse(JSON.stringify(validExam));
badMcq.lesenParts[0].items[0].correct = 'z';
assert('mcq wrong key rejected', !v.validate(badMcq).valid);

const multiCorrect = JSON.parse(JSON.stringify(validExam));
multiCorrect.lesenParts[0].items[0].correct = ['a', 'b'];
assert('mcq multiple correct rejected', !v.validate(multiCorrect).valid);

const dupOpts = JSON.parse(JSON.stringify(validExam));
dupOpts.lesenParts[0].items[0].options = ['a) One', 'a) Dup', 'c) Three'];
assert('mcq duplicate options rejected', !v.validate(dupOpts).valid);

const emptyOpt = JSON.parse(JSON.stringify(validExam));
emptyOpt.lesenParts[0].items[0].options = ['a) One', 'b)', 'c) Three'];
assert('mcq empty option rejected', !v.validate(emptyOpt).valid);

const badGap = JSON.parse(JSON.stringify(validExam));
badGap.gapfill.sentences[0].answer = '';
assert('gap missing answer rejected', !v.validate(badGap).valid);

const badMatch = {
  goetheFormat: true,
  lesenParts: [
    {
      questions: [
        {
          id: 'm1',
          type: 'match',
          question: 'Who?',
          options: ['A', 'B', 'C', '0'],
          correct: 'X',
        },
      ],
      text: 'Sample text for reading.',
    },
  ],
  horenParts: [{ transcript: 'Hi', segments: [{ id: 's1', question: 'Q?', options: ['a) 1', 'b) 2'], correct: 'a' }] }],
};
assert('match invalid reference rejected', !v.validate(badMatch).valid);

console.log('\nExamValidator tests passed.');
