'use strict';

const bcrypt = require('bcryptjs');
const { getStoreForEvent } = require('./lib/blobStore.js');
const {
  getJwtSecret,
  normalizeEmail,
  userKey,
  signAuthToken,
} = require('./lib/authLib.js');
const { corsHeaders, parseJsonBody, jsonResponse } = require('./lib/http.js');

exports.handler = async (event) => {
  const cors = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, cors, { error: 'method_not_allowed' });
  }
  if (!getJwtSecret()) {
    return jsonResponse(503, cors, { error: 'auth_not_configured' });
  }

  let body;
  try {
    body = parseJsonBody(event);
  } catch (_) {
    return jsonResponse(400, cors, { error: 'invalid_json' });
  }

  const name = String(body.name || '').trim().slice(0, 80);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!name || !email || password.length < 6) {
    return jsonResponse(400, cors, { error: 'invalid_fields' });
  }

  const store = getStoreForEvent(event);
  const key = userKey(email);
  try {
    const existing = await store.get(key, { type: 'json' });
    if (existing) return jsonResponse(409, cors, { error: 'email_taken' });
  } catch (_) {
    /* not found */
  }

  const user = {
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    plan: 'free',
    pro: false,
    createdAt: Date.now(),
  };
  await store.setJSON(key, user);

  const session = signAuthToken(email, name);
  return jsonResponse(200, cors, {
    token: session.token,
    expiresAt: session.expiresAt,
    user: { name, email, plan: 'free', pro: false },
  });
};
