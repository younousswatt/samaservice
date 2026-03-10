import { useState } from "react";
import "./ProviderModal.css";

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

export default function ProviderModal({ provider, onClose }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [message,  setMessage]  = useState("");
  const [messages, setMessages] = useState([
    { from: "system", text: `Conversation avec ${provider?.name || "le prestataire"}` }
  ]);

  if (!provider) return null;

  // ── Ouvre le dialer natif ─────────────────────────────────
  const handleCall = () => {
    if (provider.phone) window.location.href = `tel:${provider.phone}`;
  };

  // ── Ouvre l'app SMS native ────────────────────────────────
  const handleSMS = () => {
    if (provider.phone) window.location.href = `sms:${provider.phone}`;
  };

  // ── Mini chat ─────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { from: "client", text: message.trim() }]);
    setMessage("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "provider", text: "Merci pour votre message ! Je vous réponds dès que possible. 🙏" },
      ]);
    }, 1000);
  };

  // services peut être undefined pour les prestataires Firestore → protection
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

        {/* ── PROFIL ────────────────────────────────────── */}
        {!chatOpen ? (
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
                {provider.distance  ? ` • ${provider.distance} km` : ""}
                {provider.quartier  ? ` • ${provider.quartier}`    : ""}
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

            {/* Téléphone */}
            {provider.phone && (
              <div className="provider-modal__info-row">
                📱 <span>{provider.phone}</span>
              </div>
            )}

            {/* Localisation */}
            {(provider.quartier || provider.ville) && (
              <div className="provider-modal__info-row">
                📍 <span>{[provider.quartier, provider.ville].filter(Boolean).join(", ")}</span>
              </div>
            )}

            {/* Services proposés — seulement si disponibles */}
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

            {/* 3 boutons d'action */}
            <div className="provider-modal__actions">
              <button className="provider-modal__btn provider-modal__btn--call" onClick={handleCall}>
                📞 Appeler
              </button>
              <button className="provider-modal__btn provider-modal__btn--sms" onClick={handleSMS}>
                💬 SMS
              </button>
              <button className="provider-modal__btn provider-modal__btn--chat" onClick={() => setChatOpen(true)}>
                🗨️ Chat
              </button>
            </div>

          </div>
        ) : (

          /* ── MINI CHAT ──────────────────────────────── */
          <div className="provider-modal__chat">
            <button className="provider-modal__chat-back" onClick={() => setChatOpen(false)}>
              ← Retour au profil
            </button>

            <div className="provider-modal__chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble chat-bubble--${msg.from}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="provider-modal__chat-input-row">
              <input
                type="text"
                className="provider-modal__chat-input"
                placeholder="Écrivez votre message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                className="provider-modal__chat-send"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
