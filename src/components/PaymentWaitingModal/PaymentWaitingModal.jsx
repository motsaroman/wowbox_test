import styles from "./PaymentWaitingModal.module.css";

const PaymentWaitingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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

        <div className={styles.modalBody}>
          {/* Clock Icon */}
          <div className={styles.clockIcon}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="56" stroke="#333" strokeWidth="4" />
              {/* Hour markers */}
              <line
                x1="60"
                y1="12"
                x2="60"
                y2="20"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="100"
                x2="60"
                y2="108"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="108"
                y1="60"
                x2="100"
                y2="60"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="20"
                y1="60"
                x2="12"
                y2="60"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <line
                x1="94"
                y1="26"
                x2="88"
                y2="32"
                stroke="#333"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="94"
                y1="94"
                x2="88"
                y2="88"
                stroke="#333"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="26"
                y1="26"
                x2="32"
                y2="32"
                stroke="#333"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="26"
                y1="94"
                x2="32"
                y2="88"
                stroke="#333"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Clock hands */}
              <line
                x1="60"
                y1="60"
                x2="60"
                y2="32"
                stroke="#333"
                strokeWidth="4"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 60 60"
                  to="360 60 60"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </line>
              <line
                x1="60"
                y1="60"
                x2="82"
                y2="60"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 60 60"
                  to="360 60 60"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </line>
              <circle cx="60" cy="60" r="4" fill="#333" />
            </svg>
          </div>

          <h2 className={styles.title}>Ожидаем оплату</h2>

          <p className={styles.description}>
            Подтвердите перевод в приложении банка.
            <br />
            Если вы уже оплатили, просто подождите —<br />
            всё скоро обновится
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentWaitingModal;
