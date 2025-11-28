import styles from "./DeliveryModal.module.css";
import santaImage from "../../assets/images/santa-with-gifts.webp";

const DeliveryModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
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
          <img
            src={santaImage}
            alt="Santa with gifts"
            className={styles.santaImage}
            loading="lazy"
          />

          <h2 className={styles.title}>Задержка доставки</h2>

          <p className={styles.description}>
            В связи с новым годом доставка будет дольше обычного (в среднем
            задержка на 5 дней от обычных сроков). И в качестве извинения
            отправим небольшой презент чтобы скрасить ожидание
          </p>

          <div className={styles.buttonGroup}>
            <button className={styles.declineButton} onClick={onClose}>
              Отказаться
            </button>
            <button className={styles.acceptButton} onClick={onAccept}>
              Получить презент и оплатить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryModal;
