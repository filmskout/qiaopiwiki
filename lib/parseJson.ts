/** Robust JSON parsing for LLM output: strips markdown fences, finds first {...} or [...] block. */
export function parseJsonLoose<T>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();

  // Strip ```json ... ``` or ``` ... ``` fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through to bracket extraction
  }

  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let start = -1;
  let openChar = "{";
  let closeChar = "}";
  if (firstBrace === -1 && firstBracket === -1) return null;
  if (firstBrace === -1) {
    start = firstBracket;
    openChar = "[";
    closeChar = "]";
  } else if (firstBracket === -1) {
    start = firstBrace;
  } else if (firstBrace < firstBracket) {
    start = firstBrace;
  } else {
    start = firstBracket;
    openChar = "[";
    closeChar = "]";
  }

  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    else if (text[i] === closeChar) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}
