const SUGGESTIONS = [
  "Explicame qué es una API REST",
  "Escribí una función para validar emails en JS",
  "¿Cómo conecto Express con MongoDB?",
  "Dame ideas para un proyecto de portfolio",
];

export default function EmptyState({ onPick }) {
  return (
    <div className="empty">
      <div className="empty__icon">◆</div>
      <h1>¿En qué te ayudo hoy?</h1>
      <p>
        Chateá con Gemini 2.5 Flash o tu modelo local. Las conversaciones se
        guardan automáticamente.
      </p>
      <div className="empty__chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="empty__chip" onClick={() => onPick(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
