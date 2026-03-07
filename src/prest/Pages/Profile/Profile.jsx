import "./Profile.css";

const PROVIDER = {
  name:    "Aliou B.",
  service: "Plombier",
  phone:   "+221 77 123 45 67",
  zone:    "Dakar Plateau",
  member:  "Depuis octobre 2025",
  isPro:   true,
};

export default function Profile({ providerName = "Prestataire", onLogout }) {
  const initials = providerName.split(" ").map((w) => w[0]).join("").toUpperCase;

  return (
    <div className="profile">
      {/* Hero */}
      <div className="profile__hero">
        <div className="profile__avatar">{initials}</div>
        <div className="profile__name">{providerName}</div>
        <div className="profile__service">{PROVIDER.service}</div>
        {PROVIDER.isPro && <span className="profile__badge-pro">PRO</span>}
      </div>

      <div className="profile__divider" />

      {/* Info */}
      <div className="profile__section">
        <div className="profile__section-title">Informations</div>
        <div className="profile__field">
          <span className="profile__field-label">Téléphone</span>
          <span className="profile__field-value">{PROVIDER.phone}</span>
        </div>
        <div className="profile__field">
          <span className="profile__field-label">Zone d'activité</span>
          <span className="profile__field-value">{PROVIDER.zone}</span>
        </div>
        <div className="profile__field">
          <span className="profile__field-label">Membre</span>
          <span className="profile__field-value">{PROVIDER.member}</span>
        </div>
      </div>

      <div className="profile__divider" />

      {/* Actions */}
      <div className="profile__section">
        <button className="profile__btn-edit">✏️ Modifier mon profil</button>
        <button className="profile__btn-logout" onClick={onLogout}>↩ Déconnexion</button>
      </div>
    </div>
  );
}
