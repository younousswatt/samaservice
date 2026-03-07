import "./Favorites.css";
import ProviderCard from "../../Components/ProviderCard/ProviderCard";
import { PROVIDERS } from "../Home/Home";

export default function Favorites({ favorites, onFavToggle, onProviderClick }) {
  const favProviders = PROVIDERS.filter((p) => favorites.includes(p.id));

  return (
    <div className="favorites">
      <div className="favorites__header">
        <div className="favorites__title">Mes Favoris ❤️</div>
        <div className="favorites__subtitle">
          {favProviders.length > 0
            ? `${favProviders.length} prestataire${favProviders.length > 1 ? "s" : ""} sauvegardé${favProviders.length > 1 ? "s" : ""}`
            : "Aucun favori pour l'instant"}
        </div>
      </div>

      {favProviders.length === 0 ? (
        <div className="favorites__empty">
          <span className="favorites__empty-icon">🤍</span>
          <div className="favorites__empty-title">Pas encore de favoris</div>
          <div className="favorites__empty-desc">
            Appuyez sur le cœur d'un prestataire pour le sauvegarder ici.
          </div>
        </div>
      ) : (
        <div className="favorites__list">
          {favProviders.map((p, i) => (
            <ProviderCard
              key={p.id}
              provider={p}
              isFav={true}
              onFavToggle={onFavToggle}
              onClick={() => onProviderClick(p)}
              delay={i * 0.07}
            />
          ))}
        </div>
      )}
    </div>
  );
}
