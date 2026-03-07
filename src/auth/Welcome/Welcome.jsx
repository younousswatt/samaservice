import "./Welcome.css";

const PILLS = ["📍 Géolocalisé", "⭐ Avis vérifiés", "💳 Mobile Money"];

export default function Welcome({ onClientStart, onProviderStart }) {
  return (
    <div className="welcome">
      {/* ── Hero ── */}
      <div className="welcome__hero">
        <div className="welcome__ring welcome__ring--1" />
        <div className="welcome__ring welcome__ring--2" />

        <div className="welcome__logo-wrap">
          <div className="welcome__logo-glow" />
          🛠️
        </div>

        <div className="welcome__title">
          Bienvenue sur{"\n"}SamaService
        </div>

        <div className="welcome__tagline">
          Trouvez le bon prestataire près de chez vous, en quelques secondes.
        </div>

        <div className="welcome__pills">
          {PILLS.map((p) => (
            <span key={p} className="welcome__pill">{p}</span>
          ))}
        </div>
      </div>

      {/* ── Bottom panel ── */}
      <div className="welcome__bottom">
        {/* Main CTA → client */}
        <button className="welcome__btn-start" onClick={onClientStart}>
          Démarrer 🚀
        </button>

        <div className="welcome__divider">ou</div>

        {/* Provider question */}
        <div className="welcome__provider-row">
          <span className="welcome__provider-label">Vous êtes prestataire ?</span>
          <button className="welcome__btn-provider" onClick={onProviderStart}>
            🔧 Espace Pro →
          </button>
        </div>
      </div>
    </div>
  );
}
