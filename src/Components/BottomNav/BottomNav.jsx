import "./BottomNav.css";

const TABS = [
  { id: "home",      icon: "🏠", label: "Accueil" },
  { id: "search",    icon: "🔍", label: "Chercher" },
  { id: "favorites", icon: "❤️", label: "Favoris",  badge: null },
  { id: "profile",   icon: "👤", label: "Profil"   },
];

export default function BottomNav({ active = "home", onChange, favCount = 0 }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav__item${active === tab.id ? " bottom-nav__item--active" : ""}`}
          onClick={() => onChange && onChange(tab.id)}
          aria-label={tab.label}
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
          {tab.id === "favorites" && favCount > 0 && (
            <span className="bottom-nav__badge">{favCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
