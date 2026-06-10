'use strict';

// ??? LexiCoil  quotaLib.js ???????????????????????????????????????????????????
// Server-side quota management using Netlify Blobs.
// Used by claudeProxy (ESM) via direct logic copy, and by CJS functions here.
// ??????????????????????????????????????????????????????????????????????????????

const crypto        = require('crypto');
const { getStoreForEvent } = require('./blobStore.js');
const { verifyAuthToken, userKey } = require('./authLib.js');
const { getBearer }  = require('./http.js');

const GUEST_MAX     = 2;
const FREE_MAX      = 2;
const PRO_MAX       = 20;
const GUEST_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function hashIp(ip) {
  const salt = process.env.AUTH_JWT_SECRET || process.env.LEXICOIL_JWT_SECRET || 'lexicoil-guest';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 32);
}

function getClientIp(event) {
  const fwd =
    (event.headers &&
      (event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'])) || '';
  const ip = String(fwd).split(',')[0].trim();
  return ip || 'unknown';
}

async function loadUser(store, email) {
  try {
    return await store.get(userKey(email), { type: 'json' });
  } catch (_) {
    return null;
  }
}

function resolvePlan(user) {
  if (!user) return 'free';
  if (user.pro || user.plan === 'pro') return 'pro';
  return 'free';
}

function maxForPlan(plan) {
  if (plan === 'pro')   return PRO_MAX;
  if (plan === 'guest') return GUEST_MAX;
  return FREE_MAX;
}

// Returns full quota state object  used by checkQuota and incrementQuota
async function getQuotaState(event) {
  const store = getStoreForEvent(event);
  const token = getBearer(event);
  const auth  = token ? verifyAuthToken(token) : { ok: false };

  if (auth.ok) {
    const user = await loadUser(store, auth.email);
    if (!user) return { ok: false, error: 'unauthorized' };

    const plan  = resolvePlan(user);
    const month = getMonthKey();
    const qKey  = `quota:${auth.email}`;
    let used = 0;
    const max = maxForPlan(plan);
    try {
      const q = await store.get(qKey, { type: 'json' });
      if (q && q.month === month) used = Number(q.used) || 0;
    } catch (_) { /* fresh user */ }

    return {
      ok: true,
      authenticated: true,
      email: auth.email,
      plan,
      used,
      max,
      month,
      store,
      qKey,
    };
  }

  // Guest  identified by IP hash
  const ipHash = hashIp(getClientIp(event));
  const gKey   = `guest_quota:${ipHash}`;
  let used = 0;
  let expiresAt = 0;
  try {
    const g = await store.get(gKey, { type: 'json' });
    if (g) {
      expiresAt = g.expiresAt || 0;
      used = (expiresAt && Date.now() > expiresAt) ? 0 : (Number(g.used) || 0);
    }
  } catch (_) { /* fresh guest */ }

  return {
    ok: true,
    authenticated: false,
    plan: 'guest',
    used,
    max: GUEST_MAX,
    store,
    gKey,
    ipHash,
    expiresAt,
  };
}

// Returns { ok, used, max, plan, state } or { ok:false, status, error, ... }
async function checkQuota(event) {
  const state = await getQuotaState(event);
  if (!state.ok) return state;

  const cappedUsed = Math.min(Number(state.used) || 0, state.max);

  if (cappedUsed >= state.max) {
    return {
      ok:     false,
      status: 429,
      error:  'quota_exceeded',
      used:   cappedUsed,
      max:    state.max,
      plan:   state.plan,
    };
  }

  return {
    ok:    true,
    used:  state.used,
    max:   state.max,
    plan:  state.plan,
    state,
  };
}

// Call after a successful AI generation to persist the new count
async function incrementQuota(state) {
  if (!state || !state.ok) return null;
  const s       = state.state || state;
  const currentUsed = Math.min(Number(s.used) || 0, s.max);
  if (currentUsed >= s.max) {
    return { used: currentUsed, max: s.max, plan: s.plan, error: 'quota_exceeded' };
  }
  const newUsed = currentUsed + 1;

  if (s.authenticated) {
    const payload = { used: newUsed, month: getMonthKey() };
    await s.store.setJSON(s.qKey, payload);
    return { used: newUsed, max: s.max, plan: s.plan };
  }

  const payload = {
    used:      newUsed,
    createdAt: Date.now(),
    expiresAt: s.expiresAt || (Date.now() + GUEST_TTL_SEC * 1000),
  };
  await s.store.setJSON(s.gKey, payload);
  return { used: newUsed, max: GUEST_MAX, plan: 'guest' };
}

module.exports = {
  GUEST_MAX,
  FREE_MAX,
  PRO_MAX,
  getMonthKey,
  getQuotaState,
  checkQuota,
  incrementQuota,
  maxForPlan,
  resolvePlan,
};
