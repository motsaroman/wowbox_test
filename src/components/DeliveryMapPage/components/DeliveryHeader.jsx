import { useDeliveryStore } from '../../../store/deliveryStore';
import { cities } from '../../../data/cities';
import styles from '../DeliveryMapPage.module.css';
import closeIcon from '../../../assets/icons/close.svg';

export default function DeliveryHeader({ onClose }) {
  const { 
    selectedCity, 
    deliveryMode, 
    setDeliveryMode, 
    setSelectedCity 
  } = useDeliveryStore();

  return (
    <>
      <button className={styles.closeButton} onClick={onClose}>
        <img src={closeIcon} alt="Close" />
      </button>

      <div className={styles.header}>
        <h3>Способ доставки</h3>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${deliveryMode === 'pickup' ? styles.activeTab : ''}`}
            onClick={() => setDeliveryMode('pickup')}
          >
            Пункт выдачи
          </button>
          <button 
            className={`${styles.tab} ${deliveryMode === 'courier' ? styles.activeTab : ''}`}
            onClick={() => setDeliveryMode('courier')}
          >
            Курьером
          </button>
        </div>
        
        <select 
          className={styles.citySelect}
          value={selectedCity.fias || ""}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {cities.map((c, i) => (
            <option key={c.fias || i} value={c.fias || ""}>{c.name}</option>
          ))}
        </select>
      </div>
    </>
  );
}