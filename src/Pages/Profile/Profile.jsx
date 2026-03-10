import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { getUser } from "../../firestoreService";
import "./Profile.css";

export default function Profile({ clientName = "Utilisateur", clientPhone = "", onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    getUser(uid)
      .then((data) => { setUserData(data); setLoading(false); })
      .catch(()    => { setLoading(false); });
  }, []);

  const displayName  = userData?.name  || clientName  || "–";
  const displayPhone = userData?.phone || clientPhone  || auth.currentUser?.phoneNumber || "–";
  const initials     = displayName.split(" ").map((w) => w[0]).join("").toUpperCase();

  const memberSince = userData?.createdAt?.toDate
    ? userData.createdAt.toDate().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "–";

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

        <div className="client-profile__section-title">Informations</div>

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

        <button className="client-profile__btn-edit">✏️ Modifier mon profil</button>
        <button className="client-profile__btn-logout" onClick={onLogout}>↩ Déconnexion</button>

        <p className="client-profile__version">SamaService v1.0 — Dakar 🇸🇳</p>
      </div>
    </div>
  );
}
