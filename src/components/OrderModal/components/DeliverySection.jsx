import { useOrderStore } from '../../../store/orderStore';
import styles from '../OrderModal.module.css';
import fivePostLogo from "../../../assets/images/5post-logo.png";
import truckIcon from "../../../assets/icons/truck.svg";
import rightArrow from "../../../assets/icons/right-arrow.svg";

export default function DeliverySection({ onOpenMap }) {
  const { formData, errors, setField } = useOrderStore();

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Доставка</h3>

      <div className={styles.deliveryOptions}>
        <label className={`${styles.deliveryOption} ${formData.deliveryType === "5post" ? styles.active : ""}`}>
          <input type="radio" name="deliveryType" value="5post" checked={formData.deliveryType === "5post"} onChange={(e) => setField('deliveryType', e.target.value)} />
          <div className={styles.deliveryContent}>
            <img src={fivePostLogo} alt="5post" className={styles.deliveryLogo} loading="lazy" />
            <span>ПВЗ 5POST</span>
          </div>
        </label>

        <label className={`${styles.deliveryOption} ${formData.deliveryType === "courier" ? styles.active : ""}`}>
          <input type="radio" name="deliveryType" value="courier" checked={formData.deliveryType === "courier"} onChange={(e) => setField('deliveryType', e.target.value)} />
          <div className={styles.deliveryContent}>
            <img src={truckIcon} alt="Курьер" className={styles.deliveryIcon} loading="lazy" />
            <span>Курьером до адреса</span>
          </div>
        </label>
      </div>

      {errors.delivery && <div style={{ color: '#ff4444', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>⚠️ {errors.delivery}</div>}

      {/*<div className={styles.inputGroup}>
        <label className={styles.label}>Город<span className={styles.required}>*</span></label>
        <input type="text" value={formData.city} readOnly className={styles.input} style={{opacity: 0.7, cursor: 'not-allowed'}} />
      </div>*/}

      {formData.deliveryType === "5post" ? (
        <div className={styles.inputGroup}>
          <p className={styles.label}>Пункт выдачи<span className={styles.required}>*</span></p>
          <div className={`${styles.select} ${errors.delivery ? styles.inputError : ''}`} onClick={onOpenMap}>
            <p style={{ cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {formData.deliveryPoint || "Выберите пункт выдачи..."}
            </p>
            <img src={rightArrow} alt="" />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Адрес доставки<span className={styles.required}>*</span></label>
            <div className={`${styles.input} ${errors.delivery ? styles.inputError : ''}`} onClick={onOpenMap} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'}}>
              <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: '10px'}}>
                  {formData.deliveryAddress || "Нажмите, чтобы выбрать адрес..."}
              </div>
              <img src={rightArrow} alt="" />
            </div>
          </div>
          <div className={styles.addressGrid}>
            <div className={styles.inputGroup}><input type="text" value={formData.apartment} onChange={(e) => setField('apartment', e.target.value)} placeholder="Квартира" className={styles.input} /></div>
            <div className={styles.inputGroup}><input type="text" value={formData.entrance} onChange={(e) => setField('entrance', e.target.value)} placeholder="Подъезд" className={styles.input} /></div>
            <div className={styles.inputGroup}><input type="text" value={formData.floor} onChange={(e) => setField('floor', e.target.value)} placeholder="Этаж" className={styles.input} /></div>
          </div>
          <div className={styles.inputGroup}><input type="text" value={formData.courierComment} onChange={(e) => setField('courierComment', e.target.value)} placeholder="Комментарий для курьера" className={styles.input} /></div>
        </>
      )}

      <p className={styles.deliveryNote}>ПРИ ПОВТОРНОМ ЗАКАЗЕ СЕГОДНЯ ДО 23:59 НА ТОТ ЖЕ АДРЕС — ДОСТАВКА БЕСПЛАТНАЯ!</p>
    </section>
  );
}