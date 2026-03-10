import { useState } from "react";
import "./ProviderNameInput.css";

// Catalogue des métiers (même liste que ALL_SERVICES dans firestoreService.js)
const METIERS = [
  { id: "plombier",     label: "Plombier",        icon: "🔧", category: "Bâtiment & Travaux" },
  { id: "electricien",  label: "Électricien",      icon: "⚡", category: "Bâtiment & Travaux" },
  { id: "macon",        label: "Maçon",            icon: "🧱", category: "Bâtiment & Travaux" },
  { id: "peintre",      label: "Peintre",          icon: "🎨", category: "Bâtiment & Travaux" },
  { id: "menuisier",    label: "Menuisier",        icon: "🪵", category: "Bâtiment & Travaux" },
  { id: "climaticien",  label: "Climaticien",      icon: "❄️", category: "Bâtiment & Travaux" },
  { id: "femme_menage", label: "Femme de ménage",  icon: "🧹", category: "Services à domicile" },
  { id: "cuisinier",    label: "Cuisinier",        icon: "👨‍🍳", category: "Services à domicile" },
  { id: "babysitter",   label: "Babysitter",       icon: "👶", category: "Services à domicile" },
  { id: "coiffeur",     label: "Coiffeur",         icon: "💇", category: "Services à domicile" },
  { id: "jardinier",    label: "Jardinier",        icon: "🌿", category: "Services à domicile" },
  { id: "chauffeur",    label: "Chauffeur",        icon: "🚗", category: "Services à domicile" },
  { id: "couturier",    label: "Couturier",        icon: "🧵", category: "Artisanat" },
  { id: "cordonnier",   label: "Cordonnier",       icon: "👟", category: "Artisanat" },
  { id: "tisserand",    label: "Tisserand",        icon: "🪡", category: "Artisanat" },
  { id: "bijoutier",    label: "Bijoutier",        icon: "💍", category: "Artisanat" },
  { id: "tapissier",    label: "Tapissier",        icon: "🛋️", category: "Artisanat" },
];

const CATEGORIES = [...new Set(METIERS.map((m) => m.category))];

export default function ProviderNameInput({ onBack, onSubmit }) {
  const [step,         setStep]         = useState("name");   // "name" | "metier"
  const [name,         setName]         = useState("");
  const [selectedId,   setSelectedId]   = useState(null);
  const [activeCategory, setActiveCategory] = useState("Bâtiment & Travaux");

  const nameValid   = name.trim().length >= 2;
  const metierValid = !!selectedId;

  const selectedMetier = METIERS.find((m) => m.id === selectedId);

  const handleNameNext = () => {
    if (!nameValid) return;
    setStep("metier");
  };

  const handleSubmit = () => {
    if (!metierValid) return;
    // On passe nom + métier au parent
    onSubmit(name.trim(), selectedMetier);
  };

  return (
    <div className="provider-name">
      <button className="provider-name__back" onClick={step === "name" ? onBack : () => setStep("name")}>
        ←
      </button>

      {/* ── ÉTAPE 1 : Nom ─────────────────────────────── */}
      {step === "name" && (
        <>
          <div className="provider-name__hero">
            <div className="provider-name__icon">🔧</div>
            <div className="provider-name__title">Espace Prestataire</div>
            <div className="provider-name__subtitle">
              Comment vous appelez-vous ? Vos clients verront ce nom sur votre profil.
            </div>
          </div>

          <div className="provider-name__form">
            <label className="provider-name__label">Votre nom complet</label>
            <input
              className="provider-name__input"
              type="text"
              placeholder="Ex : Aliou Badji"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
              autoFocus
            />
            <div className="provider-name__hint">
              Utilisez votre vrai nom — cela inspire confiance aux clients.
            </div>

            <button
              className="provider-name__btn"
              onClick={handleNameNext}
              disabled={!nameValid}
            >
              Continuer →
            </button>
          </div>
        </>
      )}

      {/* ── ÉTAPE 2 : Choisir le métier ───────────────── */}
      {step === "metier" && (
        <>
          <div className="provider-name__hero">
            <div className="provider-name__icon">🛠️</div>
            <div className="provider-name__title">Votre métier</div>
            <div className="provider-name__subtitle">
              Quel service proposez-vous ? Choisissez votre spécialité principale.
            </div>
          </div>

          <div className="provider-name__form">
            {/* Chips catégories */}
            <div className="provider-name__cat-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`provider-name__cat-chip ${activeCategory === cat ? "provider-name__cat-chip--active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grille métiers */}
            <div className="provider-name__metiers">
              {METIERS.filter((m) => m.category === activeCategory).map((m) => (
                <div
                  key={m.id}
                  className={`provider-name__metier ${selectedId === m.id ? "provider-name__metier--active" : ""}`}
                  onClick={() => setSelectedId(m.id)}
                >
                  <span className="provider-name__metier-icon">{m.icon}</span>
                  <span className="provider-name__metier-label">{m.label}</span>
                  {selectedId === m.id && <span className="provider-name__metier-check">✓</span>}
                </div>
              ))}
            </div>

            {selectedMetier && (
              <div className="provider-name__selected-info">
                {selectedMetier.icon} <strong>{selectedMetier.label}</strong> sélectionné
              </div>
            )}

            <button
              className="provider-name__btn"
              onClick={handleSubmit}
              disabled={!metierValid}
            >
              Accéder à mon espace Pro →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
