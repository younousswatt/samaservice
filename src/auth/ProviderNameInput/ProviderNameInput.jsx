import { useState } from "react";
import "./ProviderNameInput.css";

const PERKS = [
  { icon: "🏅", text: "Badge PRO visible par les clients"         },
  { icon: "📍", text: "Géolocalisation automatique de votre zone" },
  { icon: "📊", text: "Statistiques et gestion de votre activité" },
  { icon: "💰", text: "Paiements sécurisés via Mobile Money"      },
];

export default function ProviderNameInput({ onBack, onSubmit }) {
  const [name, setName] = useState("");

  const isValid = name.trim().length >= 2;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(name.trim());
  };

  return (
    <div className="provider-name">
      <button className="provider-name__back" onClick={onBack}>←</button>

      {/* Hero */}
      <div className="provider-name__hero">
        <div className="provider-name__icon">🔧</div>
        <div className="provider-name__title">Espace Prestataire</div>
        <div className="provider-name__subtitle">
          Comment vous appelez-vous ? Vos clients verront ce nom sur votre profil.
        </div>
      </div>

      {/* Form */}
      <div className="provider-name__form">
        <label className="provider-name__label">Votre nom complet</label>
        <input
          className="provider-name__input"
          type="text"
          placeholder="Ex : Aliou Badji"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <div className="provider-name__hint">
          Utilisez votre vrai nom — cela inspire confiance aux clients.
        </div>

        {/* Perks */}
        <div className="provider-name__perks">
          {PERKS.map((p) => (
            <div key={p.text} className="provider-name__perk">
              <span className="provider-name__perk-icon">{p.icon}</span>
              {p.text}
            </div>
          ))}
        </div>

        <button
          className="provider-name__btn"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Accéder à mon espace Pro →
        </button>
      </div>
    </div>
  );
}
