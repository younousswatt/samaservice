import { useState } from "react";
import "./LocationSetup.css";

const QUARTIERS_DAKAR = [
  "Plateau", "Médina", "Gueule Tapée", "Fann", "Point E",
  "Mermoz", "Sacré-Cœur", "Almadies", "Ngor", "Ouakam",
  "Yoff", "Pikine", "Guédiawaye", "Parcelles Assainies",
  "Grand Yoff", "HLM", "Liberté", "Dieuppeul", "Thiès",
  "Saint-Louis", "Ziguinchor", "Kaolack", "Touba", "Autre",
];

export default function LocationSetup({ providerName, onDone }) {
  const [step,     setStep]     = useState("ask");
  const [gpsError, setGpsError] = useState("");
  const [address,  setAddress]  = useState("");
  const [quartier, setQuartier] = useState("");
  const [ville,    setVille]    = useState("Dakar");

  const handleGPS = () => {
    setStep("loading");
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("GPS non supporté sur cet appareil.");
      setStep("manual");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Pas de stockage local — on passe directement au parent
        onDone({
          lat:        pos.coords.latitude,
          lng:        pos.coords.longitude,
          address:    null,
          quartier:   null,
          ville:      "Dakar",
          gpsEnabled: true,
        });
      },
      () => {
        setGpsError("Localisation refusée ou indisponible.");
        setStep("manual");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualSubmit = () => {
    if (!quartier) return;
    onDone({
      lat:        null,
      lng:        null,
      address:    address.trim() || null,
      quartier,
      ville,
      gpsEnabled: false,
    });
  };

  const handleSkip = () => {
    onDone({ lat: null, lng: null, address: null, quartier: null, ville: null, gpsEnabled: false });
  };

  return (
    <div className="location-setup">

      <div className="location-setup__hero">
        <div className="location-setup__icon">{step === "loading" ? "⏳" : "📍"}</div>
        <h2 className="location-setup__title">
          {step === "loading" ? "Localisation…" : "Où êtes-vous basé ?"}
        </h2>
        <p className="location-setup__subtitle">
          {step === "loading"
            ? "Nous récupérons votre position GPS…"
            : `Bonjour ${providerName} ! Pour apparaître sur la carte clients, dites-nous où vous êtes.`}
        </p>
      </div>

      {step === "ask" && (
        <div className="location-setup__content">
          <div className="location-setup__option" onClick={handleGPS}>
            <div className="location-setup__option-icon">🛰️</div>
            <div className="location-setup__option-text">
              <strong>Utiliser ma position GPS</strong>
              <span>Précis, automatique, recommandé</span>
            </div>
            <span className="location-setup__option-arrow">→</span>
          </div>

          <div className="location-setup__or">ou</div>

          <div className="location-setup__option" onClick={() => setStep("manual")}>
            <div className="location-setup__option-icon">✍️</div>
            <div className="location-setup__option-text">
              <strong>Saisir mon adresse</strong>
              <span>Entrez votre quartier ou rue</span>
            </div>
            <span className="location-setup__option-arrow">→</span>
          </div>

          <button className="location-setup__skip" onClick={handleSkip}>
            Ignorer pour l'instant
          </button>
        </div>
      )}

      {step === "loading" && (
        <div className="location-setup__loading">
          <div className="location-setup__spinner" />
          <p>Récupération de votre position…</p>
        </div>
      )}

      {step === "manual" && (
        <div className="location-setup__content">
          {gpsError && (
            <div className="location-setup__warning">⚠️ {gpsError} Veuillez saisir votre adresse.</div>
          )}

          <div className="location-setup__field">
            <label>Quartier *</label>
            <select value={quartier} onChange={(e) => setQuartier(e.target.value)} className="location-setup__select">
              <option value="">Sélectionnez votre quartier…</option>
              {QUARTIERS_DAKAR.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="location-setup__field">
            <label>Adresse précise (optionnel)</label>
            <input type="text" placeholder="Ex : Rue 10 x 23, Villa 45…" value={address} onChange={(e) => setAddress(e.target.value)} className="location-setup__input" />
          </div>

          <div className="location-setup__field">
            <label>Ville</label>
            <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className="location-setup__input" />
          </div>

          <button className="location-setup__btn" onClick={handleManualSubmit} disabled={!quartier}>
            Confirmer ma localisation →
          </button>

          <button className="location-setup__skip" onClick={handleSkip}>
            Ignorer pour l'instant
          </button>
        </div>
      )}
    </div>
  );
}
