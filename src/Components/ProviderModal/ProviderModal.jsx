import { useState, useEffect } from "react";
import { getReviews } from "../../reviewService";
import "./ProviderModal.css";

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

function StarDisplay({ rating = 0, size = "sm" }) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <span className={`star-display star-display--${size}`}>
      {"★".repeat(full)}{"☆".repeat(empty)}
    </span>
  );
}

export default function ProviderModal({ provider, onClose, onOpenChat }) {
  const [reviews,     setReviews]     = useState([]);
  const [loadingRevs, setLoadingRevs] = useState(true);
  const [showAllRevs, setShowAllRevs] = useState(false);

  useEffect(() => {
    if (!provider?.id) return;
    getReviews(provider.id)
      .then((data) => { setReviews(data); setLoadingRevs(false); })
      .catch(()    => { setLoadingRevs(false); });
  }, [provider?.id]);

  if (!provider) return null;

  const handleCall = () => { if (provider.phone) window.location.href = `tel:${provider.phone}`; };
  const handleSMS  = () => { if (provider.phone) window.location.href = `sms:${provider.phone}`; };
  const handleChat = () => { onClose(); onOpenChat(provider); };

  const servicesList   = Array.isArray(provider.services) ? provider.services : [];
  const displayReviews = showAllRevs ? reviews : reviews.slice(0, 3);

  const formatDate = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

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

          {/* ── Hero ──────────────────────────────────── */}
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
              {provider.quartier ? ` • ${provider.quartier}`    : ""}
            </div>

            {/* Note globale */}
            <div className="provider-modal__rating-row">
              <StarDisplay rating={provider.rating || 0} size="md" />
              <span className="provider-modal__rating-value">{provider.rating || "–"}</span>
              <span className="provider-modal__rating-count">({provider.reviews || 0} avis)</span>
            </div>
          </div>

          {/* ── Infos ─────────────────────────────────── */}
          {provider.phone && (
            <div className="provider-modal__info-row">📱 <span>{provider.phone}</span></div>
          )}
          {(provider.quartier || provider.ville) && (
            <div className="provider-modal__info-row">
              📍 <span>{[provider.quartier, provider.ville].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {/* ── Services ──────────────────────────────── */}
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

          {/* ── Actions ───────────────────────────────── */}
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

          {/* ── Avis clients ──────────────────────────── */}
          <div className="provider-modal__section-title" style={{ marginTop: 20 }}>
            Avis clients {reviews.length > 0 && `(${reviews.length})`}
          </div>

          {loadingRevs ? (
            <div className="provider-modal__revs-loading">
              <div className="provider-modal__revs-spinner" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="provider-modal__revs-empty">
              Pas encore d'avis — soyez le premier à noter !
            </div>
          ) : (
            <>
              {displayReviews.map((rev) => (
                <div key={rev.id} className="provider-modal__review">
                  <div className="provider-modal__review-top">
                    <div className="provider-modal__review-avatar">
                      {rev.clientName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="provider-modal__review-meta">
                      <span className="provider-modal__review-name">{rev.clientName || "Anonyme"}</span>
                      <span className="provider-modal__review-date">{formatDate(rev.createdAt)}</span>
                    </div>
                    <StarDisplay rating={rev.rating || 0} size="sm" />
                  </div>
                  {rev.comment && (
                    <p className="provider-modal__review-comment">"{rev.comment}"</p>
                  )}
                </div>
              ))}

              {reviews.length > 3 && (
                <button
                  className="provider-modal__revs-more"
                  onClick={() => setShowAllRevs((v) => !v)}
                >
                  {showAllRevs
                    ? "Voir moins ↑"
                    : `Voir les ${reviews.length - 3} autres avis ↓`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
