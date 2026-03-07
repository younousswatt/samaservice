import { useEffect, useRef, useState } from "react";
import "./OTPInput.css";

const CODE_LENGTH = 6; // Firebase envoie 6 chiffres
const RESEND_SEC  = 30;

export default function OTPInput({ phone, onBack, onVerified }) {
  const [digits,    setDigits]    = useState(Array(CODE_LENGTH).fill(""));
  const [error,     setError]     = useState(false);
  const [errMsg,    setErrMsg]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SEC);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError(false);
    setErrMsg("");

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!paste) return;
    const newDigits = [...digits];
    paste.split("").forEach((ch, i) => { if (i < CODE_LENGTH) newDigits[i] = ch; });
    setDigits(newDigits);
    inputRefs.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
  };

  const verify = async () => {
    const entered = digits.join("");
    if (entered.length < CODE_LENGTH) return;

    setLoading(true);
    setError(false);
    setErrMsg("");

    try {
      // Vérification avec Firebase
      await window.confirmationResult.confirm(entered);
      onVerified();
    } catch (err) {
      console.error(err);
      setError(true);
      setErrMsg("Code incorrect ou expiré. Réessayez.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = () => {
    setCountdown(RESEND_SEC);
    setDigits(Array(CODE_LENGTH).fill(""));
    setError(false);
    setErrMsg("");
    // Retourne à l'étape téléphone pour renvoyer
    onBack();
  };

  const isFull = digits.every((d) => d !== "");

  return (
    <div className="otp-input">
      <button className="otp-input__back" onClick={onBack}>←</button>

      {/* Hero */}
      <div className="otp-input__hero">
        <div className="otp-input__icon">💬</div>
        <div className="otp-input__title">Code reçu ?</div>
        <div className="otp-input__subtitle">
          Entrez le code à 6 chiffres envoyé au{" "}
          <span className="otp-input__phone">{phone}</span>
        </div>
      </div>

      {/* Body */}
      <div className="otp-input__body">
        <div className="otp-input__boxes" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              className={[
                "otp-input__box",
                d ? "otp-input__box--filled" : "",
                error ? "otp-input__box--error" : "",
              ].join(" ")}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <div className={`otp-input__hint${error ? " otp-input__hint--error" : ""}`}>
          {error ? errMsg : "Saisissez les 6 chiffres reçus par SMS"}
        </div>

        <div className="otp-input__resend">
          {countdown > 0 ? (
            <span className="otp-input__resend-timer">
              Renvoyer dans {countdown}s
            </span>
          ) : (
            <button className="otp-input__resend-btn" onClick={resend}>
              Renvoyer le code
            </button>
          )}
        </div>

        <button
          className="otp-input__btn"
          onClick={verify}
          disabled={!isFull || loading}
        >
          {loading ? "Vérification…" : "Vérifier le code ✓"}
        </button>
      </div>
    </div>
  );
}
