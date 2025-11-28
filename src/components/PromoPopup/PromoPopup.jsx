import React, { useState, useEffect } from "react";
import closeIcon from "../../assets/icons/close.svg";
import copy from "../../assets/icons/copy.svg";
import copyCheck from "../../assets/icons/copyCheck.svg";

import styles from "./PromoPopup.module.css";

const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Show popup after 4 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyPromoCode = async () => {
    try {
      await navigator.clipboard.writeText("ПЕРВЫЙ500");
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.popupBody}>
          <button
            onClick={() => setIsOpen(false)}
            className={styles.closeButton}
          >
            <img src={closeIcon} alt="Close" loading="lazy" />
          </button>

          <div className={styles.content}>
            <h2 className={styles.heading}>Уже уходите?</h2>

            <p className={styles.subheading}>
              Возьмите промокод на первый заказ:
            </p>

            <div className={styles.promoSection}>
              <button
                className={styles.promoButton}
                onClick={handleCopyPromoCode}
              >
                <span className={styles.promoCode}>ПЕРВЫЙ500</span>
                <img
                  src={isCopied ? copyCheck : copy}
                  alt="Copy"
                  loading="lazy"
                />
              </button>
            </div>
            <div className={styles.popupHr}></div>
            <p className={styles.discountText}>СКИДКА 500 РУБЛЕЙ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;
