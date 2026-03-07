import { useState } from "react";
import "./ClientNameInput.css";

export default function ClientNameInput({ onBack, onSubmit }) {
  const [name, setName] = useState("");

  const isValid = name.trim().length >= 2;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(name.trim());
  };

  return (
    <div className="client-name">
      <button className="client-name__back" onClick={onBack}>←</button>

      {/* Hero */}
      <div className="client-name__hero">
        <div className="client-name__icon">👤</div>
        <div className="client-name__title">Comment vous appelez-vous ?</div>
        <div className="client-name__subtitle">
          Votre nom nous permet de personnaliser votre expérience sur SamaService.
        </div>
      </div>

      {/* Form */}
      <div className="client-name__form">
        <label className="client-name__label">Votre prénom et nom</label>
        <input
          className="client-name__input"
          type="text"
          placeholder="Ex : Mamadou Diallo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <div className="client-name__hint">
          Ce nom sera visible uniquement par vous dans votre profil.
        </div>

        <button
          className="client-name__btn"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}
