import { useState, useEffect } from "react";

/**
 * useGeolocation — récupère la position GPS du navigateur
 * Retourne { lat, lng, error, loading }
 */
export default function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        // Fallback sur Dakar centre si refus
        setPosition({ lat: 14.6928, lng: -17.4467 });
        setError("Position par défaut : Dakar centre");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { position, error, loading };
}
