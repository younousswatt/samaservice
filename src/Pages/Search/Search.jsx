import { useState } from "react";
import "./Search.css";
import SearchBar    from "../../Components/SearchBar/SearchBar";
import ProviderCard from "../../Components/ProviderCard/ProviderCard";
import FiltersModal from "../../Components/FiltersModal/FiltersModal";
import { PROVIDERS } from "../Home/Home";
import { ALL_SERVICES } from "../../Components/ServiceGrid/ServiceGrid";

const QUICK_CHIPS = ALL_SERVICES.slice(0, 6).map((s) => s.label);

export default function Search({
  initialService = null,
  favorites,
  onFavToggle,
  onProviderClick,
}) {
  const [query,       setQuery]       = useState(initialService || "");
  const [activeChip,  setActiveChip]  = useState(initialService || null);
  const [showFilters, setShowFilters] = useState(false);

  const handleChip = (chip) => {
    if (activeChip === chip) {
      setActiveChip(null);
      setQuery("");
    } else {
      setActiveChip(chip);
      setQuery(chip);
    }
  };

  const filtered = PROVIDERS.filter((p) => {
    const q = query.toLowerCase();
    return (
      !q ||
      p.service.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="search-page">
      <div className="search-page__top">
        <SearchBar
          value={query}
          onChange={(v) => { setQuery(v); setActiveChip(null); }}
          onFilterClick={() => setShowFilters(true)}
        />

        {/* Quick chips */}
        <div className="search-page__chips">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              className={`search-page__chip${activeChip === chip ? " search-page__chip--active" : ""}`}
              onClick={() => handleChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="search-page__results-header">
        <span className="search-page__results-count">
          {filtered.length} prestataire{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
        </span>
        {query && (
          <button
            className="search-page__clear"
            onClick={() => { setQuery(""); setActiveChip(null); }}
          >
            ✕ Effacer
          </button>
        )}
      </div>

      {/* List */}
      <div className="search-page__list">
        {filtered.length === 0 ? (
          <div className="search-page__empty">
            <span className="search-page__empty-icon">🔍</span>
            Aucun prestataire pour cette recherche.
          </div>
        ) : (
          filtered.map((p, i) => (
            <ProviderCard
              key={p.id}
              provider={p}
              isFav={favorites.includes(p.id)}
              onFavToggle={onFavToggle}
              onClick={() => onProviderClick(p)}
              delay={i * 0.06}
            />
          ))
        )}
      </div>

      {showFilters && (
        <FiltersModal
          onClose={() => setShowFilters(false)}
          onApply={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
