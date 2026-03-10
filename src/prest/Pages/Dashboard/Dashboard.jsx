import { useState, useEffect } from "react";
import { auth } from "../../../firebase";
import { updateAvailability, saveProvider } from "../../../firestoreService";
import StatsBar      from "../../Components/StatsBar/StatsBar";
import StatusToggle  from "../../Components/StatusToggle/StatusToggle";
import BoostCard     from "../../Components/BoostCard/BoostCard";
import ProCard       from "../../Components/ProCard/ProCard";
import ServicesList  from "../../Components/ServicesList/ServicesList";
import "./Dashboard.css";

export default function Dashboard({ providerName }) {
  const [available, setAvailable] = useState(true);
  const [gpsStatus, setGpsStatus] = useState("idle");

  // ── Sauvegarde GPS au montage ──────────────────────────────
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !navigator.geolocation) return;

    setGpsStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await saveProvider(uid, {
            name: providerName,
            lat:  pos.coords.latitude,
            lng:  pos.coords.longitude,
          });
          setGpsStatus("saved");
          setTimeout(() => setGpsStatus("idle"), 4000);
        } catch {
          setGpsStatus("error");
        }
      },
      () => {
        setGpsStatus("error");
        setTimeout(() => setGpsStatus("idle"), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []); // eslint-disable-line

  const handleToggle = async (val) => {
    setAvailable(val);
    const uid = auth.currentUser?.uid;
    if (uid) await updateAvailability(uid, val);
  };

  return (
    <div className="dashboard">
      {gpsStatus === "loading" && (
        <div className="dashboard__gps-banner dashboard__gps-banner--loading">
          📍 Mise à jour de votre position…
        </div>
      )}
      {gpsStatus === "saved" && (
        <div className="dashboard__gps-banner dashboard__gps-banner--saved">
          ✅ Position sauvegardée — vous apparaissez sur la carte clients
        </div>
      )}
      {gpsStatus === "error" && (
        <div className="dashboard__gps-banner dashboard__gps-banner--error">
          ⚠️ Position non disponible — activez le GPS pour apparaître sur la carte
        </div>
      )}

      <div className="dashboard__greeting">
        Bonjour, <span>{providerName || "Prestataire"}</span> 👋
      </div>

      <StatsBar />
      <StatusToggle available={available} onToggle={handleToggle} />
      <BoostCard />
      <ServicesList />
      <ProCard />
    </div>
  );
}
