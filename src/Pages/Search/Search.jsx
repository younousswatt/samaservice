import { useState, useEffect, lazy, Suspense } from "react";
import { getAllProviders, ALL_SERVICES } from "../../firestoreService";
import ProviderCard   from "../../Components/ProviderCard/ProviderCard";
import useGeolocation from "../../hooks/useGeolocation";
import "./Search.css";

const ProvidersMap = lazy(() => import("../../Components/ProvidersMap/ProvidersMap"));

const RADIUS_OPTIONS = [1, 2, 5, 10];

// Distance Haversine (km)
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

export default function Search({
  initialService = null,
  favorites = [],
  onFavToggle,
  onProviderClick,
}) {
  const [providers,     setProviders]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [query,         setQuery]         = useState(initialService || "");
  const [activeService, setActiveService] = useState(initialService || "Tous");
  const [viewMode,      setViewMode]      = useState("list");
  const [radiusKm,      setRadiusKm]      = useState(5);
  const [onlyAvail,     setOnlyAvail]     = useState(false);

  const { position, loading: gpsLoading } = useGeolocation();

  // ── Charger Firestore ─────────────────────────────────────
  useEffect(() => {
    getAllProviders()
      .then((data) => { setProviders(data); setLoading(false); })
      .catch(()    => { setLoading(false); });
  }, []);

  // ── Sync chip si initialService change ────────────────────
  useEffect(() => {
    if (initialService) {
      setActiveService(initialService);
      setQuery(initialService);
    }
  }, [initialService]);

  // ── Enrichir avec distance ────────────────────────────────
  const providersWithDistance = providers.map((p) => ({
    ...p,
    distance: position && p.lat && p.lng
      ? Math.round(haversine(position.lat, position.lng, p.lat, p.lng) * 10) / 10
      : null,
  }));

  // ── Chips services dynamiques depuis ALL_SERVICES ─────────
  const serviceLabels = ["Tous", ...ALL_SERVICES.map((s) => s.label)];

  // ── Filtrage ──────────────────────────────────────────────
  const filtered = providersWithDistance.filter((p) => {
    const matchService = activeService === "Tous" ||
      p.service?.toLowerCase() === activeService.toLowerCase();
    const matchQuery =
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.service?.toLowerCase().includes(query.toLowerCase()) ||
      p.quartier?.toLowerCase().includes(query.toLowerCase());
    const matchAvail = !onlyAvail || p.available;
    return matchService && matchQuery && matchAvail;
  });

  // ── Tri par distance ──────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return (
    <div className="search-page">

      {/* Barre de recherche */}
      <div className="search-page__bar-wrap">
        <div className="search-page__bar">
          <span className="search-page__bar-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un service, un nom, un quartier…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveService("Tous"); }}
            className="search-page__input"
          />
          {query && (
            <button className="search-page__clear" onClick={() => { setQuery(""); setActiveService("Tous"); }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chips services */}
      <div className="search-page__chips">
        {serviceLabels.map((s) => (
          <button
            key={s}
            className={`search-page__chip ${activeService === s ? "search-page__chip--active" : ""}`}
            onClick={() => { setActiveService(s); setQuery(s === "Tous" ? "" : s); }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="search-page__toolbar">
        <div className="view-toggle">
          <button
            className={`view-toggle__btn ${viewMode === "list" ? "view-toggle__btn--active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            ☰ Liste
          </button>
          <button
            className={`view-toggle__btn ${viewMode === "map" ? "view-toggle__btn--active" : ""}`}
            onClick={() => setViewMode("map")}
          >
            🗺️ Carte
          </button>
        </div>

        <button
          className={`search-page__filter-btn ${onlyAvail ? "search-page__filter-btn--active" : ""}`}
          onClick={() => setOnlyAvail(!onlyAvail)}
        >
          {onlyAvail ? "✅ Disponibles" : "Disponibles"}
        </button>

        {viewMode === "map" && (
          <div className="radius-select">
            <span>📍</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="radius-select__input"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>
          </div>
        )}

        <span className="search-page__count">
          {loading ? "…" : `${sorted.length} résultat${sorted.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Contenu : Liste ou Carte */}
      {viewMode === "list" ? (
        <div className="search-page__results">
          {loading ? (
            <div className="search-page__loading">
              <div className="search-page__spinner" />
              <span>Chargement des prestataires…</span>
            </div>
          ) : sorted.length === 0 ? (
            <div className="search-page__empty">
              <div style={{ fontSize: "2.5rem" }}>🔍</div>
              <p>Aucun prestataire trouvé</p>
              <span>Essayez un autre service ou un autre quartier</span>
            </div>
          ) : (
            sorted.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                isFav={favorites.includes(p.id)}
                onFavToggle={() => onFavToggle(p.id)}
                onClick={() => onProviderClick(p)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="search-page__map-wrap">
          {gpsLoading ? (
            <div className="map-gps-loading">
              <div className="map-gps-loading__spinner" />
              <p>Localisation GPS en cours…</p>
            </div>
          ) : (
            <Suspense fallback={
              <div className="map-gps-loading">
                <div className="map-gps-loading__spinner" />
                <p>Chargement de la carte…</p>
              </div>
            }>
              <ProvidersMap
                userPosition={position}
                providers={sorted}
                radiusKm={radiusKm}
                favorites={favorites}
                onProviderClick={onProviderClick}
              />
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
}
