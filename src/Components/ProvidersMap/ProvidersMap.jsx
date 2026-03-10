import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ProvidersMap.css";

// ── Fix icônes Leaflet avec React ────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Icône prestataire disponible (vert SamaService) ──────────
const availableIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="sama-marker sama-marker--available">
      <span>🔧</span>
    </div>
  `,
  iconSize:   [40, 40],
  iconAnchor: [20, 40],
  popupAnchor:[0, -40],
});

// ── Icône prestataire occupé (gris) ──────────────────────────
const busyIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="sama-marker sama-marker--busy">
      <span>🔧</span>
    </div>
  `,
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
  popupAnchor:[0, -36],
});

// ── Icône position client ────────────────────────────────────
const clientIcon = new L.DivIcon({
  className: "",
  html: `<div class="sama-marker sama-marker--client"><span>📍</span></div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
});

// ── Composant de recentrage dynamique ────────────────────────
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// ── Calcul distance en km (formule Haversine) ────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
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

// ── Composant principal ──────────────────────────────────────
export default function ProvidersMap({
  userPosition,    // { lat, lng }
  providers,       // tableau de prestataires
  radiusKm = 5,    // rayon de recherche
  onProviderClick, // callback(provider)
  favorites = [],
}) {
  if (!userPosition) return (
    <div className="map-loading">
      <div className="map-loading__spinner" />
      <p>Localisation en cours…</p>
    </div>
  );

  // Filtrer les prestataires qui ont une position ET dans le rayon
  const nearby = providers.filter((p) => {
    if (!p.lat || !p.lng) return false;
    return distanceKm(userPosition.lat, userPosition.lng, p.lat, p.lng) <= radiusKm;
  });

  return (
    <div className="providers-map">
      {/* Compteur */}
      <div className="providers-map__count">
        {nearby.length === 0
          ? "Aucun prestataire dans ce rayon"
          : `${nearby.length} prestataire${nearby.length > 1 ? "s" : ""} à moins de ${radiusKm} km`}
      </div>

      <MapContainer
        center={[userPosition.lat, userPosition.lng]}
        zoom={14}
        className="providers-map__container"
        zoomControl={true}
      >
        {/* Tuiles OpenStreetMap — 100% gratuit */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        <RecenterMap center={[userPosition.lat, userPosition.lng]} />

        {/* Cercle rayon de recherche */}
        <Circle
          center={[userPosition.lat, userPosition.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color:       "#ACC8A2",
            fillColor:   "#ACC8A2",
            fillOpacity: 0.08,
            weight:      2,
            dashArray:   "6 4",
          }}
        />

        {/* Position du client */}
        <Marker
          position={[userPosition.lat, userPosition.lng]}
          icon={clientIcon}
        >
          <Popup>
            <div className="map-popup map-popup--client">
              <strong>📍 Vous êtes ici</strong>
            </div>
          </Popup>
        </Marker>

        {/* Marqueurs prestataires */}
        {nearby.map((provider) => {
          const dist = distanceKm(
            userPosition.lat, userPosition.lng,
            provider.lat, provider.lng
          ).toFixed(1);
          const isFav = favorites.includes(provider.id);

          return (
            <Marker
              key={provider.id}
              position={[provider.lat, provider.lng]}
              icon={provider.available ? availableIcon : busyIcon}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup__header">
                    <strong>{provider.name}</strong>
                    {isFav && <span className="map-popup__fav">❤️</span>}
                  </div>
                  <div className="map-popup__service">{provider.service}</div>
                  <div className="map-popup__meta">
                    <span>⭐ {provider.rating || "–"}</span>
                    <span>📍 {dist} km</span>
                    <span className={provider.available ? "dispo--yes" : "dispo--no"}>
                      {provider.available ? "✅ Disponible" : "⏳ Occupé"}
                    </span>
                  </div>
                  <button
                    className="map-popup__btn"
                    onClick={() => onProviderClick(provider)}
                  >
                    Voir le profil →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
