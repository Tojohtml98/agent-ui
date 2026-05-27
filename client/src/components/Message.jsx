export default function Message({ role, content, streaming }) {
  const isUser = role === "user";
  return (
    <div className={`msg msg--${role}`}>
      <div className="msg__avatar">{isUser ? "Vos" : "AI"}</div>
      <div className="msg__body">
        <div className="msg__role">{isUser ? "Vos" : "Asistente"}</div>
        <div className="msg__content">
          {content}
          {streaming && <span className="cursor" />}
        </div>
      </div>
    </div>
  );
}
