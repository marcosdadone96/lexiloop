const CLAUDE_ENDPOINT = "/.netlify/functions/claude-chat";

async function callAI(prompt, maxTokens = 6000) {
  const res = await fetch(CLAUDE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("AI request failed");
  }

  if (!res.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data.text;
}
