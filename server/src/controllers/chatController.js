import { Conversation } from "../models/Conversation.js";
import { MODELS, streamChat } from "../services/index.js";
import { isDBConnected } from "../config/db.js";

/**
 * GET /api/models — lista de modelos disponibles para el selector.
 */
export function listModels(_req, res) {
  const models = Object.entries(MODELS).map(([key, { label }]) => ({ key, label }));
  res.json(models);
}

/**
 * GET /api/conversations — historial (solo metadata, sin mensajes).
 */
export async function listConversations(_req, res) {
  if (!isDBConnected()) return res.json([]);
  const convos = await Conversation.find()
    .select("title model updatedAt")
    .sort({ updatedAt: -1 })
    .limit(50);
  res.json(convos);
}

/**
 * GET /api/conversations/:id — una conversación completa.
 */
export async function getConversation(req, res) {
  if (!isDBConnected()) return res.status(404).json({ error: "Sin persistencia" });
  const convo = await Conversation.findById(req.params.id);
  if (!convo) return res.status(404).json({ error: "No encontrada" });
  res.json(convo);
}

/**
 * DELETE /api/conversations/:id
 */
export async function deleteConversation(req, res) {
  if (!isDBConnected()) return res.status(404).json({ error: "Sin persistencia" });
  await Conversation.findByIdAndDelete(req.params.id);
  res.status(204).end();
}

/**
 * POST /api/chat — envía un mensaje y recibe la respuesta por streaming (SSE).
 * Body: { conversationId?, model, message }
 *
 * Eventos SSE emitidos:
 *   - "meta"  → { conversationId }   (al inicio, por si era nueva)
 *   - "token" → { text }             (cada fragmento del modelo)
 *   - "done"  → { }                  (al terminar)
 *   - "error" → { message }
 */
export async function chat(req, res) {
  const { conversationId, model = "gemini", message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Falta el campo 'message'" });
  }

  // Cargar o crear la conversación
  let convo = null;
  if (isDBConnected()) {
    convo = conversationId ? await Conversation.findById(conversationId) : null;
    if (!convo) convo = new Conversation({ model });
  }

  // Construir el historial que ve el modelo
  const history = convo ? [...convo.messages] : [];
  history.push({ role: "user", content: message });

  // Cabeceras SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let fullResponse = "";

  try {
    if (convo) send("meta", { conversationId: convo._id.toString() });

    for await (const token of streamChat(model, history)) {
      fullResponse += token;
      send("token", { text: token });
    }

    // Persistir si hay DB
    if (convo) {
      convo.messages.push({ role: "user", content: message });
      convo.messages.push({ role: "assistant", content: fullResponse });
      convo.model = model;
      if (convo.messages.length <= 2) convo.deriveTitle();
      await convo.save();
    }

    send("done", {});
    res.end();
  } catch (err) {
    console.error("Error en chat:", err.message);
    send("error", { message: err.message });
    res.end();
  }
}
