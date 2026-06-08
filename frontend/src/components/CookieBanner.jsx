import { useState } from "react";
import { Link } from "react-router-dom";
import "./CookieBanner.css";

const CONSENT_KEY = "lf-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem(CONSENT_KEY);
  });

  if (!visible) return null;

  const handleAccept = () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ status: "accepted", timestamp: Date.now() })
    );
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setVisible(false);
  };

  return (
    <div className="cookie-banner" role="region" aria-label="Aviso de cookies">
      <p className="cookie-banner__text">
        Utilizamos cookies para melhorar sua experiência. Ao continuar
        navegando, você concorda com nossa{" "}
        <Link to="/politica-de-privacidade" className="cookie-banner__link">
          Política de Privacidade
        </Link>
        .
      </p>
      <div className="cookie-banner__actions">
        <button
          className="cookie-banner__btn cookie-banner__btn--reject"
          onClick={handleReject}
        >
          Rejeitar
        </button>
        <button
          className="cookie-banner__btn cookie-banner__btn--accept"
          onClick={handleAccept}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
