import "./ServiceGrid.css";

export const ALL_SERVICES = [
  { id: "plombier",      label: "Plombier",      icon: "🔧" },
  { id: "electricien",   label: "Électricien",    icon: "⚡" },
  { id: "macon",         label: "Maçon",          icon: "🧱" },
  { id: "peintre",       label: "Peintre",        icon: "🎨" },
  { id: "jardinier",     label: "Jardinier",      icon: "🌿" },
  { id: "cuisinier",     label: "Cuisinier",      icon: "🍳" },
  { id: "couturier",     label: "Couturier",      icon: "🪡" },
  { id: "coiffeur",      label: "Coiffeur",       icon: "✂️" },
  { id: "climatisation", label: "Clim",           icon: "❄️" },
  { id: "menage",        label: "Ménage",         icon: "🧹" },
  { id: "reparation",    label: "Réparation",     icon: "🔩" },
  { id: "livraison",     label: "Livraison",      icon: "📦" },
];

// Show first 7 tiles + "Voir tout"
const VISIBLE = 7;

export default function ServiceGrid({ activeService, onSelect }) {
  const visible = ALL_SERVICES.slice(0, VISIBLE);

  return (
    <div className="service-grid">
      <div className="service-grid__title">Nos services</div>
      <div className="service-grid__grid">
        {visible.map((s) => (
          <button
            key={s.id}
            className={`service-grid__tile${activeService === s.label ? " service-grid__tile--active" : ""}`}
            onClick={() => onSelect(s.label)}
            aria-label={s.label}
          >
            <span className="service-grid__icon">{s.icon}</span>
            <span className="service-grid__name">{s.label}</span>
          </button>
        ))}
        <button
          className="service-grid__tile service-grid__more"
          onClick={() => onSelect(null)}
          aria-label="Voir tout"
        >
          <span className="service-grid__icon">➕</span>
          <span className="service-grid__name">Tout</span>
        </button>
      </div>
    </div>
  );
}
