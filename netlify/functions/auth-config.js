'use strict';

const { getJwtSecret } = require('./lib/authLib.js');
const { corsHeaders, jsonResponse } = require('./lib/http.js');

exports.handler = async (event) => {
  const cors = corsHeaders(event, 'GET, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, cors, { error: 'method_not_allowed' });
  }
  return jsonResponse(200, cors, { enabled: Boolean(getJwtSecret()) });
};
