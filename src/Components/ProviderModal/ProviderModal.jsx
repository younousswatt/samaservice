import "./ProviderModal.css";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("");
}

export default function ProviderModal({ provider, onClose }) {
  if (!provider) return null;

  return (
    <div
      className="provider-modal__overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="provider-modal__sheet">
        <div className="provider-modal__handle" />

        <div className="provider-modal__header">
          <h2>{provider.name}</h2>
          <button className="provider-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="provider-modal__body">
          {/* Hero */}
          <div className="provider-modal__hero">
            <div className="provider-modal__avatar">{initials(provider.name)}</div>
            <div className="provider-modal__badges">
              {provider.verified && (
                <span style={{
                  fontSize: ".68rem", padding: ".18rem .6rem",
                  borderRadius: "20px", background: "linear-gradient(135deg,#1A2517,#3A5432)",
                  color: "#ACC8A2", fontWeight: 700
                }}>PRO</span>
              )}
              <span style={{
                fontSize: ".68rem", padding: ".18rem .6rem",
                borderRadius: "20px",
                background: provider.available ? "#ecfdf5" : "#fef2f2",
                color: provider.available ? "#047857" : "#991b1b",
                fontWeight: 600
              }}>
                {provider.available ? "Disponible" : "Occupé"}
              </span>
            </div>
            <div className="provider-modal__meta">
              {provider.service} • {provider.distance} km de vous
            </div>
            <div>
              <span className="provider-modal__stars">{"★".repeat(Math.floor(provider.rating))}</span>
              <span className="provider-modal__rating-text">
                {provider.rating} ({provider.reviews} avis)
              </span>
            </div>
          </div>

          {/* Services */}
          <div className="provider-modal__section-title">Services proposés</div>
          <div className="provider-modal__tags">
            {provider.services.map((s) => (
              <span key={s} className="provider-modal__tag">{s}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="provider-modal__actions">
            <button
              className="provider-modal__btn-call"
              onClick={() => alert("Appel vers " + provider.phone)}
            >
              📞 Appeler
            </button>
            <button
              className="provider-modal__btn-sms"
              onClick={() => alert("SMS envoyé à " + provider.phone)}
            >
              💬 SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
