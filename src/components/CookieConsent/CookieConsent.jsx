import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <p className={styles.text}>
        Пользуясь нашим сайтом, вы соглашаетесь с тем, что{" "}
        <Link to="/privacy" className={styles.link}>
          мы используем cookies
        </Link>
      </p>
      <button className={styles.button} onClick={handleAccept}>
        OK
      </button>
    </div>
  );
}