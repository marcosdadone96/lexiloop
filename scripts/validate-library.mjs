#!/usr/bin/env node
/**
 * Validates /library/{lang}/{level}/questions.json structure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'library/schemas/questions.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(SCHEMA);

const SUPPORTED = [
  ['de', 'B1'],
  ['de', 'B2'],
  ['en', 'B2'],
  ['en', 'C1'],
  ['es', 'B2'],
  ['es', 'C1'],
];

let errors = 0;

for (const [lang, level] of SUPPORTED) {
  const file = path.join(ROOT, 'library', lang, level, 'questions.json');
  if (!fs.existsSync(file)) {
    console.error('MISSING', path.relative(ROOT, file));
    errors++;
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!validate(data)) {
    console.error('INVALID', path.relative(ROOT, file), validate.errors);
    errors++;
    continue;
  }
  const lesen = data.questions.filter((q) => q.module === 'lesen' || q.module === 'reading').length;
  const horen = data.questions.filter((q) => q.module === 'horen' || q.module === 'listening').length;
  if (lesen < 2 || horen < 2) {
    console.error('INSUFFICIENT', path.relative(ROOT, file), `lesen=${lesen} horen=${horen}`);
    errors++;
    continue;
  }
  const missingExpl = data.questions.filter((q) => !q.explanation).length;
  const missingTags = data.questions.filter((q) => !(q.grammarTags || []).length).length;
  console.log(
    'OK',
    `${lang}/${level}`,
    `${data.questions.length} questions`,
    `(lesen ${lesen}, horen ${horen}, no-explanation ${missingExpl}, no-grammar ${missingTags})`,
  );
}

if (errors) {
  console.error(`\n${errors} library validation error(s)`);
  process.exit(1);
}
console.log('\nAll library files valid.');
