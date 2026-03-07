import "./Header.css";

export default function Header({ clientName = "Utilisateur", onProfileClick }) {
  const initials = clientName
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__location-row">
          <span className="header__location-pin">📍</span>
          <span className="header__location">Dakar, Sénégal</span>
        </div>
        <span className="header__brand">SamaService</span>
      </div>

      <div className="header__right">
        <button className="header__notif" aria-label="Notifications">
          🔔
          <span className="header__notif-dot" />
        </button>
        <button
          className="header__avatar"
          onClick={onProfileClick}
          aria-label="Mon profil"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
