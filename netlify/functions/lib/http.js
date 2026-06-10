'use strict';

const DEFAULT_ORIGINS = [
  'https://www.lexicoil.com',
  'https://lexicoil.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8888',
  'http://127.0.0.1:8888',
];

function allowedOrigins() {
  const extra = (process.env.LEXICOIL_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

function corsHeaders(event, methods = 'POST, OPTIONS') {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowed = allowedOrigins();
  const isPreview =
    process.env.ALLOW_NETLIFY_PREVIEWS === 'true' && origin.includes('.netlify.app');
  const match =
    allowed.includes(origin) || isPreview
      ? origin
      : allowed[0];
  return {
    'Access-Control-Allow-Origin': match,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': methods,
    Vary: 'Origin',
  };
}

function getBearer(event) {
  const raw = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(raw));
  return m ? m[1].trim() : '';
}

function parseJsonBody(event) {
  let raw = event.body;
  if (event.isBase64Encoded && typeof raw === 'string') {
    raw = Buffer.from(raw, 'base64').toString('utf8');
  }
  return JSON.parse(raw || '{}');
}

function jsonResponse(statusCode, headers, body) {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

module.exports = { corsHeaders, getBearer, parseJsonBody, jsonResponse };
