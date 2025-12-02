import { useOrderStore } from '../../../store/orderStore';
import styles from '../OrderModal.module.css';
import spbBankLogo from "../../../assets/images/spb-bank-logo.png";
import sberPayLogo from "../../../assets/images/sber-pay-bank-logo.png";
import tBankLogo from "../../../assets/images/t-bank-logo.png";
import bankCardIcon from "../../../assets/icons/bank-card.svg";

export default function PaymentSection() {
  const { formData, setField } = useOrderStore();

  const handlePaymentChange = (val) => setField('paymentMethod', val);

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Оплата</h3>
      <div className={styles.paymentOptions}>
        {/* Можно вынести отдельную кнопку PaymentOption, но пока так */}
        <label className={`${styles.paymentOption} ${formData.paymentMethod === "sbp" ? styles.active : ""}`}>
          <input type="radio" checked={formData.paymentMethod === "sbp"} onChange={() => handlePaymentChange("sbp")} />
          <div className={styles.paymentContent}><img src={spbBankLogo} alt="СБП" className={styles.paymentLogo} /><span>СБП</span></div>
        </label>
        <label className={`${styles.paymentOption} ${formData.paymentMethod === "sberpay" ? styles.active : ""}`}>
          <input type="radio" checked={formData.paymentMethod === "sberpay"} onChange={() => handlePaymentChange("sberpay")} />
          <div className={styles.paymentContent}><img src={sberPayLogo} alt="SberPay" className={styles.paymentLogo} /><span>SberPay</span></div>
        </label>
        <label className={`${styles.paymentOption} ${formData.paymentMethod === "tpay" ? styles.active : ""}`}>
          <input type="radio" checked={formData.paymentMethod === "tpay"} onChange={() => handlePaymentChange("tpay")} />
          <div className={styles.paymentContent}><img src={tBankLogo} alt="T-Pay" className={styles.paymentLogo} /><span>T-Pay</span></div>
        </label>
        <label className={`${styles.paymentOption} ${formData.paymentMethod === "card" ? styles.active : ""}`}>
          <input type="radio" checked={formData.paymentMethod === "card"} onChange={() => handlePaymentChange("card")} />
          <div className={styles.paymentContent}><img src={bankCardIcon} alt="Карта" className={styles.paymentIcon} /><span>Банковская карта</span></div>
        </label>
      </div>
      <p className={styles.paymentNote}>Перенаправим вас на страницу СБП, где вы сможете выбрать банк для оплаты. Это безопасно и надежно.</p>
    </section>
  );
}