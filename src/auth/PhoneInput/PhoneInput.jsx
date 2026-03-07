import { useState } from "react";
import { auth } from "../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "./PhoneInput.css";

const COUNTRIES = [
  { code: "+221", flag: "🇸🇳", name: "Sénégal"      },
  { code: "+222", flag: "🇲🇷", name: "Mauritanie"    },
  { code: "+223", flag: "🇲🇱", name: "Mali"          },
  { code: "+224", flag: "🇬🇳", name: "Guinée"        },
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
];

export default function PhoneInput({ onBack, onSubmit }) {
  const [country,  setCountry]  = useState(COUNTRIES[0]);
  const [number,   setNumber]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const isValid = number.replace(/\s/g, "").length >= 9;

  const setupRecaptcha = () => {
    // Crée le reCAPTCHA invisible une seule fois
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "normal" }
      );
    }
  };

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");

    const fullPhone = `${country.code}${number.replace(/\s/g, "")}`;

    try {
      setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhone,
        window.recaptchaVerifier
      );
      // On passe confirmationResult à l'étape OTP
      window.confirmationResult = confirmationResult;
      onSubmit(fullPhone);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi du SMS. Vérifiez le numéro.");
      // Reset recaptcha en cas d'erreur
      window.recaptchaVerifier = null;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    const formatted = raw
      .replace(/^(\d{2})(\d)/,        "$1 $2")
      .replace(/^(\d{2} \d{3})(\d)/,  "$1 $2")
      .replace(/^(\d{2} \d{3} \d{2})(\d)/, "$1 $2");
    setNumber(formatted);
  };

  return (
    <div className="phone-input">
      <button className="phone-input__back" onClick={onBack}>←</button>

      

      {/* Hero */}
      <div className="phone-input__hero">
        <div className="phone-input__icon">📱</div>
        <div className="phone-input__title">Votre numéro</div>
        <div className="phone-input__subtitle">
          Nous allons vous envoyer un code de vérification par SMS
        </div>
      </div>

      {/* Form */}
      <div className="phone-input__form">
        <label className="phone-input__label">Numéro de téléphone</label>

        <div className="phone-input__row">
          <select
            className="phone-input__country"
            value={country.code}
            onChange={(e) =>
              setCountry(COUNTRIES.find((c) => c.code === e.target.value))
            }
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>

          <input
            className="phone-input__number"
            type="tel"
            placeholder="77 000 00 00"
            value={number}
            onChange={handleChange}
            autoFocus
          />
        </div>

        {error && (
          <div style={{ color: "#ef4444", fontSize: ".82rem", marginBottom: "1rem" }}>
            ⚠️ {error}
          </div>
        )}

        <div className="phone-input__hint">
          Exemple : 77 123 45 67 ou 78 000 00 00
        </div>
        <div id="recaptcha-container" />
        <button
          className="phone-input__btn"
          onClick={handleSend}
          disabled={!isValid || loading}
        >
          {loading ? "Envoi en cours…" : "Envoyer le code SMS →"}
        </button>
      </div>
    </div>
  );
}
