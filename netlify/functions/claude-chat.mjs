import { handleClaudeLambdaEvent } from "../../lib/claudeProxy.mjs";

export async function handler(event) {
  return handleClaudeLambdaEvent(event);
}
