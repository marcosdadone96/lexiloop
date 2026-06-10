'use strict';



const { getStoreForEvent } = require('./lib/blobStore.js');

const { getJwtSecret, verifyAuthToken, userKey } = require('./lib/authLib.js');

const { getQuotaState, resolvePlan, maxForPlan, getMonthKey } = require('./lib/quotaLib.js');

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

    user = await store.get(userKey(auth.email), { type: 'json' });

  } catch (_) {

    user = null;

  }

  if (!user) {

    return jsonResponse(401, cors, { error: 'unauthorized' });

  }

  if (user.tokenVersion != null && auth.payload.tv !== user.tokenVersion) {
    return jsonResponse(401, cors, { error: 'token_revoked' });
  }

  const plan = resolvePlan(user);
  const max = maxForPlan(plan);
  let used = 0;
  const month = getMonthKey();

  try {
    const q = await store.get(`quota:${auth.email}`, { type: 'json' });
    if (q && q.month === month) used = Math.min(Number(q.used) || 0, max);
  } catch (_) {
    /* fresh */
  }



  return jsonResponse(200, cors, {

    enabled: true,

    user: {

      name: user.name,

      email: auth.email,

      avatar: (user.name || auth.email || '?')[0].toUpperCase(),

      plan,

      pro: plan === 'pro',

      quota: { used, max, month },

      proActivatedAt: user.proActivatedAt || null,

      memberSince: user.createdAt || null,

    },

  });

};

