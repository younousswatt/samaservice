import "./ProCard.css";

const PERKS = [
  "Badge PRO visible par les clients",
  "Priorité dans les résultats de recherche",
  "Statistiques avancées d'utilisation",
  "Support client prioritaire 24/7",
  "Boosts illimités inclus",
];

export default function ProCard({ price = "6 000 FCFA/mois", onSubscribe }) {
  return (
    <div className="pro-card">
      <span className="pro-card__badge">Pro</span>
      <div className="pro-card__title">💎 Abonnement Pro</div>
      <div className="pro-card__desc">
        Développez votre activité avec les outils professionnels SamaService.
      </div>
      <ul className="pro-card__perks">
        {PERKS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <button
        className="pro-card__btn"
        onClick={onSubscribe || (() => alert("Redirection vers le paiement…"))}
      >
        S'abonner — {price}
      </button>
    </div>
  );
}
