import "./BottomNav.css";

const TABS = [
  { id: "dashboard", icon: "🏠", label: "Accueil"  },
  { id: "messages",  icon: "💬", label: "Messages" },
  { id: "earnings",  icon: "💰", label: "Revenus"  },
  { id: "profile",   icon: "👤", label: "Profil"   },
];

export default function BottomNav({ active = "dashboard", onChange, unreadCount = 0 }) {
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
          {tab.id === "messages" && unreadCount > 0 && (
            <span className="bottom-nav__badge">{unreadCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
