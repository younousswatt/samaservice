import { useState, useEffect } from "react";
import { auth } from "../../../firebase";
import { updateAvailability, saveProvider } from "../../../firestoreService";
import { getProviderAnalytics, getEarningsLast7Days, getRecentTransactions } from "../../../analyticsService";
import StatusToggle from "../../Components/StatusToggle/StatusToggle";
import BoostCard    from "../../Components/BoostCard/BoostCard";
import ProCard      from "../../Components/ProCard/ProCard";
import "./Dashboard.css";

// ── Mini graphique barres (sans librairie externe) ────────────
function EarningsChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="earnings-chart">
      <div className="earnings-chart__title">Revenus — 7 derniers jours</div>
      <div className="earnings-chart__bars">
        {data.map(({ day, amount }) => (
          <div key={day} className="earnings-chart__col">
            <div className="earnings-chart__bar-wrap">
              <div
                className="earnings-chart__bar"
                style={{ height: `${Math.max((amount / max) * 100, amount > 0 ? 8 : 2)}%` }}
              />
            </div>
            <div className="earnings-chart__day">{day}</div>
            {amount > 0 && (
              <div className="earnings-chart__amount">
                {amount >= 1000 ? `${Math.round(amount / 1000)}k` : amount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Carte stat ────────────────────────────────────────────────
function StatCard({ icon, value, label, highlight, sublabel }) {
  return (
    <div className={`stat-card ${highlight ? "stat-card--highlight" : ""}`}>
      <span className="stat-card__icon">{icon}</span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
      {sublabel && <span className="stat-card__sublabel">{sublabel}</span>}
    </div>
  );
}

export default function Dashboard({ providerName }) {
  const [available,     setAvailable]     = useState(true);
  const [gpsStatus,     setGpsStatus]     = useState("idle");
  const [analytics,     setAnalytics]     = useState(null);
  const [chartData,     setChartData]     = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  const uid = auth.currentUser?.uid;

  // ── Charger analytics ─────────────────────────────────────
  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    Promise.all([
      getProviderAnalytics(uid),
      getEarningsLast7Days(uid),
      getRecentTransactions(uid, 4),
    ]).then(([stats, chart, txns]) => {
      if (stats) {
        setAnalytics(stats);
        setAvailable(stats.available);
      }
      setChartData(chart);
      setTransactions(txns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  // ── Mise à jour GPS ───────────────────────────────────────
  useEffect(() => {
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
        } catch { setGpsStatus("error"); }
      },
      () => { setGpsStatus("error"); setTimeout(() => setGpsStatus("idle"), 4000); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []); // eslint-disable-line

  const handleToggle = async (val) => {
    setAvailable(val);
    if (uid) await updateAvailability(uid, val);
  };

  const formatFCFA = (n) => {
    if (!n) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `${Math.round(n / 1000)}k`;
    return n.toString();
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "–";
    const d = ts.toDate();
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Aujourd'hui, ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const todayEarnings = chartData.find((d) => {
    const today = new Date().toLocaleDateString("fr-FR", { weekday: "short" });
    return d.day === today;
  })?.amount || 0;

  return (
    <div className="dashboard">

      {/* Bannières GPS */}
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
          ⚠️ Position non disponible — activez le GPS
        </div>
      )}

      {/* Greeting */}
      <div className="dashboard__greeting">
        Bonjour, <span>{providerName || "Prestataire"}</span> 👋
      </div>

      {/* Toggle disponibilité */}
      <StatusToggle available={available} onToggle={handleToggle} />

      {/* ── Stats ─────────────────────────────────────────── */}
      {loading ? (
        <div className="dashboard__loading">
          <div className="dashboard__spinner" />
          <span>Chargement des statistiques…</span>
        </div>
      ) : (
        <>
          {/* Ligne 1 : vues / appels / note */}
          <div className="dashboard__stats-grid">
            <StatCard icon="👁️" value={analytics?.views  || 0} label="Vues"   sublabel="profil vu" />
            <StatCard icon="📞" value={analytics?.calls  || 0} label="Appels" sublabel="reçus"     />
            <StatCard
              icon="⭐"
              value={analytics?.rating || "–"}
              label="Note"
              sublabel={`${analytics?.reviews || 0} avis`}
              highlight
            />
          </div>

          {/* Ligne 2 : revenus total / aujourd'hui / prestations */}
          <div className="dashboard__stats-grid dashboard__stats-grid--earnings">
            <StatCard
              icon="💰"
              value={`${formatFCFA(analytics?.totalEarnings)} F`}
              label="Total revenus"
              sublabel="depuis le début"
            />
            <StatCard
              icon="📅"
              value={`${formatFCFA(todayEarnings)} F`}
              label="Aujourd'hui"
              sublabel="encaissé"
            />
            <StatCard
              icon="✅"
              value={analytics?.totalJobs || 0}
              label="Prestations"
              sublabel="réalisées"
            />
          </div>

          {/* Graphique 7 jours */}
          {chartData.some((d) => d.amount > 0) && (
            <EarningsChart data={chartData} />
          )}

          {/* Dernières transactions */}
          {transactions.length > 0 && (
            <div className="dashboard__transactions">
              <div className="dashboard__section-title">Dernières prestations</div>
              {transactions.map((t) => (
                <div key={t.id} className="dashboard__txn-row">
                  <span className="dashboard__txn-icon">{t.icon || "🔧"}</span>
                  <div className="dashboard__txn-info">
                    <div className="dashboard__txn-label">{t.label}</div>
                    <div className="dashboard__txn-date">{formatTime(t.createdAt)}</div>
                  </div>
                  <span className="dashboard__txn-amount">+{formatFCFA(t.amount)} F</span>
                </div>
              ))}
            </div>
          )}

          {/* Pas encore de données */}
          {!analytics?.totalJobs && transactions.length === 0 && (
            <div className="dashboard__empty">
              <span>📊</span>
              <p>Pas encore de données</p>
              <small>Vos statistiques apparaîtront ici au fil de vos prestations</small>
            </div>
          )}
        </>
      )}

      <BoostCard />
      <ProCard />
    </div>
  );
}
