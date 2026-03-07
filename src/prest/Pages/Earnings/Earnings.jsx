import "./Earnings.css";

const TRANSACTIONS = [
  { id:1, icon:"🔧", name:"Réparation fuite", date:"Aujourd'hui, 10h30",   amount:"15 000" },
  { id:2, icon:"⚙️", name:"Installation robinet", date:"Hier, 14h15",      amount:"20 000" },
  { id:3, icon:"🔩", name:"Débouchage évier", date:"Lundi, 09h00",          amount:"12 000" },
  { id:4, icon:"🔧", name:"Réparation chasse d'eau", date:"Vendredi, 16h45",amount:"8 000"  },
];

export default function Earnings() {
  return (
    <div className="earnings">
      <div className="earnings__header">
        <div className="earnings__title">Revenus 💰</div>
        <div className="earnings__subtitle">Mois de novembre 2025</div>
      </div>

      {/* Total */}
      <div className="earnings__total-card">
        <div className="earnings__total-label">Total encaissé</div>
        <div>
          <span className="earnings__total-value">55 000</span>
          <span className="earnings__total-currency">FCFA</span>
        </div>
        <div className="earnings__total-period">Ce mois-ci • 4 prestations</div>
      </div>

      <div className="earnings__divider" />

      {/* Transactions */}
      <div className="earnings__section">
        <div className="earnings__section-title">Dernières prestations</div>
        {TRANSACTIONS.map((t) => (
          <div key={t.id} className="earnings__row">
            <div className="earnings__row-left">
              <span className="earnings__row-icon">{t.icon}</span>
              <div className="earnings__row-info">
                <div className="earnings__row-name">{t.name}</div>
                <div className="earnings__row-date">{t.date}</div>
              </div>
            </div>
            <span className="earnings__row-amount">{t.amount} F</span>
          </div>
        ))}
      </div>
    </div>
  );
}
