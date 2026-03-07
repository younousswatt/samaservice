import { useState } from "react";
import "./StatusToggle.css";

export default function StatusToggle({ initialStatus = "available" }) {
  const [status, setStatus] = useState(initialStatus);

  return (
    <div className="status-toggle">
      <div className="status-toggle__title">Mon statut</div>
      <div className="status-toggle__row">
        <button
          className={`status-toggle__btn status-toggle__btn--available${status === "available" ? " active" : ""}`}
          onClick={() => setStatus("available")}
        >
          <span className="status-toggle__indicator" />
          Disponible
        </button>
        <button
          className={`status-toggle__btn status-toggle__btn--busy${status === "busy" ? " active" : ""}`}
          onClick={() => setStatus("busy")}
        >
          <span className="status-toggle__indicator" />
          Occupé
        </button>
      </div>
    </div>
  );
}
