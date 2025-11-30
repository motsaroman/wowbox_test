import styles from "./OrderSuccessModal.module.css";

export default function OrderSuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Спасибо за ваш заказ! 🎉</h2>

        <p className={styles.text}>
          Мы свяжемся с вами в ближайшее время
          <br /> для подтверждения заказа и деталей оплаты.
        </p>

        <button className={styles.button} onClick={onClose}>
          Понятно
        </button>
      </div>
    </div>
  );
}