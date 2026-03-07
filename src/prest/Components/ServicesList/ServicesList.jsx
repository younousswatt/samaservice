import "./ServicesList.css";

const DEFAULT_SERVICES = ["Fuite d'eau", "Installation", "Débouchage", "Réparation"];

export default function ServicesList({ services = DEFAULT_SERVICES, onAdd }) {
  return (
    <div className="services-list">
      <div className="services-list__title">Mes services</div>
      <div className="services-list__tags">
        {services.map((s) => (
          <span key={s} className="services-list__tag">
            {s}
          </span>
        ))}
        <button
          className="services-list__add"
          onClick={onAdd || (() => alert("Ajouter un service"))}
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}
