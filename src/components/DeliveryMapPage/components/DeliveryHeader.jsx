import { useDeliveryStore } from '../../../store/deliveryStore';
import { cities } from '../../../data/cities';
import styles from '../DeliveryMapPage.module.css';
import closeIcon from '../../../assets/icons/close.svg';

export default function DeliveryHeader({ onClose, onOpenMobilePanel, error }) {
  const { selectedCity, deliveryMode, setDeliveryMode, setSelectedCity } = useDeliveryStore();

  const isCityInList = cities.some(c => c.fias === selectedCity.fias);

  return (
    <div className={styles.wrapper}>
      
      <div className={styles.controls}>
        <h3 className={styles.title}>Способ доставки</h3>
        
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
        
        {/* Обертка для города и ошибки */}
        <div className={styles.cityWrapper}>
            <div className={styles.cityRow}>
                <select 
                  className={styles.citySelect}
                  value={selectedCity.fias || selectedCity.name || ""} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {cities.map((c, i) => (
                    <option key={c.fias || i} value={c.fias || c.name}>
                      {c.name}
                    </option>
                  ))}
                  
                  {!isCityInList && selectedCity.name && (
                     <option key="custom" value={selectedCity.name}>
                       {selectedCity.name}
                     </option>
                  )}
                </select>
            </div>
            
            {/* Сообщение об ошибке */}
            {error && <div className={styles.headerError} style={{fontSize: "14px", color: 'red', fontFamily: '"SF Pro", sans-serif'}}>{error}</div>}
        </div>
      </div>

      <button className={styles.closeButton} onClick={onClose}>
        <img src={closeIcon} alt="Close" />
      </button>

    </div>
  );
}