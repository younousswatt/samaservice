import "./ProviderModal.css";

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

export default function ProviderModal({ provider, onClose, onOpenChat }) {
  if (!provider) return null;

  const handleCall = () => { if (provider.phone) window.location.href = `tel:${provider.phone}`; };
  const handleSMS  = () => { if (provider.phone) window.location.href = `sms:${provider.phone}`; };
  const handleChat = () => { onClose(); onOpenChat(provider); };

  const servicesList = Array.isArray(provider.services) ? provider.services : [];

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

          <div className="provider-modal__hero">
            <div className="provider-modal__avatar">{initials(provider.name)}</div>
            <div className="provider-modal__badges">
              {provider.verified && (
                <span className="provider-modal__badge provider-modal__badge--pro">PRO ✅</span>
              )}
              <span className={`provider-modal__badge ${provider.available ? "provider-modal__badge--avail" : "provider-modal__badge--busy"}`}>
                {provider.available ? "Disponible" : "Occupé"}
              </span>
            </div>
            <div className="provider-modal__meta">
              {provider.service}
              {provider.distance ? ` • ${provider.distance} km` : ""}
              {provider.quartier ? ` • ${provider.quartier}`   : ""}
            </div>
            <div>
              <span className="provider-modal__stars">
                {"★".repeat(Math.floor(provider.rating || 0))}
              </span>
              <span className="provider-modal__rating-text">
                {provider.rating || "–"} ({provider.reviews || 0} avis)
              </span>
            </div>
          </div>

          {provider.phone && (
            <div className="provider-modal__info-row">📱 <span>{provider.phone}</span></div>
          )}

          {(provider.quartier || provider.ville) && (
            <div className="provider-modal__info-row">
              📍 <span>{[provider.quartier, provider.ville].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {servicesList.length > 0 && (
            <>
              <div className="provider-modal__section-title">Services proposés</div>
              <div className="provider-modal__tags">
                {servicesList.map((s) => (
                  <span key={s} className="provider-modal__tag">{s}</span>
                ))}
              </div>
            </>
          )}

          <div className="provider-modal__actions">
            <button className="provider-modal__btn provider-modal__btn--call" onClick={handleCall}>
              📞 Appeler
            </button>
            <button className="provider-modal__btn provider-modal__btn--sms" onClick={handleSMS}>
              💬 SMS
            </button>
            <button className="provider-modal__btn provider-modal__btn--chat" onClick={handleChat}>
              🗨️ Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
