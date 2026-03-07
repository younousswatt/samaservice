import "./SearchBar.css";

export default function SearchBar({ value, onChange, onFilterClick }) {
  return (
    <div className="searchbar">
      <div className="searchbar__wrap">
        <div className="searchbar__input-wrap">
          <span className="searchbar__icon">🔍</span>
          <input
            className="searchbar__input"
            type="text"
            placeholder="Rechercher un service… plombier, peintre…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button
          className="searchbar__filter-btn"
          onClick={onFilterClick}
          aria-label="Filtres"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}
