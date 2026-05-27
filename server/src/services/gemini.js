/**
 * Servicio de Gemini usando la API REST con streaming (SSE).
 * Usa fetch nativo (Node 20+), sin SDK, para mantener las deps mínimas.
 */

const MODEL = "gemini-2.5-flash";

/**
 * Convierte nuestro historial [{role, content}] al formato de Gemini.
 * Gemini usa "user" y "model" como roles.
 */
function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/**
 * Stream de tokens desde Gemini. Devuelve un async generator de strings.
 * @param {Array<{role, content}>} messages
 */
export async function* streamGemini(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: toGeminiContents(messages) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API ${res.status}: ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const json = trimmed.slice(5).trim();
      if (!json) continue;

      try {
        const parsed = JSON.parse(json);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // fragmento incompleto, se ignora
      }
    }
  }
}
