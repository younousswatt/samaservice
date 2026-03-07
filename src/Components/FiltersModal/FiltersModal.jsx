import "./FiltersModal.css";

export default function FiltersModal({ onClose, onApply }) {
  return (
    <div
      className="filters-modal__overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="filters-modal__sheet">
        <div className="filters-modal__handle" />

        <div className="filters-modal__header">
          <h2>Filtres</h2>
          <button className="filters-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="filters-modal__body">
          {/* Distance */}
          <div className="filters-modal__section">
            <h3>Distance</h3>
            {["Moins de 2 km", "Moins de 5 km", "Moins de 10 km", "Moins de 20 km"].map((l, i) => (
              <label key={l} className="filters-modal__radio">
                <input type="radio" name="distance" defaultChecked={i === 1} />
                {l}
              </label>
            ))}
          </div>

          <div className="filters-modal__divider" />

          {/* Note */}
          <div className="filters-modal__section">
            <h3>Note minimale</h3>
            <select className="filters-modal__select">
              <option>Toutes les notes</option>
              <option>4.0 et plus</option>
              <option>4.5 et plus</option>
              <option>4.8 et plus</option>
            </select>
          </div>

          <div className="filters-modal__divider" />

          {/* Dispo */}
          <div className="filters-modal__section">
            <h3>Disponibilité</h3>
            <label className="filters-modal__checkbox">
              <input type="checkbox" defaultChecked />
              Disponible maintenant uniquement
            </label>
          </div>

          <div className="filters-modal__divider" />
        </div>

        <div className="filters-modal__actions">
          <button className="filters-modal__btn-apply" onClick={onApply}>
            Appliquer
          </button>
          <button className="filters-modal__btn-cancel" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
