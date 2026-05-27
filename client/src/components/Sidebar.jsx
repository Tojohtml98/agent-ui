export default function Sidebar({ conversations, activeId, onNew, onSelect, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">◆</div>
        AgentUI
      </div>

      <button className="btn-new" onClick={onNew}>
        ＋ Nueva conversación
      </button>

      <div className="convo-list">
        {conversations.length > 0 && (
          <div className="convo-list__label">Historial</div>
        )}
        {conversations.map((c) => (
          <button
            key={c._id}
            className={`convo-item ${c._id === activeId ? "active" : ""}`}
            onClick={() => onSelect(c._id)}
          >
            <span className="convo-item__title">{c.title}</span>
            <span
              className="convo-item__del"
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c._id);
              }}
            >
              ✕
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar__footer">
        Hecho por{" "}
        <a href="https://github.com/Tojohtml98" target="_blank" rel="noreferrer">
          Tomas Orella
        </a>
      </div>
    </aside>
  );
}
