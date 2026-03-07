import { useState } from "react";

// ── Auth / Onboarding ─────────────────────────────────────────────────────────
import Splash            from "./auth/Splash/Splash";
import Welcome           from "./auth/Welcome/Welcome";
import ClientNameInput   from "./auth/ClientNameInput/ClientNameInput";
import ProviderNameInput from "./auth/ProviderNameInput/ProviderNameInput";

// ── App Client ────────────────────────────────────────────────────────────────
import Background    from "./Components/Background/Background";
import Header        from "./Components/Header/Header";
import BottomNav     from "./Components/BottomNav/BottomNav";
import ProviderModal from "./Components/ProviderModal/ProviderModal";
import Home          from "./Pages/Home/Home";
import Search        from "./Pages/Search/Search";
import Favorites     from "./Pages/Favorites/Favorites";
import ClientProfile from "./Pages/Profile/Profile";

// ── App Prestataire ───────────────────────────────────────────────────────────
import BackgroundPrest from "./prest/Components/Background/Background";
import HeaderPrest     from "./prest/Components/Header/Header";
import BottomNavPrest  from "./prest/Components/BottomNav/BottomNav";
import Dashboard       from "./prest/Pages/Dashboard/Dashboard";
import Earnings        from "./prest/Pages/Earnings/Earnings";
import ProviderProfile from "./prest/Pages/Profile/Profile";

// ── Flow ──────────────────────────────────────────────────────────────────────
// splash → welcome
//            ↓ client      → client-name   → app-client
//            ↓ prestataire → provider-name → app-prest

export default function App() {
  const [step, setStep] = useState("splash");

  // Noms saisis par l'utilisateur
  const [clientName,   setClientName]   = useState("");
  const [providerName, setProviderName] = useState("");

  // ── Client app state ───────────────────────────────────────────────────────
  const [clientPage,       setClientPage]       = useState("home");
  const [favorites,        setFavorites]        = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchService,    setSearchService]    = useState(null);

  // ── Prestataire app state ──────────────────────────────────────────────────
  const [prestPage, setPrestPage] = useState("dashboard");
  const handleLogout = () => {
  setClientName("");
  setProviderName("");
  setClientPage("home");
  setPrestPage("dashboard");
  setFavorites([]);
  setSelectedProvider(null);
  setSearchService(null);
  setStep("welcome");
};

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFavToggle = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  const handleSeeAll = (service) => {
    setSearchService(service);
    setClientPage("search");
  };

  const handleClientNameSubmit = (name) => {
    setClientName(name);
    setStep("app-client");
  };

  const handleProviderNameSubmit = (name) => {
    setProviderName(name);
    setStep("app-prest");
  };

  // ── Render client page ─────────────────────────────────────────────────────
  const renderClientPage = () => {
    switch (clientPage) {
      case "home":
        return (
          <Home
            clientName={clientName}
            favorites={favorites}
            onFavToggle={handleFavToggle}
            onProviderClick={setSelectedProvider}
            onSeeAll={handleSeeAll}
            onSearchFocus={() => setClientPage("search")}
          />
        );
      case "search":
        return (
          <Search
            initialService={searchService}
            favorites={favorites}
            onFavToggle={handleFavToggle}
            onProviderClick={setSelectedProvider}
          />
        );
      case "favorites":
        return (
          <Favorites
            favorites={favorites}
            onFavToggle={handleFavToggle}
            onProviderClick={setSelectedProvider}
          />
        );
      case "profile":
        return <ClientProfile clientName={clientName} onLogout={handleLogout}/>;
      default:
        return null;
    }
  };

  // ── Render prestataire page ────────────────────────────────────────────────
  const renderPrestPage = () => {
    switch (prestPage) {
      case "dashboard": return <Dashboard providerName={providerName} />;
      case "earnings":  return <Earnings />;
      case "profile":   return <ProviderProfile providerName={providerName} onLogout={handleLogout}/>;
      default:          return <Dashboard providerName={providerName} />;
    }
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }
    #root { min-height: 100vh; }
  `;

  return (
    <>
      <style>{globalStyles}</style>

      {/* 1. Splash */}
      {step === "splash" && (
        <Splash onDone={() => setStep("welcome")} />
      )}

      {/* 2. Welcome — choix client ou prestataire */}
      {step === "welcome" && (
        <Welcome
          onClientStart={() => setStep("client-name")}
          onProviderStart={() => setStep("provider-name")}
        />
      )}

      {/* 3a. Client — saisie du nom */}
      {step === "client-name" && (
        <ClientNameInput
          onBack={() => setStep("welcome")}
          onSubmit={handleClientNameSubmit}
        />
      )}

      {/* 3b. Prestataire — saisie du nom */}
      {step === "provider-name" && (
        <ProviderNameInput
          onBack={() => setStep("welcome")}
          onSubmit={handleProviderNameSubmit}
        />
      )}

      {/* 4. App Client */}
      {step === "app-client" && (
        <>
          <Background />
          <Header
            clientName={clientName}
            onProfileClick={() => setClientPage("profile")}
          />
          <main>{renderClientPage()}</main>
          <BottomNav
            active={clientPage}
            onChange={(p) => { setSearchService(null); setClientPage(p); }}
            favCount={favorites.length}
          />
          {selectedProvider && (
            <ProviderModal
              provider={selectedProvider}
              onClose={() => setSelectedProvider(null)}
            />
          )}
        </>
      )}

      {/* 5. App Prestataire */}
      {step === "app-prest" && (
        <>
          <BackgroundPrest />
          <HeaderPrest
            providerName={providerName}
            onProfileClick={() => setPrestPage("profile")}
          />
          <main>{renderPrestPage()}</main>
          <BottomNavPrest
            active={prestPage}
            onChange={setPrestPage}
          />
        </>
      )}
    </>
  );
}
