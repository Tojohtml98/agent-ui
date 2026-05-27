import { useRef, useState } from "react";

export default function Composer({ onSend, disabled, error }) {
  const [text, setText] = useState("");
  const taRef = useRef(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const autoGrow = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={autoGrow}
          onKeyDown={handleKeyDown}
          placeholder="Escribí un mensaje…"
        />
        <button
          className="composer__send"
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Enviar"
        >
          ↑
        </button>
      </div>
      <div className="composer__hint">
        {error ? (
          <span className="err">Error: {error}</span>
        ) : (
          "Enter para enviar · Shift+Enter para nueva línea"
        )}
      </div>
    </div>
  );
}
