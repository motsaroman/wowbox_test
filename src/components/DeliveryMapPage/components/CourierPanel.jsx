import { useState, useEffect, useRef } from "react";
import { useDeliveryStore } from "../../../store/deliveryStore";

// import locationIcon from '../../../assets/icons/geolocation.svg';
import styles from "../DeliveryMapPage.module.css";

export default function CourierPanel({ onConfirm, isOpen, onClose }) {
  const { 
    courierAddress, setCourierAddress,
    courierForm, setCourierField,
    addressError,
    searchAddressAction,
    // detectLocationAction, 
    isCalculating,
    isLoading,
    
    // Новые функции из стора
    addressSuggestions,
    fetchSuggestions,
    selectSuggestion,
    clearSuggestions
  } = useDeliveryStore();

  const [inputValue, setInputValue] = useState(courierAddress);
  const suggestionTimeout = useRef(null);

  // Синхронизация локального инпута с глобальным состоянием
  useEffect(() => {
    setInputValue(courierAddress);
  }, [courierAddress]);

  // Обработчик ввода с задержкой (Debounce 500ms)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setCourierAddress(val); // Обновляем в сторе

    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);

    suggestionTimeout.current = setTimeout(() => {
        if (val.length >= 3) {
            fetchSuggestions(val);
        } else {
            clearSuggestions();
        }
    }, 500); 
  };

  const handleSuggestionClick = (item) => {
      selectSuggestion(item);
  };

  const handleConfirmClick = async () => {
    // Скрываем подсказки при клике на подтверждение
    clearSuggestions();
    
    await searchAddressAction();
    const currentError = useDeliveryStore.getState().addressError;
    if (currentError) return;

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
            ✕ Назад к карте
         </button>
         <h3>Адрес доставки</h3>
      </div>

      <div className={styles.searchRow} style={{position: 'relative'}}> {/* relative для позиционирования списка */}
          <input 
            type="text" 
            className={styles.addressInput} 
            placeholder="Введите адрес (Город, улица...)" 
            value={inputValue} 
            onChange={handleInputChange}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    clearSuggestions();
                    searchAddressAction();
                }
            }}
            // При потере фокуса скрываем список с небольшой задержкой (чтобы успел пройти клик)
            onBlur={() => setTimeout(clearSuggestions, 200)}
          />
          
          <button 
            type="button" 
            className={styles.searchBtn} 
            onClick={searchAddressAction}
          >
            Найти
          </button>

          {/* ВЫПАДАЮЩИЙ СПИСОК ПОДСКАЗОК */}
          {addressSuggestions.length > 0 && (
              <ul className={styles.suggestionsList}>
                  {addressSuggestions.map((item, index) => (
                      <li 
                        key={item.place_id || index} 
                        className={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(item)}
                      >
                          {item.display_name}
                      </li>
                  ))}
              </ul>
          )}
      </div>
      
      {addressError && (
        <div style={{ color: '#ff3b30', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
          {addressError}
        </div>
      )}
      
      {/* Остальные поля формы */}
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
        type="button"
        className={styles.confirmBtn} 
        onClick={handleConfirmClick} 
        disabled={isCalculating || isLoading || !courierAddress}
        style={{ opacity: (isCalculating || isLoading || !courierAddress) ? 0.7 : 1 }}
      >
        {isCalculating || isLoading ? "Проверка..." : "Подтвердить и Сохранить"}
      </button>
      
      <p className={styles.diclaimer}>
        Нажимая "Сохранить", я соглашаюсь с <a href="/public-offer">условиями</a>
      </p>
    </div>
  );
}