export default function Message({ role, content, streaming }) {
  const isUser = role === "user";
  const isWaiting = streaming && !content; // esperando el primer token

  return (
    <div className={`msg msg--${role}`}>
      <div className="msg__avatar">{isUser ? "TU" : "AI"}</div>
      <div className="msg__body">
        {!isUser && <div className="msg__role">Asistente</div>}
        <div className="msg__content">
          {isWaiting ? (
            <span className="typing">
              <span></span>
              <span></span>
              <span></span>
            </span>
          ) : (
            <>
              {content}
              {streaming && <span className="cursor" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
