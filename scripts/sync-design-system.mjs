#!/usr/bin/env node
/** Copy canonical design-system CSS into landing/public (single source: assets/css/). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets', 'css', 'lexicoil-design-system.css');
const DEST_DIR = path.join(ROOT, 'landing', 'public', 'assets', 'css');
const DEST = path.join(DEST_DIR, 'lexicoil-design-system.css');

if (!fs.existsSync(SRC)) {
  console.error('Missing source:', SRC);
  process.exit(1);
}
fs.mkdirSync(DEST_DIR, { recursive: true });
fs.copyFileSync(SRC, DEST);
console.log('Synced design system → landing/public/assets/css/lexicoil-design-system.css');
