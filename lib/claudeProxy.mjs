const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const MAX_PROMPT_LEN = 16000;
const MAX_TOKENS = 8000;

const DEFAULT_ORIGINS = [
  "https://lexiloop.netlify.app",
  "https://lexiloop-exams.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8888",
  "http://127.0.0.1:8888",
];

export class ClaudeProxyError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function allowedOrigins() {
  const extra = (process.env.LEXILOOP_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

export function corsHeaders(origin) {
  const allowed = allowedOrigins();
  const match = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": match,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function parseBody(raw, isBase64Encoded) {
  let text = raw || "";
  if (isBase64Encoded && typeof text === "string") {
    text = Buffer.from(text, "base64").toString("utf8");
  }
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new ClaudeProxyError(400, "Invalid JSON body");
  }
}

export async function runClaudeChat(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ClaudeProxyError(503, "AI service is not configured on the server");
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) throw new ClaudeProxyError(400, "prompt is required");
  if (prompt.length > MAX_PROMPT_LEN) {
    throw new ClaudeProxyError(400, `prompt exceeds ${MAX_PROMPT_LEN} characters`);
  }

  const maxTokens = Math.min(
    Math.max(Number(body.maxTokens) || 6000, 1),
    MAX_TOKENS
  );
  const model =
    typeof body.model === "string" && body.model.trim()
      ? body.model.trim()
      : process.env.CLAUDE_MODEL || DEFAULT_MODEL;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ClaudeProxyError(
      res.status >= 500 ? 502 : res.status,
      data.error?.message || "Anthropic API request failed"
    );
  }

  const text = (data.content || []).map((part) => part.text || "").join("");
  return { text, usage: data.usage || null };
}

export async function handleClaudeHttpRequest(req, res, bodyOverride) {
  const origin = req.headers.origin || "";
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { ...cors, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const body =
      bodyOverride ??
      parseBody(
        await readRequestBody(req),
        req.headers["content-transfer-encoding"] === "base64"
      );
    const result = await runClaudeChat(body);
    res.writeHead(200, { ...cors, "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  } catch (err) {
    const status = err instanceof ClaudeProxyError ? err.statusCode : 500;
    const message =
      err instanceof ClaudeProxyError ? err.message : "Internal server error";
    res.writeHead(status, { ...cors, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export async function handleClaudeLambdaEvent(event) {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const cors = corsHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = parseBody(event.body, event.isBase64Encoded);
    const result = await runClaudeChat(body);
    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    const status = err instanceof ClaudeProxyError ? err.statusCode : 500;
    const message =
      err instanceof ClaudeProxyError ? err.message : "Internal server error";
    return {
      statusCode: status,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: message }),
    };
  }
}
