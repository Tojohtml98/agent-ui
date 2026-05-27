import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Message from "./components/Message.jsx";
import Composer from "./components/Composer.jsx";
import ModelSelector from "./components/ModelSelector.jsx";
import EmptyState from "./components/EmptyState.jsx";
import { useChat } from "./hooks/useChat.js";
import {
  fetchModels,
  fetchConversations,
  fetchConversation,
  deleteConversation,
} from "./api/client.js";

export default function App() {
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("gemini");
  const [conversations, setConversations] = useState([]);
  const scrollRef = useRef(null);

  const { conversationId, messages, isStreaming, error, send, reset, loadConversation } =
    useChat();

  // Cargar modelos e historial al inicio
  useEffect(() => {
    fetchModels().then(setModels).catch(() => {});
    refreshConversations();
  }, []);

  const refreshConversations = useCallback(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => {});
  }, []);

  // Auto-scroll al fondo cuando llegan mensajes/tokens
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Refrescar la lista cuando termina un stream (para títulos nuevos)
  useEffect(() => {
    if (!isStreaming && conversationId) refreshConversations();
  }, [isStreaming, conversationId, refreshConversations]);

  const handleSend = (text) => send(text, model);

  const handleSelect = async (id) => {
    try {
      const convo = await fetchConversation(id);
      loadConversation(convo);
    } catch {
      reset();
    }
  };

  const handleDelete = async (id) => {
    await deleteConversation(id);
    if (id === conversationId) reset();
    refreshConversations();
  };

  const isEmpty = messages.length === 0;
  const activeModelLabel = models.find((m) => m.key === model)?.label || "Modelo";

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={conversationId}
        onNew={reset}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />

      <main className="chat">
        <header className="chat__header">
          <span className="chat__title">{activeModelLabel}</span>
          <ModelSelector models={models} value={model} onChange={setModel} />
        </header>

        <div className="chat__scroll" ref={scrollRef}>
          {isEmpty ? (
            <EmptyState onPick={handleSend} />
          ) : (
            <div className="messages">
              {messages.map((m, i) => (
                <Message
                  key={i}
                  role={m.role}
                  content={m.content}
                  streaming={
                    isStreaming &&
                    i === messages.length - 1 &&
                    m.role === "assistant"
                  }
                />
              ))}
            </div>
          )}
        </div>

        <Composer onSend={handleSend} disabled={isStreaming} error={error} />
      </main>
    </div>
  );
}
