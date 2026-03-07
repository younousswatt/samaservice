import "./Header.css";

export default function Header({ providerName = "Aliou B.", onProfileClick }) {
  const initials = providerName
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <header className="header">
      <div className="header__left">
        <span className="header__logo-icon">🛠️</span>
        <div className="header__brand">
          <span className="header__title">SamaService</span>
          <span className="header__subtitle">Espace Prestataire</span>
        </div>
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
