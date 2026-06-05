'use strict';

const { verifyJwt } = require('./jwt.js');

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET || process.env.LEXILOOP_JWT_SECRET;
  if (!secret || String(secret).length < 16) return null;
  return String(secret);
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function userKey(email) {
  return `user:${normalizeEmail(email)}`;
}

function syncKey(email) {
  return `sync:${normalizeEmail(email)}`;
}

function verifyAuthToken(token) {
  const secret = getJwtSecret();
  if (!secret) return { ok: false, error: 'misconfigured' };
  const payload = verifyJwt(token, secret);
  if (!payload || payload.typ !== 'll-auth' || typeof payload.sub !== 'string') {
    return { ok: false, error: 'unauthorized' };
  }
  const email = normalizeEmail(payload.sub);
  if (!email) return { ok: false, error: 'unauthorized' };
  return { ok: true, email, payload };
}

function signAuthToken(email, name) {
  const secret = getJwtSecret();
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 30;
  const { signJwt } = require('./jwt.js');
  return {
    token: signJwt(
      {
        sub: normalizeEmail(email),
        name: String(name || '').slice(0, 80),
        typ: 'll-auth',
        iat: now,
        exp,
      },
      secret,
    ),
    expiresAt: exp * 1000,
  };
}

module.exports = {
  getJwtSecret,
  normalizeEmail,
  userKey,
  syncKey,
  verifyAuthToken,
  signAuthToken,
};
