import { useOrderStore } from "../../../store/orderStore";
import styles from "../OrderModal.module.css";
import rightArrow from "../../../assets/icons/right-arrow.svg";

export default function OrderSummary({ onOpenPrivacy, onOpenOffer, onSubmit }) {
  const {
    formData,
    setField,
    boxPrice,
    deliveryPrice,
    promoApplied,
    promoStatus,
    promoMessage,
    applyPromo,
    isProcessing,
    errors,
  } = useOrderStore();

  const promoDiscount = promoApplied ? 500 : 0;
  const totalPrice = boxPrice + deliveryPrice - promoDiscount;

  return (
    <div className={styles.rightColumnBottomContent}>
      <div className={styles.promoSection}>
        <div className={styles.promoInput}>
          <input
            type="text"
            value={formData.promoCode}
            onChange={(e) => setField("promoCode", e.target.value)}
            placeholder="Промокод"
            className={`${styles.input} ${
              promoStatus === "success"
                ? styles.inputSuccess
                : promoStatus === "error"
                ? styles.inputError
                : ""
            }`}
          />
          <button
            type="button"
            onClick={applyPromo}
            className={`${styles.promoButton} ${
              promoApplied ? styles.promoButtonDisabled : ""
            }`}
            disabled={promoApplied}
          >
            <img src={rightArrow} alt="Apply" />
          </button>
        </div>
        {promoMessage && (
          <div
            className={
              promoStatus === "success"
                ? styles.promoMessageSuccess
                : styles.promoMessageError
            }
          >
            {promoMessage}
          </div>
        )}
      </div>

      <div className={styles.priceDetails}>
        <h4 className={styles.priceTitle}>Детали цены</h4>
        <div className={styles.priceRow}>
          <span>Бокс</span>
          <span>{boxPrice}₽</span>
        </div>
        <div className={styles.priceRow}>
          <span>Доставка</span>
          <span>{deliveryPrice}₽</span>
        </div>
        {promoApplied && (
          <div className={`${styles.priceRow} ${styles.discount}`}>
            <span>Скидка</span>
            <span>-{promoDiscount}₽</span>
          </div>
        )}
        <div className={styles.priceLine}></div>
        <div className={`${styles.priceRow} ${styles.total}`}>
          <span>Итого</span>
          <span>{totalPrice}₽</span>
        </div>
      </div>

      <div className={styles.agreements}>
        <label className={styles.checkboxLabel2}>
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setField("acceptTerms", e.target.checked)}
          />
          <span className={styles.checkmark}></span>
          <span
            className={styles.agreementText}
            style={{ color: errors.terms ? "#ff3333" : "" }}
          >
            Согласен с{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenOffer();
              }}
              style={{ color: errors.terms ? "#ff3333" : "" }}
            >
              публичной оферты
            </a>{" "}
            и{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenPrivacy();
              }}
              style={{ color: errors.terms ? "#ff3333" : "" }}
            >
              конфиденциальности
            </a>
          </span>
        </label>
        <label className={styles.checkboxLabel2}>
          <input
            type="checkbox"
            checked={formData.receiveNews}
            onChange={(e) => setField("receiveNews", e.target.checked)}
          />
          <span className={styles.checkmark}></span>
          <span className={styles.agreementText}>
            Хочу получать новости и спецпредложения
          </span>
        </label>
      </div>

      <div className={styles.finalPrice}>{totalPrice}₽</div>

      <button
        type="submit"
        className={styles.submitButton}
        onClick={onSubmit}
        disabled={isProcessing}
        style={{ opacity: isProcessing ? 0.7 : 1 }}
      >
        {isProcessing ? "Обработка..." : "Оплатить"}
      </button>
    </div>
  );
}
