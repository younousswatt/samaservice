import { useState, useEffect } from "react";
import { getAllProviders } from "../../firestoreService";
import SearchBar    from "../../Components/SearchBar/SearchBar";
import ServiceGrid  from "../../Components/ServiceGrid/ServiceGrid";
import ProviderCard from "../../Components/ProviderCard/ProviderCard";
import "./Home.css";

// Calcul distance Haversine entre deux coordonnées GPS (en km)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home({
  clientName,
  favorites,
  onFavToggle,
  onProviderClick,
  onSeeAll,
  onSearchFocus,
}) {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userPos,   setUserPos]   = useState(null);

  // ── Charger tous les prestataires depuis Firestore ────────
  useEffect(() => {
    getAllProviders()
      .then((data) => { setProviders(data); setLoading(false); })
      .catch(()    => { setLoading(false); });
  }, []);

  // ── Récupérer la position GPS du client ───────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()    => setUserPos({ lat: 14.6928, lng: -17.4467 }) // fallback Dakar centre
      );
    } else {
      setUserPos({ lat: 14.6928, lng: -17.4467 });
    }
  }, []);

  // ── Trier par distance dès qu'on a les coords ─────────────
  const nearbyTop = [...providers]
    .map((p) => ({
      ...p,
      distance: userPos && p.lat && p.lng
        ? Math.round(haversine(userPos.lat, userPos.lng, p.lat, p.lng) * 10) / 10
        : null,
    }))
    .filter((p) => p.available)
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    })
    .slice(0, 4);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="home">

      {/* Hero */}
      <div className="home__hero">
        <div className="home__greeting">{getGreeting()},</div>
        <div className="home__title">
          {clientName ? `${clientName} 👋` : "Quel service cherchez-vous ? 👋"}
        </div>
        <div className="home__subtitle">Trouvez un pro qualifié près de chez vous</div>
      </div>

      {/* Search bar (tap → Search page) */}
      <SearchBar value="" onChange={() => {}} onFilterClick={onSearchFocus} />

      <div className="home__divider" />

      {/* Grille catégories */}
      <div style={{ paddingTop: "1rem" }}>
        <ServiceGrid activeService={null} onSelect={(s) => onSeeAll(s)} />
      </div>

      <div className="home__divider" style={{ marginTop: "1rem" }} />

      {/* Prestataires près de vous */}
      <div className="home__section">
        <div className="home__section-header">
          <span className="home__section-title">📍 Près de vous</span>
          <button className="home__see-all" onClick={() => onSeeAll(null)}>Voir tout</button>
        </div>

        {loading ? (
          <div className="home__loading">
            <div className="home__spinner" />
            <span>Chargement des prestataires…</span>
          </div>
        ) : nearbyTop.length === 0 ? (
          <div className="home__empty">
            <span>😔</span>
            <p>Aucun prestataire disponible pour l'instant</p>
          </div>
        ) : (
          nearbyTop.map((p, i) => (
            <ProviderCard
              key={p.id}
              provider={p}
              isFav={favorites.includes(p.id)}
              onFavToggle={onFavToggle}
              onClick={() => onProviderClick(p)}
              delay={i * 0.07}
            />
          ))
        )}
      </div>

      {/* Stats rapides */}
      {!loading && (
        <div className="home__stats">
          <div className="home__stat">
            <span className="home__stat-value">{providers.length}</span>
            <span className="home__stat-label">Prestataires</span>
          </div>
          <div className="home__stat-divider" />
          <div className="home__stat">
            <span className="home__stat-value">{providers.filter((p) => p.available).length}</span>
            <span className="home__stat-label">Disponibles</span>
          </div>
          <div className="home__stat-divider" />
          <div className="home__stat">
            <span className="home__stat-value">17</span>
            <span className="home__stat-label">Services</span>
          </div>
        </div>
      )}
    </div>
  );
}
