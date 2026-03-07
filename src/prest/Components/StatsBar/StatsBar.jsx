import "./StatsBar.css";

const DEFAULT_STATS = [
  { icon: "👁️", value: "24",   label: "Vues",    highlight: false },
  { icon: "📞", value: "8",    label: "Appels",  highlight: false },
  { icon: "⭐", value: "4.8",  label: "Note",    highlight: true  },
];

export default function StatsBar({ stats = DEFAULT_STATS }) {
  return (
    <div className="statsbar">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`statsbar__card${s.highlight ? " statsbar__card--highlight" : ""}`}
        >
          <span className="statsbar__icon">{s.icon}</span>
          <span className="statsbar__value">{s.value}</span>
          <span className="statsbar__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
