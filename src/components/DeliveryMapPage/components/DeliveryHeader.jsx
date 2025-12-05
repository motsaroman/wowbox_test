import { useDeliveryStore } from '../../../store/deliveryStore';
import { cities } from '../../../data/cities';
import styles from '../DeliveryMapPage.module.css';
import closeIcon from '../../../assets/icons/close.svg';

export default function DeliveryHeader({ onClose }) {
  const { selectedCity, deliveryMode, setDeliveryMode, setSelectedCity } = useDeliveryStore();

  // Проверяем, есть ли текущий выбранный город в списке
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
        
        <select 
          className={styles.citySelect}
          // Используем fias, если есть, иначе name (для автоопределенных городов)
          value={selectedCity.fias || selectedCity.name || ""} 
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {cities.map((c, i) => (
            <option key={c.fias || i} value={c.fias || c.name}>
              {c.name}
            </option>
          ))}
          
          {/* Если город определен автоматически и его нет в списке — показываем его */}
          {!isCityInList && selectedCity.name && (
             <option key="custom" value={selectedCity.name}>
               {selectedCity.name}
             </option>
          )}
        </select>
      </div>

      <button className={styles.closeButton} onClick={onClose}>
        <img src={closeIcon} alt="Close" />
      </button>

    </div>
  );
}