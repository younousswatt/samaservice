import { useState, useEffect } from "react";
import { auth } from "../../../firebase";
import { getProvider, updateAvailability, saveProvider, ALL_SERVICES } from "../../../firestoreService";
import "./Profile.css";

export default function ProviderProfile({ providerName, onLogout }) {
  const [providerData, setProviderData] = useState(null);
  const [available,    setAvailable]    = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState("");

  // Champs édition
  const [editName,      setEditName]      = useState("");
  const [editServiceId, setEditServiceId] = useState("");
  const [editQuartier,  setEditQuartier]  = useState("");
  const [editVille,     setEditVille]     = useState("");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    getProvider(uid).then((data) => {
      if (data) { setProviderData(data); setAvailable(data.available ?? true); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggleAvail = async () => {
    const newVal = !available;
    setAvailable(newVal);
    const uid = auth.currentUser?.uid;
    if (uid) await updateAvailability(uid, newVal);
  };

  const handleEditOpen = () => {
    setEditName(providerData?.name || providerName || "");
    setEditServiceId(providerData?.serviceId || "");
    setEditQuartier(providerData?.quartier || "");
    setEditVille(providerData?.ville || "Dakar");
    setEditing(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      const selectedService = ALL_SERVICES.find((s) => s.id === editServiceId);
      await saveProvider(uid, {
        name:      editName.trim(),
        phone:     providerData?.phone || auth.currentUser?.phoneNumber || "",
        service:   selectedService?.label  || providerData?.service  || "",
        serviceId: selectedService?.id     || providerData?.serviceId || "",
        quartier:  editQuartier || providerData?.quartier || null,
        ville:     editVille    || providerData?.ville    || "Dakar",
      });
      setProviderData((prev) => ({
        ...prev,
        name:      editName.trim(),
        service:   selectedService?.label  || prev?.service,
        serviceId: selectedService?.id     || prev?.serviceId,
        quartier:  editQuartier || prev?.quartier,
        ville:     editVille    || prev?.ville,
      }));
      setEditing(false);
      setSaveMsg("✅ Profil mis à jour !");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("❌ Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const displayName  = providerData?.name  || providerName || "–";
  const displayPhone = providerData?.phone || auth.currentUser?.phoneNumber || "–";

  const locationDisplay = providerData?.gpsEnabled
    ? "📍 GPS activé"
    : providerData?.quartier
      ? `${providerData.quartier}${providerData.ville ? ", " + providerData.ville : ""}`
      : "Non renseignée";

  const serviceObj     = ALL_SERVICES.find((s) => s.id === providerData?.serviceId);
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

      {/* Avatar + statut */}
      <div className="profile-page__avatar-wrap">
        <div className="profile-page__avatar profile-page__avatar--prest">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-page__name">{displayName}</h2>
        <span className="profile-page__badge profile-page__badge--prest">Prestataire</span>
        <button
          className={`profile-page__avail-toggle ${available ? "profile-page__avail-toggle--on" : ""}`}
          onClick={handleToggleAvail}
        >
          <span className="profile-page__avail-dot" />
          {available ? "Disponible" : "Occupé"}
        </button>
      </div>

      {/* Stats */}
      <div className="profile-page__stats">
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">{providerData?.rating || "–"}</span>
          <span className="profile-page__stat-label">⭐ Note</span>
        </div>
        <div className="profile-page__stat-divider" />
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">{providerData?.reviews || 0}</span>
          <span className="profile-page__stat-label">Avis</span>
        </div>
        <div className="profile-page__stat-divider" />
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">{providerData?.verified ? "✅" : "⏳"}</span>
          <span className="profile-page__stat-label">Vérifié</span>
        </div>
      </div>

      {/* Message succès/erreur */}
      {saveMsg && (
        <div className={`profile-page__msg ${saveMsg.startsWith("✅") ? "profile-page__msg--ok" : "profile-page__msg--err"}`}>
          {saveMsg}
        </div>
      )}

      {/* ── MODE LECTURE ─────────────────────────────── */}
      {!editing ? (
        <>
          <div className="profile-page__section">
            <h3 className="profile-page__section-title">Mes informations</h3>

            {[
              { icon: "👤", label: "Nom",              value: displayName },
              { icon: "📱", label: "Téléphone",         value: displayPhone },
              { icon: "🔧", label: "Service principal", value: serviceDisplay },
              { icon: "📍", label: "Localisation",      value: locationDisplay },
              { icon: "📅", label: "Inscrit depuis",    value: providerData?.createdAt?.toDate
                  ? providerData.createdAt.toDate().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                  : "–" },
            ].map(({ icon, label, value }) => (
              <div className="profile-page__row" key={label}>
                <span className="profile-page__row-icon">{icon}</span>
                <div className="profile-page__row-content">
                  <span className="profile-page__row-label">{label}</span>
                  <span className="profile-page__row-value">{value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="profile-page__section">
            <h3 className="profile-page__section-title">Mon compte</h3>

            <div className="profile-page__row profile-page__row--link" onClick={handleEditOpen}>
              <span className="profile-page__row-icon">✏️</span>
              <div className="profile-page__row-content">
                <span className="profile-page__row-label">Modifier mon profil</span>
              </div>
              <span className="profile-page__row-arrow">›</span>
            </div>

            <div className="profile-page__row profile-page__row--link">
              <span className="profile-page__row-icon">🚀</span>
              <div className="profile-page__row-content">
                <span className="profile-page__row-label">Passer au plan Pro</span>
                <span className="profile-page__row-sublabel">6 000 FCFA/mois</span>
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

          <button className="profile-page__logout" onClick={onLogout}>Déconnexion</button>
        </>
      ) : (

        /* ── MODE ÉDITION ──────────────────────────── */
        <div className="profile-page__section">
          <h3 className="profile-page__section-title">Modifier mon profil</h3>

          {/* Nom */}
          <div className="profile-page__edit-field">
            <label className="profile-page__edit-label">👤 Nom complet</label>
            <input
              className="profile-page__edit-input"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Votre nom complet"
              autoFocus
            />
          </div>

          {/* Téléphone (non modifiable) */}
          <div className="profile-page__edit-field">
            <label className="profile-page__edit-label">📱 Téléphone</label>
            <input
              className="profile-page__edit-input profile-page__edit-input--disabled"
              type="text"
              value={displayPhone}
              disabled
            />
            <span className="profile-page__edit-hint">Non modifiable</span>
          </div>

          {/* Service */}
          <div className="profile-page__edit-field">
            <label className="profile-page__edit-label">🔧 Service principal</label>
            <select
              className="profile-page__edit-select"
              value={editServiceId}
              onChange={(e) => setEditServiceId(e.target.value)}
            >
              <option value="">Sélectionner un service…</option>
              {ALL_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
              ))}
            </select>
          </div>

          {/* Quartier */}
          <div className="profile-page__edit-field">
            <label className="profile-page__edit-label">📍 Quartier</label>
            <input
              className="profile-page__edit-input"
              type="text"
              value={editQuartier}
              onChange={(e) => setEditQuartier(e.target.value)}
              placeholder="Ex : Mermoz, Plateau…"
            />
          </div>

          {/* Ville */}
          <div className="profile-page__edit-field">
            <label className="profile-page__edit-label">🏙️ Ville</label>
            <input
              className="profile-page__edit-input"
              type="text"
              value={editVille}
              onChange={(e) => setEditVille(e.target.value)}
              placeholder="Ex : Dakar"
            />
          </div>

          <div className="profile-page__edit-actions">
            <button
              className="profile-page__btn-save"
              onClick={handleSave}
              disabled={!editName.trim() || saving}
            >
              {saving ? "Sauvegarde…" : "💾 Sauvegarder"}
            </button>
            <button
              className="profile-page__btn-cancel"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <p className="profile-page__version">SamaService v1.0 — Dakar 🇸🇳</p>
    </div>
  );
}
