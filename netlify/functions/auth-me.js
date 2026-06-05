'use strict';

const { getStoreForEvent } = require('./lib/blobStore.js');
const { getJwtSecret, verifyAuthToken } = require('./lib/authLib.js');
const { corsHeaders, getBearer, jsonResponse } = require('./lib/http.js');

exports.handler = async (event) => {
  const cors = corsHeaders(event, 'GET, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, cors, { error: 'method_not_allowed' });
  }
  if (!getJwtSecret()) {
    return jsonResponse(503, cors, { error: 'auth_not_configured', enabled: false });
  }

  const auth = verifyAuthToken(getBearer(event));
  if (!auth.ok) {
    return jsonResponse(401, cors, { error: auth.error || 'unauthorized' });
  }

  const store = getStoreForEvent(event);
  let user;
  try {
    user = await store.get(`user:${auth.email}`, { type: 'json' });
  } catch (_) {
    user = null;
  }
  if (!user) {
    return jsonResponse(401, cors, { error: 'unauthorized' });
  }

  return jsonResponse(200, cors, {
    enabled: true,
    user: {
      name: user.name,
      email: auth.email,
      plan: user.pro ? 'pro' : user.plan || 'free',
      pro: Boolean(user.pro),
    },
  });
};
