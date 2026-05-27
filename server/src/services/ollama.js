/**
 * Servicio de Ollama (modelo local) con streaming.
 * Fallback gratuito y sin límites cuando se agota el free tier de Gemini.
 */

const MODEL = "qwen3:8b";

/**
 * Stream de tokens desde Ollama. Devuelve un async generator de strings.
 * @param {Array<{role, content}>} messages
 */
export async function* streamOllama(messages) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama ${res.status}: ${text}`);
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
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed);
        const text = parsed?.message?.content;
        if (text) yield text;
      } catch {
        // línea incompleta
      }
    }
  }
}
