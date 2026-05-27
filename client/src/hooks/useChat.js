import { useState, useCallback } from "react";
import { streamChat } from "../api/client.js";

/**
 * Maneja el estado de una conversación: mensajes, streaming y envío.
 */
export function useChat() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const loadConversation = useCallback((convo) => {
    setConversationId(convo._id);
    setMessages(convo.messages || []);
    setError(null);
  }, []);

  const send = useCallback(
    async (text, model) => {
      setError(null);
      setIsStreaming(true);

      // Push del mensaje del usuario + placeholder del asistente
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "" },
      ]);

      await streamChat(
        { conversationId, model, message: text },
        {
          onMeta: ({ conversationId: id }) => setConversationId(id),
          onToken: (token) => {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "assistant",
                content: next[next.length - 1].content + token,
              };
              return next;
            });
          },
          onDone: () => setIsStreaming(false),
          onError: (err) => {
            setError(err.message);
            setIsStreaming(false);
          },
        }
      );
    },
    [conversationId]
  );

  return { conversationId, messages, isStreaming, error, send, reset, loadConversation };
}
