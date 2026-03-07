import "./BoostCard.css";

export default function BoostCard({ price = "1 800 FCFA", onActivate }) {
  return (
    <div className="boost-card">
      <div className="boost-card__title">🚀 Boost de visibilité</div>
      <div className="boost-card__desc">
        Mettez votre profil en haut des résultats pendant 24h et recevez plus d'appels.
      </div>
      <button
        className="boost-card__btn"
        onClick={onActivate || (() => alert("Boost activé !"))}
      >
        Activer — {price}
      </button>
    </div>
  );
}
