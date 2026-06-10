'use strict';

const path = require('path');
const { randomUUID } = require('crypto');
const { getStoreForEvent } = require('./lib/blobStore.js');
const { verifyAuthToken } = require('./lib/authLib.js');
const { corsHeaders, getBearer, parseJsonBody, jsonResponse } = require('./lib/http.js');
const { validateGeneratedExam } = require('./lib/examQualityGate.js');

const MAX_PER_LEVEL = 50;
const POOL_SAMPLE = 20;
const BURN_THRESHOLD = 100;

function poolIndexKey(lang, level) {
  return `pool_index:${lang}:${level}`;
}

function poolExamKey(lang, level, id) {
  return `pool:${lang}:${level}:${id}`;
}

function isValidExam(exam) {
  if (!exam || typeof exam !== 'object') return false;
  return validateGeneratedExam(exam).valid;
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

exports.handler = async (event) => {
  const cors = corsHeaders(event, 'GET, POST, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };

  const store = getStoreForEvent(event);

  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const lang = String(params.lang || '').trim().toLowerCase();
    const level = String(params.level || '').trim().toUpperCase();
    if (!lang || !level) {
      return jsonResponse(400, cors, { error: 'lang and level required' });
    }

    let index = [];
    try {
      index = (await store.get(poolIndexKey(lang, level), { type: 'json' })) || [];
    } catch (_) {
      index = [];
    }
    if (!index.length) {
      return jsonResponse(200, cors, { found: false });
    }

    const recent = index.slice(-POOL_SAMPLE);
    const candidates = pickRandom(recent, Math.min(recent.length, POOL_SAMPLE));
    const fresh = [];

    for (const key of candidates) {
      try {
        const entry = await store.get(key, { type: 'json' });
        if (entry && isValidExam(entry.exam) && (entry.servedCount || 0) <= BURN_THRESHOLD) {
          fresh.push({ key, entry });
        }
      } catch (_) {
        /* skip */
      }
    }

    let pool = fresh;
    if (!pool.length) {
      for (const key of candidates) {
        try {
          const entry = await store.get(key, { type: 'json' });
          if (entry && isValidExam(entry.exam)) pool.push({ key, entry });
        } catch (_) {
          /* skip */
        }
      }
    }
    if (!pool.length) {
      return jsonResponse(200, cors, { found: false });
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    chosen.entry.servedCount = (chosen.entry.servedCount || 0) + 1;
    chosen.entry.lastServedAt = Date.now();
    await store.setJSON(chosen.key, chosen.entry);

    return jsonResponse(200, cors, {
      found: true,
      exam: chosen.entry.exam,
      topic: chosen.entry.topic,
      source: 'pool',
    });
  }

  if (event.httpMethod === 'POST') {
    const auth = verifyAuthToken(getBearer(event));
    if (!auth.ok) {
      return jsonResponse(401, cors, { error: 'login_required' });
    }
    const contributor = auth.email;

    let body;
    try {
      body = parseJsonBody(event);
    } catch (_) {
      return jsonResponse(400, cors, { error: 'invalid_json' });
    }

    const lang = String(body.lang || '').trim().toLowerCase();
    const level = String(body.level || '').trim().toUpperCase();
    const topic = String(body.topic || '').trim().slice(0, 120);
    const exam = body.exam;
    const gate = validateGeneratedExam(exam);
    if (!lang || !level || !gate.valid) {
      if (exam && !gate.valid) {
        console.warn('[exam-pool] rejected exam:', gate.errors);
      }
      return jsonResponse(400, cors, {
        error: 'invalid_fields',
        validationErrors: gate.valid ? undefined : gate.errors,
      });
    }
    if (/personal\s*vocabulary|^personal:/i.test(topic)) {
      return jsonResponse(400, cors, { error: 'invalid_topic' });
    }
    if (exam.vocabPersonal || (Array.isArray(exam.vocabWords) && exam.vocabWords.length)) {
      return jsonResponse(400, cors, { error: 'personal_exam_not_allowed' });
    }

    const id = randomUUID();
    const key = poolExamKey(lang, level, id);
    const entry = {
      lang,
      level,
      topic,
      exam,
      servedCount: 0,
      createdAt: Date.now(),
      contributedBy: contributor,
    };
    await store.setJSON(key, entry);

    const iKey = poolIndexKey(lang, level);
    let index = [];
    try {
      index = (await store.get(iKey, { type: 'json' })) || [];
    } catch (_) {
      index = [];
    }
    index.push(key);
    if (index.length > MAX_PER_LEVEL) {
      const removed = index.shift();
      try {
        await store.delete(removed);
      } catch (_) {
        /* ignore */
      }
    }
    await store.setJSON(iKey, index);

    return jsonResponse(200, cors, { saved: true, key });
  }

  return jsonResponse(405, cors, { error: 'method_not_allowed' });
};
