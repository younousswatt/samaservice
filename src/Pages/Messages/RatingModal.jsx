import { useState } from "react";
import { auth } from "../../firebase";
import { submitReview, hasAlreadyReviewed } from "../../reviewService";
import "./RatingModal.css";

export default function RatingModal({ provider, clientName, onClose, onSubmitted }) {
  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [comment,   setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  const uid = auth.currentUser?.uid;

  const handleSubmit = async () => {
    if (rating === 0) { setError("Choisissez une note entre 1 et 5 étoiles."); return; }
    setSubmitting(true);
    setError("");
    try {
      // Vérifier si déjà noté
      const already = await hasAlreadyReviewed(uid, provider.id);
      if (already) {
        setError("Vous avez déjà noté ce prestataire.");
        setSubmitting(false);
        return;
      }
      await submitReview(uid, clientName || "Client", provider.id, { rating, comment });
      setDone(true);
      setTimeout(() => { onSubmitted?.(); onClose(); }, 2000);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const labels = ["", "Décevant", "Passable", "Bien", "Très bien", "Excellent !"];

  return (
    <div className="rating-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rating-modal__sheet">
        <div className="rating-modal__handle" />

        {done ? (
          <div className="rating-modal__done">
            <div className="rating-modal__done-icon">🎉</div>
            <div className="rating-modal__done-title">Merci pour votre avis !</div>
            <div className="rating-modal__done-sub">Votre note a été enregistrée.</div>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <div className="rating-modal__header">
              <div className="rating-modal__avatar">
                {provider?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="rating-modal__provider-name">{provider?.name}</div>
                <div className="rating-modal__provider-service">{provider?.service}</div>
              </div>
              <button className="rating-modal__close" onClick={onClose}>✕</button>
            </div>

            <div className="rating-modal__title">Comment s'est passée la prestation ?</div>

            {/* Étoiles */}
            <div className="rating-modal__stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`rating-modal__star ${(hover || rating) >= star ? "rating-modal__star--active" : ""}`}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => { setRating(star); setError(""); }}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Label dynamique */}
            <div className="rating-modal__label">
              {labels[hover || rating] || "Touchez une étoile"}
            </div>

            {/* Commentaire */}
            <textarea
              className="rating-modal__comment"
              placeholder="Laissez un commentaire (optionnel)…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={300}
            />
            {comment.length > 0 && (
              <div className="rating-modal__char-count">{comment.length}/300</div>
            )}

            {/* Erreur */}
            {error && <div className="rating-modal__error">{error}</div>}

            {/* Boutons */}
            <div className="rating-modal__actions">
              <button
                className="rating-modal__btn-submit"
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
              >
                {submitting ? "Envoi…" : "Envoyer mon avis ⭐"}
              </button>
              <button className="rating-modal__btn-skip" onClick={onClose}>
                Passer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
