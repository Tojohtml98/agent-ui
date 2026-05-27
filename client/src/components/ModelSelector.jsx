export default function ModelSelector({ models, value, onChange }) {
  return (
    <div className="model-select">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {models.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
