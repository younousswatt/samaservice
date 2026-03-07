import "./ProviderCard.css";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("");
}

export default function ProviderCard({ provider, isFav, onFavToggle, onClick, delay = 0 }) {
  return (
    <div
      className="provider-card"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div className="provider-card__inner">
        {/* Avatar */}
        <div className="provider-card__avatar">{initials(provider.name)}</div>

        {/* Info */}
        <div className="provider-card__info">
          <div className="provider-card__top-row">
            <span className="provider-card__name">{provider.name}</span>
            <span
              className={
                provider.available
                  ? "provider-card__badge-available"
                  : "provider-card__badge-busy"
              }
            >
              {provider.available ? "Disponible" : "Occupé"}
            </span>
          </div>

          <div className="provider-card__meta">
            {provider.service} • {provider.distance} km de vous
          </div>

          <div className="provider-card__bottom-row">
            <span className="provider-card__stars">★</span>
            <span className="provider-card__rating">
              {provider.rating} ({provider.reviews} avis)
            </span>
            {provider.verified && (
              <span className="provider-card__badge-pro">PRO</span>
            )}
          </div>
        </div>

        {/* Favourite */}
        <button
          className="provider-card__fav"
          onClick={(e) => { e.stopPropagation(); onFavToggle(provider.id); }}
          aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
    </div>
  );
}
