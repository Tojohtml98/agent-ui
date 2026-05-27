const BASE = import.meta.env.VITE_API_URL || "";

export async function fetchModels() {
  const res = await fetch(`${BASE}/api/models`);
  return res.json();
}

export async function fetchConversations() {
  const res = await fetch(`${BASE}/api/conversations`);
  return res.json();
}

export async function fetchConversation(id) {
  const res = await fetch(`${BASE}/api/conversations/${id}`);
  if (!res.ok) throw new Error("No encontrada");
  return res.json();
}

export async function deleteConversation(id) {
  await fetch(`${BASE}/api/conversations/${id}`, { method: "DELETE" });
}

/**
 * Envía un mensaje y procesa el stream SSE.
 * @param {{conversationId?, model, message}} payload
 * @param {{onMeta, onToken, onDone, onError}} handlers
 */
export async function streamChat(payload, { onMeta, onToken, onDone, onError }) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    onError?.(new Error(`Servidor respondió ${res.status}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Los eventos SSE se separan por doble salto de línea.
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let event = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }

      if (!data) continue;
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      if (event === "meta") onMeta?.(parsed);
      else if (event === "token") onToken?.(parsed.text);
      else if (event === "done") onDone?.();
      else if (event === "error") onError?.(new Error(parsed.message));
    }
  }
}
