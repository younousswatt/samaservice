import "./Profile.css";

const CLIENT = {
  name:   "Mamadou D.",
  phone:  "+221 77 000 00 00",
  zone:   "Dakar, Sénégal",
  member: "Depuis novembre 2025",
};

export default function Profile({ clientName = "Utilisateur", onLogout }) {
  const initials = clientName.split(" ").map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="client-profile">
      {/* Hero */}
      <div className="client-profile__hero">
        <div className="client-profile__avatar">{initials}</div>
        <div className="client-profile__name">{clientName}</div>
        <div className="client-profile__phone">777323219</div>
      </div>

      <div className="client-profile__body">
        <div className="client-profile__section-title">Informations</div>

        <div className="client-profile__field">
          <span className="client-profile__field-label">Téléphone</span>
          <span className="client-profile__field-value">{CLIENT.phone}</span>
        </div>
        <div className="client-profile__field">
          <span className="client-profile__field-label">Localisation</span>
          <span className="client-profile__field-value">{CLIENT.zone}</span>
        </div>
        <div className="client-profile__field">
          <span className="client-profile__field-label">Membre</span>
          <span className="client-profile__field-value">{CLIENT.member}</span>
        </div>

        <div className="client-profile__divider" />

        <button className="client-profile__btn-edit">✏️ Modifier mon profil</button>
        <button className="client-profile__btn-logout" onClick={onLogout}>↩ Déconnexion</button>
      </div>
    </div>
  );
}
