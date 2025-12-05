import { useDeliveryStore } from '../../../store/deliveryStore';
// import locationIcon from '../../../assets/icons/geolocation.svg'; // ВРЕМЕННО: не используется
import styles from '../DeliveryMapPage.module.css';

export default function CourierPanel({ onConfirm, isOpen, onClose }) {
  const { 
    courierAddress, setCourierAddress,
    courierForm, setCourierField,
    addressError,
    searchAddressAction,
    // detectLocationAction, // ВРЕМЕННО: Отключено
    isCalculating,
    courierMarker
  } = useDeliveryStore();

  const handleConfirmClick = async () => {
    const result = await useDeliveryStore.getState().calculateAndConfirm();
    if (result) {
        onConfirm({
            mode: "courier",
            ...result,
            ...courierForm
        });
    }
  };

  return (
    <div className={`${styles.courierPanel} ${isOpen ? styles.mobileOpen : ''}`}>
      
      <div className={styles.mobileHeader}>
         <button className={styles.mobileBackBtn} onClick={onClose}>
            Назад к карте
         </button>
         <h3>Адрес доставки</h3>
      </div>

      <div className={styles.searchRow}>
          <input 
            type="text" 
            className={styles.addressInput} 
            placeholder="Введите адрес" 
            value={courierAddress} 
            onChange={(e) => setCourierAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddressAction()}
          />
          
          {/* ВРЕМЕННО: Кнопка геолокации скрыта */}
          {/* <button 
            type="button"
            className={styles.geoBtn} 
            onClick={detectLocationAction}
            title="Мое местоположение"
          >
             <img src={locationIcon} alt="Geo" />
          </button> */}

          <button className={styles.searchBtn} onClick={searchAddressAction}>
            Найти
          </button>
      </div>
      
      {addressError && (
        <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
          {addressError}
        </div>
      )}
      
      <div className={styles.inputGrid}>
        <input 
          type="text" 
          placeholder="Кв/Оф" 
          className={styles.miniInput} 
          value={courierForm.apartment} 
          onChange={(e) => setCourierField('apartment', e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Подъезд" 
          className={styles.miniInput} 
          value={courierForm.entrance} 
          onChange={(e) => setCourierField('entrance', e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Этаж" 
          className={styles.miniInput} 
          value={courierForm.floor} 
          onChange={(e) => setCourierField('floor', e.target.value)} 
        />
      </div>
      
      <input 
        type="text" 
        placeholder="Комментарий курьеру" 
        className={styles.fullInput} 
        value={courierForm.comment} 
        onChange={(e) => setCourierField('comment', e.target.value)} 
      />

      <button 
        className={styles.confirmBtn} 
        onClick={handleConfirmClick} 
        disabled={!!addressError || isCalculating || (!courierMarker && !courierAddress)}
        style={{ opacity: (!!addressError || isCalculating) ? 0.7 : 1 }}
      >
        {isCalculating ? "Расчет стоимости..." : "Подтвердить и Сохранить"}
      </button>
      
      <p className={styles.diclaimer}>
        Нажимая "Сохранить", я соглашаюсь с <a href="/public-offer">условиями</a>
      </p>
    </div>
  );
}