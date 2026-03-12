import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  saveUser, saveProvider, saveProviderLocation,
  getUser, getProvider,
  getFavorites, addFavorite, removeFavorite,
  seedTestProviders,
} from "./firestoreService";
import { listenClientChats, listenProviderChats } from "./chatService";

// ── Auth ──────────────────────────────────────────────────────
import Splash            from "./auth/Splash/Splash";
import Welcome           from "./auth/Welcome/Welcome";
import ClientNameInput   from "./auth/ClientNameInput/ClientNameInput";
import ProviderNameInput from "./auth/ProviderNameInput/ProviderNameInput";
import PhoneInput        from "./auth/PhoneInput/PhoneInput";
import OTPInput          from "./auth/OTPInput/OTPInput";
import LocationSetup     from "./auth/LocationSetup/LocationSetup";

// ── App Client ────────────────────────────────────────────────
import Background        from "./Components/Background/Background";
import Header            from "./Components/Header/Header";
import BottomNav         from "./Components/BottomNav/BottomNav";
import ProviderModal     from "./Components/ProviderModal/ProviderModal";
import Home              from "./Pages/Home/Home";
import Search            from "./Pages/Search/Search";
import Favorites         from "./Pages/Favorites/Favorites";
import ClientProfile     from "./Pages/Profile/Profile";
import ConversationsList from "./Pages/Messages/ConversationsList";
import ChatScreen        from "./Pages/Messages/ChatScreen";

// ── App Prestataire ───────────────────────────────────────────
import BackgroundPrest   from "./prest/Components/Background/Background";
import HeaderPrest       from "./prest/Components/Header/Header";
import BottomNavPrest    from "./prest/Components/BottomNav/BottomNav";
import Dashboard         from "./prest/Pages/Dashboard/Dashboard";
import Earnings          from "./prest/Pages/Earnings/Earnings";
import ProviderProfile   from "./prest/Pages/Profile/Profile";
import PrestConvos       from "./prest/Pages/Messages/ConversationsList";
import PrestChatScreen   from "./prest/Pages/Messages/ChatScreen";

export default function App() {
  const [step,     setStep]     = useState("splash");
  const [authRole, setAuthRole] = useState("");
  const [phone,    setPhone]    = useState("");

  const [clientName,     setClientName]     = useState("");
  const [providerName,   setProviderName]   = useState("");
  const [providerMetier, setProviderMetier] = useState(null);

  // ── Client state ──────────────────────────────────────────
  const [clientPage,       setClientPage]       = useState("home");
  const [favorites,        setFavorites]        = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchService,    setSearchService]    = useState(null);
  const [activeChat,       setActiveChat]       = useState(null);
  const [unreadClient,     setUnreadClient]     = useState(0);

  // ── Prestataire state ─────────────────────────────────────
  const [prestPage,       setPrestPage]       = useState("dashboard");
  const [activePrestChat, setActivePrestChat] = useState(null);
  const [unreadPrest,     setUnreadPrest]     = useState(0);

  // ── Seed ──────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("sama_seeded")) {
      seedTestProviders()
        .then(() => localStorage.setItem("sama_seeded", "1"))
        .catch(console.error);
    }
  }, []);

  // ── RECONNEXION AUTOMATIQUE ───────────────────────────────
  // Si Firebase Auth a déjà un utilisateur connecté (session persistée),
  // on le reconnecte directement sans repasser par le flow d'auth.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return; // pas connecté, le flow normal gère ça
      if (step !== "splash" && step !== "welcome") return; // déjà dans le flow

      try {
        // Chercher d'abord dans users
        const userData = await getUser(user.uid);
        if (userData?.role === "client") {
          setClientName(userData.name || "");
          setPhone(userData.phone || user.phoneNumber || "");
          const favs = await getFavorites(user.uid);
          setFavorites(favs);
          setStep("app-client");
          return;
        }

        // Chercher dans providers
        const providerData = await getProvider(user.uid);
        if (providerData) {
          setProviderName(providerData.name || "");
          setPhone(providerData.phone || user.phoneNumber || "");
          setStep("app-prest");
          return;
        }

        // Compte Firebase existe mais pas dans Firestore → flow normal
      } catch (err) {
        console.error("Erreur reconnexion:", err);
      }
    });
    return () => unsub();
  }, []); // eslint-disable-line

  // ── Non-lus client ────────────────────────────────────────
  useEffect(() => {
    if (step !== "app-client") return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = listenClientChats(uid, (chats) => {
      setUnreadClient(chats.reduce((s, c) => s + (c.unreadClient || 0), 0));
    });
    return () => unsub();
  }, [step]);

  // ── Non-lus prestataire ───────────────────────────────────
  useEffect(() => {
    if (step !== "app-prest") return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = listenProviderChats(uid, (chats) => {
      setUnreadPrest(chats.reduce((s, c) => s + (c.unreadProvider || 0), 0));
    });
    return () => unsub();
  }, [step]);

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await auth.signOut(); } catch {}
    setClientName(""); setProviderName(""); setPhone(""); setAuthRole("");
    setProviderMetier(null); setClientPage("home"); setPrestPage("dashboard");
    setFavorites([]); setSelectedProvider(null); setSearchService(null);
    setActiveChat(null); setActivePrestChat(null);
    setUnreadClient(0); setUnreadPrest(0);
    setStep("welcome");
  };

  // ── OTP vérifié — vérifier si compte existant ────────────
  const handleOTPVerified = async () => {
    const uid  = auth.currentUser?.uid;
    const userPhone = auth.currentUser?.phoneNumber || phone;

    try {
      // 1. Vérifier si compte existant dans Firestore
      const existingUser     = await getUser(uid);
      const existingProvider = await getProvider(uid);

      if (existingUser?.role === "client") {
        // Compte client existant → reconnexion directe
        setClientName(existingUser.name || clientName);
        setPhone(existingUser.phone || userPhone);
        const favs = await getFavorites(uid);
        setFavorites(favs);
        setStep("app-client");
        return;
      }

      if (existingProvider) {
        // Compte prestataire existant → reconnexion directe
        setProviderName(existingProvider.name || providerName);
        setPhone(existingProvider.phone || userPhone);
        setStep("app-prest");
        return;
      }

      // 2. Nouveau compte → créer selon le rôle choisi
      if (authRole === "client") {
        await saveUser(uid, { name: clientName, phone: userPhone, role: "client" });
        const favs = await getFavorites(uid);
        setFavorites(favs);
        setStep("app-client");
      } else {
        await saveUser(uid, { name: providerName, phone: userPhone, role: "provider" });
        await saveProvider(uid, {
          name:      providerName,
          phone:     userPhone,
          service:   providerMetier?.label  || "",
          serviceId: providerMetier?.id     || "",
        });
        setStep("location-setup");
      }
    } catch (err) {
      console.error("Erreur OTP:", err);
      // Fallback selon le rôle choisi
      setStep(authRole === "client" ? "app-client" : "location-setup");
    }
  };

  const handleLocationDone = async (locationData) => {
    const uid = auth.currentUser?.uid;
    if (uid && (locationData.lat || locationData.quartier)) {
      try { await saveProviderLocation(uid, locationData); } catch {}
    }
    setStep("app-prest");
  };

  // ── Favoris ───────────────────────────────────────────────
  const handleFavToggle = async (providerId) => {
    const uid = auth.currentUser?.uid;
    if (favorites.includes(providerId)) {
      setFavorites((p) => p.filter((f) => f !== providerId));
      if (uid) await removeFavorite(uid, providerId);
    } else {
      setFavorites((p) => [...p, providerId]);
      if (uid) await addFavorite(uid, providerId);
    }
  };

  // ── Auth handlers ─────────────────────────────────────────
  const handleClientNameSubmit   = (name)         => { setClientName(name);   setAuthRole("client");   setStep("phone"); };
  const handleProviderNameSubmit = (name, metier) => { setProviderName(name); setProviderMetier(metier); setAuthRole("provider"); setStep("phone"); };
  const handlePhoneSubmit        = (p)            => { setPhone(p); setStep("otp"); };

  // ── Chat handlers ─────────────────────────────────────────
  const handleOpenChat = (provider) => {
    setActiveChat(provider);
    setClientPage("chat");
    setSelectedProvider(null);
  };

  const handleOpenChatFromList = (chat) => {
    setActiveChat({
      id:      chat.providerId,
      name:    chat.providerName,
      phone:   chat.providerPhone,
      service: chat.providerService || "",
    });
    setClientPage("chat");
  };

  const handleOpenPrestChat = (chat) => {
    setActivePrestChat(chat);
    setPrestPage("chat");
  };

  // ── Pages client ──────────────────────────────────────────
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
      case "messages":
        return <ConversationsList onOpenChat={handleOpenChatFromList} />;
      case "chat":
        return (
          <ChatScreen
            provider={activeChat}
            clientName={clientName}
            onBack={() => setClientPage("messages")}
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

  // ── Pages prestataire ─────────────────────────────────────
  const renderPrestPage = () => {
    switch (prestPage) {
      case "dashboard": return <Dashboard providerName={providerName} />;
      case "messages":  return <PrestConvos onOpenChat={handleOpenPrestChat} />;
      case "chat":
        return (
          <PrestChatScreen
            chat={activePrestChat}
            providerName={providerName}
            onBack={() => setPrestPage("messages")}
          />
        );
      case "earnings":  return <Earnings />;
      case "profile":   return <ProviderProfile providerName={providerName} onLogout={handleLogout} />;
      default:          return <Dashboard providerName={providerName} />;
    }
  };

  const hideClientNav = clientPage === "chat";
  const hidePrestNav  = prestPage  === "chat";

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
          {!hideClientNav && <Header clientName={clientName} onProfileClick={() => setClientPage("profile")} />}
          <main>{renderClientPage()}</main>
          {!hideClientNav && (
            <BottomNav
              active={clientPage}
              onChange={(p) => { setSearchService(null); setActiveChat(null); setClientPage(p); }}
              favCount={favorites.length}
              unreadCount={unreadClient}
            />
          )}
          {selectedProvider && (
            <ProviderModal
              provider={selectedProvider}
              onClose={() => setSelectedProvider(null)}
              onOpenChat={handleOpenChat}
            />
          )}
        </>
      )}

      {step === "app-prest" && (
        <>
          <BackgroundPrest />
          {!hidePrestNav && <HeaderPrest providerName={providerName} onProfileClick={() => setPrestPage("profile")} />}
          <main>{renderPrestPage()}</main>
          {!hidePrestNav && (
            <BottomNavPrest
              active={prestPage}
              onChange={(p) => { setActivePrestChat(null); setPrestPage(p); }}
              unreadCount={unreadPrest}
            />
          )}
        </>
      )}
    </>
  );
}
