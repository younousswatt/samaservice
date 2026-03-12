import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { getUser, saveUser } from "../../firestoreService";
import "./Profile.css";

export default function Profile({ clientName = "Utilisateur", clientPhone = "", onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editName, setEditName] = useState("");
  const [saveMsg,  setSaveMsg]  = useState("");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    getUser(uid)
      .then((data) => { setUserData(data); setLoading(false); })
      .catch(()    => { setLoading(false); });
  }, []);

  const displayName  = userData?.name  || clientName  || "–";
  const displayPhone = userData?.phone || clientPhone  || auth.currentUser?.phoneNumber || "–";
  const initials     = displayName.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const memberSince  = userData?.createdAt?.toDate
    ? userData.createdAt.toDate().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "–";

  const handleEditOpen = () => {
    setEditName(displayName === "–" ? "" : displayName);
    setEditing(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      await saveUser(uid, { name: editName.trim(), phone: displayPhone, role: "client" });
      setUserData((prev) => ({ ...prev, name: editName.trim() }));
      setEditing(false);
      setSaveMsg("✅ Profil mis à jour !");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("❌ Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="client-profile client-profile--loading">
        <div className="client-profile__spinner" />
      </div>
    );
  }

  return (
    <div className="client-profile">

      {/* Hero */}
      <div className="client-profile__hero">
        <div className="client-profile__avatar">{initials}</div>
        <div className="client-profile__name">{displayName}</div>
        <div className="client-profile__badge">Client</div>
      </div>

      <div className="client-profile__body">

        {saveMsg && (
          <div className={`client-profile__msg ${saveMsg.startsWith("✅") ? "client-profile__msg--ok" : "client-profile__msg--err"}`}>
            {saveMsg}
          </div>
        )}

        {/* ── Mode lecture ───────────────────────────────── */}
        {!editing ? (
          <>
            <div className="client-profile__section-title">Informations</div>

            <div className="client-profile__field">
              <span className="client-profile__field-label">👤 Nom</span>
              <span className="client-profile__field-value">{displayName}</span>
            </div>
            <div className="client-profile__field">
              <span className="client-profile__field-label">📱 Téléphone</span>
              <span className="client-profile__field-value">{displayPhone}</span>
            </div>
            <div className="client-profile__field">
              <span className="client-profile__field-label">📍 Localisation</span>
              <span className="client-profile__field-value">Dakar, Sénégal</span>
            </div>
            <div className="client-profile__field">
              <span className="client-profile__field-label">📅 Membre depuis</span>
              <span className="client-profile__field-value">{memberSince}</span>
            </div>

            <div className="client-profile__divider" />
            <div className="client-profile__section-title">Mon compte</div>

            <div className="client-profile__menu-item">
              <span>❤️ Mes favoris</span>
              <span className="client-profile__menu-arrow">›</span>
            </div>
            <div className="client-profile__menu-item">
              <span>🔔 Notifications</span>
              <span className="client-profile__menu-arrow">›</span>
            </div>
            <div className="client-profile__menu-item">
              <span>🛡️ Confidentialité</span>
              <span className="client-profile__menu-arrow">›</span>
            </div>

            <div className="client-profile__divider" />
            <button className="client-profile__btn-edit" onClick={handleEditOpen}>
              ✏️ Modifier mon profil
            </button>
            <button className="client-profile__btn-logout" onClick={onLogout}>
              ↩ Déconnexion
            </button>
          </>
        ) : (

          /* ── Mode édition ──────────────────────────────── */
          <>
            <div className="client-profile__section-title">Modifier mon profil</div>

            <div className="client-profile__edit-field">
              <label className="client-profile__edit-label">👤 Nom complet</label>
              <input
                className="client-profile__edit-input"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="Votre nom complet"
                autoFocus
              />
            </div>

            <div className="client-profile__edit-field">
              <label className="client-profile__edit-label">📱 Téléphone</label>
              <input
                className="client-profile__edit-input client-profile__edit-input--disabled"
                type="text"
                value={displayPhone}
                disabled
              />
              <span className="client-profile__edit-hint">Le numéro ne peut pas être modifié</span>
            </div>

            <div className="client-profile__edit-actions">
              <button
                className="client-profile__btn-save"
                onClick={handleSave}
                disabled={!editName.trim() || saving}
              >
                {saving ? "Sauvegarde…" : "💾 Sauvegarder"}
              </button>
              <button
                className="client-profile__btn-cancel"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </>
        )}

        <p className="client-profile__version">SamaService v1.0 — Dakar 🇸🇳</p>
      </div>
    </div>
  );
}
