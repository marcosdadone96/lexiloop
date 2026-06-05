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

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!email || !password) {
    return jsonResponse(400, cors, { error: 'invalid_fields' });
  }

  const store = getStoreForEvent(event);
  let user;
  try {
    user = await store.get(userKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }
  if (!user || !user.passwordHash) {
    return jsonResponse(401, cors, { error: 'bad_credentials' });
  }
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return jsonResponse(401, cors, { error: 'bad_credentials' });
  }

  const session = signAuthToken(email, user.name);
  return jsonResponse(200, cors, {
    token: session.token,
    expiresAt: session.expiresAt,
    user: {
      name: user.name,
      email,
      plan: user.pro ? 'pro' : user.plan || 'free',
      pro: Boolean(user.pro),
    },
  });
};
