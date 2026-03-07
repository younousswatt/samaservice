import "./Home.css";
import SearchBar    from "../../Components/SearchBar/SearchBar";
import ServiceGrid  from "../../Components/ServiceGrid/ServiceGrid";
import ProviderCard from "../../Components/ProviderCard/ProviderCard";

export const PROVIDERS = [
  { id:1, name:"Aliou B.",    service:"Plombier",     distance:1.2, rating:4.8, reviews:32, available:true,  verified:true, phone:"+221771234567", services:["Fuite d'eau","Installation","Débouchage","Réparation"] },
  { id:2, name:"Moussa S.",   service:"Électricien",  distance:1.8, rating:4.9, reviews:45, available:true,  verified:true, phone:"+221772345678", services:["Installation","Réparation","Maintenance"] },
  { id:3, name:"Diallo K.",   service:"Maçon",        distance:2.1, rating:4.7, reviews:28, available:false, verified:true, phone:"+221773456789", services:["Construction","Réparation","Finition"] },
  { id:4, name:"Fatou M.",    service:"Jardinier",    distance:1.5, rating:4.9, reviews:19, available:true,  verified:true, phone:"+221774567890", services:["Tonte","Élagage","Entretien"] },
  { id:5, name:"Ibrahima N.", service:"Électricien",  distance:4.2, rating:4.5, reviews:35, available:true,  verified:true, phone:"+221775678901", services:["Installation","Diagnostic"] },
  { id:6, name:"Aminata D.",  service:"Peintre",      distance:3.8, rating:4.8, reviews:22, available:true,  verified:true, phone:"+221776789012", services:["Intérieur","Extérieur","Décoration"] },
  { id:7, name:"Cheikh T.",   service:"Cuisinier",    distance:2.5, rating:4.9, reviews:41, available:true,  verified:true, phone:"+221777890123", services:["Traiteur","Cours de cuisine","Service à domicile"] },
  { id:8, name:"Marieme C.",  service:"Couturier",    distance:1.9, rating:4.7, reviews:33, available:true,  verified:true, phone:"+221778901234", services:["Confection","Retouche","Création"] },
];

export default function Home({
  clientName,
  favorites,
  onFavToggle,
  onProviderClick,
  onSeeAll,
  onSearchFocus,
}) {
  const nearbyTop = [...PROVIDERS]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="home">
      {/* Hero banner */}
      <div className="home__hero">
        <div className="home__greeting">{getGreeting()},</div>
        <div className="home__title">Quel service cherchez-vous ? 👋</div>
        <div className="home__subtitle">Trouvez un pro qualifié près de chez vous</div>
      </div>

      {/* Search (tap → goes to Search page) */}
      <SearchBar value="" onChange={() => {}} onFilterClick={onSearchFocus} />

      <div className="home__divider" />

      {/* Service categories */}
      <div style={{ paddingTop: "1rem" }}>
        <ServiceGrid activeService={null} onSelect={(s) => onSeeAll(s)} />
      </div>

      <div className="home__divider" style={{ marginTop: "1rem" }} />

      {/* Nearest providers */}
      <div className="home__section">
        <div className="home__section-header">
          <span className="home__section-title">📍 Près de vous</span>
          <button className="home__see-all" onClick={() => onSeeAll(null)}>Voir tout</button>
        </div>
        {nearbyTop.map((p, i) => (
          <ProviderCard
            key={p.id}
            provider={p}
            isFav={favorites.includes(p.id)}
            onFavToggle={onFavToggle}
            onClick={() => onProviderClick(p)}
            delay={i * 0.07}
          />
        ))}
      </div>
    </div>
  );
}
