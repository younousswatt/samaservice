import "./Dashboard.css";
import StatsBar     from "../../Components/StatsBar/StatsBar";
import BoostCard    from "../../Components/BoostCard/BoostCard";
import ProCard      from "../../Components/ProCard/ProCard";
import ServicesList from "../../Components/ServicesList/ServicesList";
import StatusToggle from "../../Components/StatusToggle/StatusToggle";
import ReviewsList  from "../../Components/ReviewsList/ReviewsList";

export default function Dashboard({ providerName = "Aliou B." }) {
  const firstName = providerName.split(" ")[0];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__welcome">
        <div className="dashboard__greeting">{getGreeting()},</div>
        <div className="dashboard__name">{firstName} 👋</div>
      </div>

      <div className="dashboard__divider" />

      {/* Stats */}
      <StatsBar />

      <div className="dashboard__divider" />

      {/* Status */}
      <StatusToggle initialStatus="available" />

      <div className="dashboard__divider" />

      {/* Services */}
      <ServicesList />

      <div className="dashboard__divider" />

      {/* Boost */}
      <BoostCard />

      {/* Pro */}
      <ProCard />

      <div className="dashboard__divider" />

      {/* Reviews */}
      <ReviewsList />
    </div>
  );
}
