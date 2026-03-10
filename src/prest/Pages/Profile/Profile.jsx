import { useState, useEffect } from "react";
import { auth } from "../../../firebase";
import { getProvider, updateAvailability, ALL_SERVICES } from "../../../firestoreService";
import "./Profile.css";

export default function ProviderProfile({ providerName, onLogout }) {
  const [providerData, setProviderData] = useState(null);
  const [available,    setAvailable]    = useState(true);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    getProvider(uid).then((data) => {
      if (data) {
        setProviderData(data);
        setAvailable(data.available ?? true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggleAvail = async () => {
    const newVal = !available;
    setAvailable(newVal);
    const uid = auth.currentUser?.uid;
    if (uid) await updateAvailability(uid, newVal);
  };

  const displayName  = providerData?.name   || providerName || "–";
  const displayPhone = providerData?.phone  || auth.currentUser?.phoneNumber || "–";

  // Localisation affichée
  const locationDisplay = providerData?.gpsEnabled
    ? "📍 GPS activé"
    : providerData?.quartier
      ? `${providerData.quartier}${providerData.ville ? ", " + providerData.ville : ""}`
      : "Non renseignée";

  // Service principal
  const serviceObj = ALL_SERVICES.find((s) => s.id === providerData?.serviceId);
  const serviceDisplay = serviceObj
    ? `${serviceObj.icon} ${serviceObj.label}`
    : providerData?.service || "–";

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
      </div>
    );
  }

  return (
    <div className="profile-page profile-page--prest">

      {/* Avatar + Statut */}
      <div className="profile-page__avatar-wrap">
        <div className="profile-page__avatar profile-page__avatar--prest">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-page__name">{displayName}</h2>
        <span className="profile-page__badge profile-page__badge--prest">Prestataire</span>

        {/* Toggle disponibilité */}
        <button
          className={`profile-page__avail-toggle ${available ? "profile-page__avail-toggle--on" : ""}`}
          onClick={handleToggleAvail}
        >
          <span className="profile-page__avail-dot" />
          {available ? "Disponible" : "Occupé"}
        </button>
      </div>

      {/* Stats rapides */}
      <div className="profile-page__stats">
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">
            {providerData?.rating || "–"}
          </span>
          <span className="profile-page__stat-label">⭐ Note</span>
        </div>
        <div className="profile-page__stat-divider" />
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">
            {providerData?.reviews || 0}
          </span>
          <span className="profile-page__stat-label">Avis</span>
        </div>
        <div className="profile-page__stat-divider" />
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">
            {providerData?.verified ? "✅" : "⏳"}
          </span>
          <span className="profile-page__stat-label">Vérifié</span>
        </div>
      </div>

      {/* Informations */}
      <div className="profile-page__section">
        <h3 className="profile-page__section-title">Mes informations</h3>

        <div className="profile-page__row">
          <span className="profile-page__row-icon">👤</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Nom</span>
            <span className="profile-page__row-value">{displayName}</span>
          </div>
        </div>

        <div className="profile-page__row">
          <span className="profile-page__row-icon">📱</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Téléphone</span>
            <span className="profile-page__row-value">{displayPhone}</span>
          </div>
        </div>

        <div className="profile-page__row">
          <span className="profile-page__row-icon">🔧</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Service principal</span>
            <span className="profile-page__row-value">{serviceDisplay}</span>
          </div>
        </div>

        <div className="profile-page__row">
          <span className="profile-page__row-icon">📍</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Localisation</span>
            <span className="profile-page__row-value">{locationDisplay}</span>
          </div>
        </div>

        <div className="profile-page__row">
          <span className="profile-page__row-icon">📅</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Inscrit depuis</span>
            <span className="profile-page__row-value">
              {providerData?.createdAt?.toDate
                ? providerData.createdAt.toDate().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : "–"}
            </span>
          </div>
        </div>
      </div>

      {/* Sélection du service */}
      <div className="profile-page__section">
        <h3 className="profile-page__section-title">Mon service</h3>
        <div className="profile-page__services-grid">
          {ALL_SERVICES.map((s) => (
            <div
              key={s.id}
              className={`profile-page__service-chip ${
                providerData?.serviceId === s.id ? "profile-page__service-chip--active" : ""
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="profile-page__section">
        <h3 className="profile-page__section-title">Mon compte</h3>

        <div className="profile-page__row profile-page__row--link">
          <span className="profile-page__row-icon">🚀</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Passer au plan Pro</span>
            <span className="profile-page__row-sublabel">6 000 FCFA/mois</span>
          </div>
          <span className="profile-page__row-arrow">›</span>
        </div>

        <div className="profile-page__row profile-page__row--link">
          <span className="profile-page__row-icon">📍</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Mettre à jour ma localisation</span>
          </div>
          <span className="profile-page__row-arrow">›</span>
        </div>

        <div className="profile-page__row profile-page__row--link">
          <span className="profile-page__row-icon">🔔</span>
          <div className="profile-page__row-content">
            <span className="profile-page__row-label">Notifications</span>
          </div>
          <span className="profile-page__row-arrow">›</span>
        </div>
      </div>

      <button className="profile-page__logout" onClick={onLogout}>
        Déconnexion
      </button>

      <p className="profile-page__version">SamaService v1.0 — Dakar 🇸🇳</p>
    </div>
  );
}
