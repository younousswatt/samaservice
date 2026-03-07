import { useEffect, useState } from "react";
import "./Splash.css";

// Duration before auto-advancing (ms)
const SPLASH_DURATION = 2800;

export default function Splash({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      // Wait for exit animation then call onDone
      setTimeout(onDone, 480);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`splash${exiting ? " splash--exit" : ""}`}>
      {/* Decorative rings */}
      <div className="splash__ring splash__ring--1" />
      <div className="splash__ring splash__ring--2" />
      <div className="splash__ring splash__ring--3" />

      <div className="splash__content">
        {/* Logo */}
        <div className="splash__logo-wrap">
          <div className="splash__logo-glow" />
          🛠️
        </div>

        {/* Brand */}
        <div className="splash__title">SamaService</div>
        <div className="splash__tagline">Votre service, votre solution</div>

        {/* Progress bar */}
        <div className="splash__bar-wrap">
          <div className="splash__bar" />
        </div>
      </div>
    </div>
  );
}
