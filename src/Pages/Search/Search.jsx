import { useState, useEffect, lazy, Suspense } from "react";
import ProviderCard from "../../Components/ProviderCard/ProviderCard";
import useGeolocation from "../../hooks/useGeolocation";
import "./Search.css";

// Lazy load de la carte (évite d'importer Leaflet si pas nécessaire)
const ProvidersMap = lazy(() => import("../../Components/ProvidersMap/ProvidersMap"));

// ── Données mockées (à remplacer par Firestore) ──────────────
// Les prestataires fictifs ont des coordonnées autour de Dakar
const MOCK_PROVIDERS = [
  { id: 1,  name: "Aliou B.",    service: "Plombier",    rating: 4.8, reviews: 24, available: true,  lat: 14.6980, lng: -17.4420 },
  { id: 2,  name: "Moussa S.",   service: "Électricien", rating: 4.6, reviews: 18, available: true,  lat: 14.6850, lng: -17.4550 },
  { id: 3,  name: "Diallo K.",   service: "Maçon",       rating: 4.5, reviews: 31, available: false, lat: 14.7020, lng: -17.4380 },
  { id: 4,  name: "Fatou M.",    service: "Jardinier",   rating: 4.9, reviews: 12, available: true,  lat: 14.6910, lng: -17.4600 },
  { id: 5,  name: "Ibrahima N.", service: "Électricien", rating: 4.7, reviews: 9,  available: true,  lat: 14.6760, lng: -17.4490 },
  { id: 6,  name: "Aminata D.",  service: "Peintre",     rating: 4.4, reviews: 15, available: false, lat: 14.7100, lng: -17.4300 },
  { id: 7,  name: "Cheikh T.",   service: "Cuisinier",   rating: 5.0, reviews: 7,  available: true,  lat: 14.6820, lng: -17.4700 },
  { id: 8,  name: "Marieme C.",  service: "Couturier",   rating: 4.3, reviews: 20, available: true,  lat: 14.6950, lng: -17.4350 },
];

const SERVICES = ["Tous", "Plombier", "Électricien", "Maçon", "Peintre", "Cuisinier", "Couturier", "Jardinier"];
const RADIUS_OPTIONS = [1, 2, 5, 10];

export default function Search({
  initialService = null,
  favorites = [],
  onFavToggle,
  onProviderClick,
}) {
  const [query,      setQuery]      = useState(initialService || "");
  const [activeService, setActiveService] = useState(initialService || "Tous");
  const [viewMode,   setViewMode]   = useState("list"); // "list" | "map"
  const [radiusKm,   setRadiusKm]   = useState(5);
  const [onlyAvail,  setOnlyAvail]  = useState(false);

  const { position, loading: gpsLoading } = useGeolocation();

  // Sync chip si initialService change
  useEffect(() => {
    if (initialService) {
      setActiveService(initialService);
      setQuery(initialService);
    }
  }, [initialService]);

  // ── Filtrage ─────────────────────────────────────────────
  const filtered = MOCK_PROVIDERS.filter((p) => {
    const matchService = activeService === "Tous" || p.service === activeService;
    const matchQuery   = p.name.toLowerCase().includes(query.toLowerCase()) ||
                         p.service.toLowerCase().includes(query.toLowerCase());
    const matchAvail   = !onlyAvail || p.available;
    return matchService && matchQuery && matchAvail;
  });

  return (
    <div className="search-page">

      {/* ── Barre de recherche ────────────────────────── */}
      <div className="search-page__bar-wrap">
        <div className="search-page__bar">
          <span className="search-page__bar-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un service ou un nom…"
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

      {/* ── Chips services ───────────────────────────── */}
      <div className="search-page__chips">
        {SERVICES.map((s) => (
          <button
            key={s}
            className={`search-page__chip ${activeService === s ? "search-page__chip--active" : ""}`}
            onClick={() => { setActiveService(s); setQuery(s === "Tous" ? "" : s); }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Toolbar (toggle + filtres) ────────────────── */}
      <div className="search-page__toolbar">
        {/* Toggle liste / carte */}
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

        {/* Filtre disponibles */}
        <button
          className={`search-page__filter-btn ${onlyAvail ? "search-page__filter-btn--active" : ""}`}
          onClick={() => setOnlyAvail(!onlyAvail)}
        >
          {onlyAvail ? "✅ Disponibles" : "Disponibles"}
        </button>

        {/* Rayon (visible uniquement en mode carte) */}
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

        {/* Compteur */}
        <span className="search-page__count">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Contenu : Liste ou Carte ──────────────────── */}
      {viewMode === "list" ? (
        <div className="search-page__results">
          {filtered.length === 0 ? (
            <div className="search-page__empty">
              <div style={{ fontSize: "2.5rem" }}>🔍</div>
              <p>Aucun prestataire trouvé</p>
              <span>Essayez un autre service ou élargissez votre recherche</span>
            </div>
          ) : (
            filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                isFavorite={favorites.includes(p.id)}
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
                providers={filtered}
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
