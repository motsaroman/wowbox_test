import { useState } from "react";

import success1 from "../../assets/icons/successIcon1.svg";
import success2 from "../../assets/icons/succsess2.svg";
import success3 from "../../assets/icons/success3.svg";

import noSuccessIcon from "../../assets/images/noSuccessIcon.webp";

import styles from "./PaymentResultModal.module.css";

const PaymentResultModal = ({
  isOpen = true,
  onClose,
  isSuccess = true,
  orderNumber = "OO OOO OOO1",
  onRetry,
  onGoHome,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${
          isSuccess ? styles.modalBodySuccess : styles.modalContentErrorMessadge
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isSuccess && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <div
          className={`${styles.modalBody} ${
            !isSuccess ? styles.modalBodyForErrorMessadge : ""
          }`}
        >
          {isSuccess ? (
            // Success State
            <>
              <h2 className={styles.title}>Спасибо за заказ!</h2>

              <p className={styles.description}>
                Заказ успешно оплачен
                <br />и скоро мы передадим его в доставку
              </p>

              <div className={styles.divider}></div>

              <div className={styles.orderInfo}>
                <p className={styles.orderLabel}>Номер заказа:</p>
                <div className={styles.orderNumberWrapper}>
                  <p className={styles.orderNumber}>{orderNumber}</p>
                  <button
                    className={`${styles.copyButton} ${
                      isCopied ? styles.copied : ""
                    }`}
                    onClick={handleCopyOrderNumber}
                    aria-label={isCopied ? "Copied" : "Copy order number"}
                  >
                    {isCopied ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M16.667 5L7.5 14.167L3.333 10"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <rect
                          x="7"
                          y="7"
                          width="11"
                          height="11"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M4 13H3C2.44772 13 2 12.5523 2 12V3C2 2.44772 2.44772 2 3 2H12C12.5523 2 13 2.44772 13 3V4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div
                    className={styles.iconWrapper}
                    style={{ backgroundColor: "#E8F5E9" }}
                  >
                    <img src={success1} alt="Success Icon" loading="lazy" />
                  </div>
                  <span className={styles.infoText}>
                    Мы отправили подтверждение на ваш email
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <div
                    className={styles.iconWrapper}
                    style={{ backgroundColor: "#FFF3E0" }}
                  >
                    <img src={success2} alt="Success Icon" loading="lazy" />
                  </div>
                  <span className={styles.infoText}>
                    Трек-номер появится в течение 24 часов
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <div
                    className={styles.iconWrapper}
                    style={{ backgroundColor: "#E3F2FD" }}
                  >
                    <img src={success3} alt="Success Icon" loading="lazy" />
                  </div>
                  <span className={styles.infoText}>
                    Следите за статусом через SMS
                  </span>
                </div>
              </div>

              <button className={styles.primaryButton} onClick={onGoHome}>
                Перейти на главную
              </button>
            </>
          ) : (
            // Error State
            <>
              <div className={styles.errorIcon}>
                <img src={noSuccessIcon} alt="Error Icon" loading="lazy" />
              </div>

              <h2 className={styles.titleError}>Оплата не прошла</h2>

              <p className={styles.description}>
                Что-то пошло не так.
                <br />
                Повторите попытку позже
              </p>

              <button
                className={styles.primaryButton}
                onClick={() => {
                  onClose();
                  if (onRetry) onRetry();
                }}
              >
                Попробовать снова
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultModal;
