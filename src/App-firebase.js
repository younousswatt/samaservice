import { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  saveUser, saveProvider, saveProviderLocation,
  getFavorites, addFavorite, removeFavorite,
  seedTestProviders,
} from "./firestoreService";

// ── Auth ──────────────────────────────────────────────────────
import Splash            from "./auth/Splash/Splash";
import Welcome           from "./auth/Welcome/Welcome";
import ClientNameInput   from "./auth/ClientNameInput/ClientNameInput";
import ProviderNameInput from "./auth/ProviderNameInput/ProviderNameInput";
import PhoneInput        from "./auth/PhoneInput/PhoneInput";
import OTPInput          from "./auth/OTPInput/OTPInput";
import LocationSetup     from "./auth/LocationSetup/LocationSetup";

// ── App Client ────────────────────────────────────────────────
import Background    from "./Components/Background/Background";
import Header        from "./Components/Header/Header";
import BottomNav     from "./Components/BottomNav/BottomNav";
import ProviderModal from "./Components/ProviderModal/ProviderModal";
import Home          from "./Pages/Home/Home";
import Search        from "./Pages/Search/Search";
import Favorites     from "./Pages/Favorites/Favorites";
import ClientProfile from "./Pages/Profile/Profile";

// ── App Prestataire ───────────────────────────────────────────
import BackgroundPrest from "./prest/Components/Background/Background";
import HeaderPrest     from "./prest/Components/Header/Header";
import BottomNavPrest  from "./prest/Components/BottomNav/BottomNav";
import Dashboard       from "./prest/Pages/Dashboard/Dashboard";
import Earnings        from "./prest/Pages/Earnings/Earnings";
import ProviderProfile from "./prest/Pages/Profile/Profile";

export default function App() {
  const [step,     setStep]     = useState("splash");
  const [authRole, setAuthRole] = useState("");
  const [phone,    setPhone]    = useState("");

  const [clientName,    setClientName]    = useState("");
  const [providerName,  setProviderName]  = useState("");
  const [providerMetier, setProviderMetier] = useState(null); // { id, label, icon, category }

  // ── Client state ──────────────────────────────────────────
  const [clientPage,       setClientPage]       = useState("home");
  const [favorites,        setFavorites]        = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchService,    setSearchService]    = useState(null);

  // ── Prestataire state ─────────────────────────────────────
  const [prestPage, setPrestPage] = useState("dashboard");

  // ── Seed prestataires test au 1er lancement ───────────────
  useEffect(() => {
    const alreadySeeded = localStorage.getItem("sama_seeded");
    if (!alreadySeeded) {
      seedTestProviders()
        .then(() => localStorage.setItem("sama_seeded", "1"))
        .catch(console.error);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    setClientName(""); setProviderName(""); setPhone(""); setAuthRole("");
    setProviderMetier(null);
    setClientPage("home"); setPrestPage("dashboard");
    setFavorites([]); setSelectedProvider(null); setSearchService(null);
    setStep("welcome");
  };

  // ── OTP vérifié → Firestore ───────────────────────────────
  const handleOTPVerified = async () => {
    const uid = auth.currentUser?.uid;
    try {
      if (authRole === "client") {
        await saveUser(uid, { name: clientName, phone, role: "client" });
        const favIds = await getFavorites(uid);
        setFavorites(favIds);
        setStep("app-client");
      } else {
        await saveUser(uid, { name: providerName, phone, role: "provider" });
        await saveProvider(uid, {
          name:      providerName,
          phone,
          service:   providerMetier?.label  || "",
          serviceId: providerMetier?.id     || "",
        });
        setStep("location-setup");
      }
    } catch (err) {
      console.error("Firestore:", err);
      setStep(authRole === "client" ? "app-client" : "location-setup");
    }
  };

  // ── Localisation configurée ───────────────────────────────
  const handleLocationDone = async (locationData) => {
    const uid = auth.currentUser?.uid;
    if (uid && (locationData.lat || locationData.quartier)) {
      try { await saveProviderLocation(uid, locationData); }
      catch (err) { console.error("GPS save:", err); }
    }
    setStep("app-prest");
  };

  // ── Favoris ───────────────────────────────────────────────
  const handleFavToggle = async (providerId) => {
    const uid = auth.currentUser?.uid;
    if (favorites.includes(providerId)) {
      setFavorites((prev) => prev.filter((f) => f !== providerId));
      if (uid) await removeFavorite(uid, providerId);
    } else {
      setFavorites((prev) => [...prev, providerId]);
      if (uid) await addFavorite(uid, providerId);
    }
  };

  // ── Auth handlers ─────────────────────────────────────────
  const handleClientNameSubmit = (name) => {
    setClientName(name);
    setAuthRole("client");
    setStep("phone");
  };

  // ProviderNameInput passe maintenant (name, metier)
  const handleProviderNameSubmit = (name, metier) => {
    setProviderName(name);
    setProviderMetier(metier);
    setAuthRole("provider");
    setStep("phone");
  };

  const handlePhoneSubmit = (p) => { setPhone(p); setStep("otp"); };

  // ── Client pages ──────────────────────────────────────────
  const renderClientPage = () => {
    switch (clientPage) {
      case "home":
        return (
          <Home
            clientName={clientName}
            favorites={favorites}
            onFavToggle={handleFavToggle}
            onProviderClick={setSelectedProvider}
            onSeeAll={(s) => { setSearchService(s); setClientPage("search"); }}
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
        return <ClientProfile clientName={clientName} clientPhone={phone} onLogout={handleLogout} />;
      default: return null;
    }
  };

  // ── Prestataire pages ─────────────────────────────────────
  const renderPrestPage = () => {
    switch (prestPage) {
      case "dashboard": return <Dashboard providerName={providerName} />;
      case "earnings":  return <Earnings />;
      case "profile":   return <ProviderProfile providerName={providerName} onLogout={handleLogout} />;
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

      {step === "splash"         && <Splash onDone={() => setStep("welcome")} />}
      {step === "welcome"        && <Welcome onClientStart={() => setStep("client-name")} onProviderStart={() => setStep("provider-name")} />}
      {step === "client-name"    && <ClientNameInput   onBack={() => setStep("welcome")} onSubmit={handleClientNameSubmit} />}
      {step === "provider-name"  && <ProviderNameInput onBack={() => setStep("welcome")} onSubmit={handleProviderNameSubmit} />}
      {step === "phone"          && <PhoneInput onBack={() => setStep(authRole === "client" ? "client-name" : "provider-name")} onSubmit={handlePhoneSubmit} />}
      {step === "otp"            && <OTPInput phone={phone} onBack={() => setStep("phone")} onVerified={handleOTPVerified} />}
      {step === "location-setup" && <LocationSetup providerName={providerName} onDone={handleLocationDone} />}

      {step === "app-client" && (
        <>
          <Background />
          <Header clientName={clientName} onProfileClick={() => setClientPage("profile")} />
          <main>{renderClientPage()}</main>
          <BottomNav
            active={clientPage}
            onChange={(p) => { setSearchService(null); setClientPage(p); }}
            favCount={favorites.length}
          />
          {selectedProvider && (
            <ProviderModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
          )}
        </>
      )}

      {step === "app-prest" && (
        <>
          <BackgroundPrest />
          <HeaderPrest providerName={providerName} onProfileClick={() => setPrestPage("profile")} />
          <main>{renderPrestPage()}</main>
          <BottomNavPrest active={prestPage} onChange={setPrestPage} />
        </>
      )}
    </>
  );
}
