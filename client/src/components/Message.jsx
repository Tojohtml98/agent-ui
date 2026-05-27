export default function Message({ role, content, streaming }) {
  const isUser = role === "user";
  return (
    <div className={`msg msg--${role}`}>
      <div className="msg__avatar">{isUser ? "TU" : "AI"}</div>
      <div className="msg__body">
        {!isUser && <div className="msg__role">Asistente</div>}
        <div className="msg__content">
          {content}
          {streaming && <span className="cursor" />}
        </div>
      </div>
    </div>
  );
}
