import { useState, useEffect } from "react";
import { auth } from "../../../firebase";
import { getProviderAnalytics, getRecentTransactions } from "../../../analyticsService";
import "./Earnings.css";

export default function Earnings() {
  const [analytics,    setAnalytics]    = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    Promise.all([
      getProviderAnalytics(uid),
      getRecentTransactions(uid, 10),
    ]).then(([stats, txns]) => {
      setAnalytics(stats);
      setTransactions(txns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  const formatFCFA = (n) => {
    if (!n) return "0";
    return n.toLocaleString("fr-FR");
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "–";
    const d = ts.toDate();
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Aujourd'hui, ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    if (diff < 172800) return `Hier, ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "short" });
  };

  const month = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="earnings">
        <div className="earnings__header">
          <div className="earnings__title">Revenus 💰</div>
        </div>
        <div className="earnings__loading">
          <div className="earnings__spinner" />
          <span>Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings">
      <div className="earnings__header">
        <div className="earnings__title">Revenus 💰</div>
        <div className="earnings__subtitle">{month}</div>
      </div>

      {/* Total */}
      <div className="earnings__total-card">
        <div className="earnings__total-label">Total encaissé</div>
        <div>
          <span className="earnings__total-value">{formatFCFA(analytics?.totalEarnings)}</span>
          <span className="earnings__total-currency"> FCFA</span>
        </div>
        <div className="earnings__total-period">
          {analytics?.totalJobs || 0} prestation{(analytics?.totalJobs || 0) > 1 ? "s" : ""} réalisée{(analytics?.totalJobs || 0) > 1 ? "s" : ""}
        </div>
      </div>

      {/* Métriques secondaires */}
      <div className="earnings__metrics">
        <div className="earnings__metric">
          <span className="earnings__metric-value">{analytics?.views || 0}</span>
          <span className="earnings__metric-label">👁️ Vues profil</span>
        </div>
        <div className="earnings__metric-divider" />
        <div className="earnings__metric">
          <span className="earnings__metric-value">{analytics?.calls || 0}</span>
          <span className="earnings__metric-label">📞 Appels reçus</span>
        </div>
        <div className="earnings__metric-divider" />
        <div className="earnings__metric">
          <span className="earnings__metric-value">{analytics?.rating || "–"}</span>
          <span className="earnings__metric-label">⭐ Note moy.</span>
        </div>
      </div>

      <div className="earnings__divider" />

      {/* Transactions */}
      <div className="earnings__section">
        <div className="earnings__section-title">Historique des prestations</div>

        {transactions.length === 0 ? (
          <div className="earnings__empty">
            <span>📋</span>
            <p>Aucune prestation enregistrée</p>
            <small>Vos revenus apparaîtront ici</small>
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="earnings__row">
              <div className="earnings__row-left">
                <span className="earnings__row-icon">{t.icon || "🔧"}</span>
                <div className="earnings__row-info">
                  <div className="earnings__row-name">{t.label}</div>
                  <div className="earnings__row-date">{formatTime(t.createdAt)}</div>
                </div>
              </div>
              <span className="earnings__row-amount">+{formatFCFA(t.amount)} F</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
