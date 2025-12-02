import { useOrderStore } from '../../../store/orderStore';
import styles from '../OrderModal.module.css';

export default function RecipientForm() {
  const { formData, errors, setField, setPhone } = useOrderStore();

  return (
    <section className={styles.section}>
      <div className={styles.checkboxRow}>
        <span className={styles.checkboxText}>Получатель другой человек</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={formData.isGift} onChange={(e) => setField('isGift', e.target.checked)} />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      {formData.isGift && (
        <>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Имя получателя<span className={styles.required}>*</span></label>
            <input type="text" value={formData.recipientName} onChange={(e) => setField('recipientName', e.target.value)} placeholder="Введите имя..." className={`${styles.input} ${errors.recipientName ? styles.inputError : ''}`} />
            {errors.recipientName && <div className={styles.errorMessage}>{errors.recipientName}</div>}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Телефон получателя<span className={styles.required}>*</span></label>
            <input type="tel" value={formData.recipientPhone} onChange={(e) => setPhone('recipientPhone', e.target.value)} placeholder="+7 (000) 000-00-00" className={`${styles.input} ${errors.recipientPhone ? styles.inputError : ''}`} />
            {errors.recipientPhone && <div className={styles.errorMessage}>{errors.recipientPhone}</div>}
          </div>
        </>
      )}
      
      <div className={styles.inputGroup}>
        <label className={styles.label}>Комментарий к заказу</label>
        <input type="text" value={formData.comment} onChange={(e) => setField('comment', e.target.value)} placeholder="Добавьте комментарий..." className={styles.input} />
      </div>
    </section>
  );
}