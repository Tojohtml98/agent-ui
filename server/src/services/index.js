import { streamGemini } from "./gemini.js";
import { streamOllama } from "./ollama.js";

/**
 * Modelos disponibles, expuestos al frontend.
 */
export const MODELS = {
  gemini: { label: "Gemini 2.5 Flash", stream: streamGemini },
  ollama: { label: "Qwen3 8B (local)", stream: streamOllama },
};

/**
 * Devuelve el generador de stream para el modelo pedido.
 * Si Gemini falla (ej. límite de cuota), cae automáticamente a Ollama.
 */
export async function* streamChat(modelKey, messages) {
  const model = MODELS[modelKey] || MODELS.gemini;

  if (modelKey === "gemini") {
    try {
      yield* model.stream(messages);
      return;
    } catch (err) {
      console.warn(`⚠️  Gemini falló (${err.message}), cayendo a Ollama…`);
      yield* MODELS.ollama.stream(messages);
      return;
    }
  }

  yield* model.stream(messages);
}
