import { useState, useEffect } from "react";
import { 
  YMap, 
  YMapDefaultSchemeLayer, 
  YMapDefaultFeaturesLayer, 
  YMapMarker 
} from "../../lib/ymaps"; 
import { cities } from "../../data/cities"; 
import styles from "./DeliveryMapPage.module.css";
import closeIcon from "../../assets/icons/close.svg";

export default function DeliveryMapPage({ isOpen, onClose, onDeliverySelect }) {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [location, setLocation] = useState({ 
    center: [37.57, 55.75], 
    zoom: 10 
  });

  useEffect(() => {
    if (isOpen && selectedCity) {
      console.log(`[Front] Выбран город: ${selectedCity.name} (${selectedCity.fias})`); // ЛОГ 1
      fetchPoints(selectedCity.fias);
    }
  }, [isOpen, selectedCity]);

  const fetchPoints = async (fias) => {
    setLoading(true);
    console.log(`[Front] Начинаем загрузку точек...`); // ЛОГ 2

    try {
      const res = await fetch(`/api/get-points?fias=${fias}`);
      console.log(`[Front] Статус ответа: ${res.status}`); // ЛОГ 3

      if (!res.ok) throw new Error('Ошибка сети');
      
      const data = await res.json();
      console.log(`[Front] Получено данных:`, data); // ЛОГ 4 (Тут смотрите массив!)

      setPoints(data);

      if (data.length > 0) {
        const firstPoint = data[0].coordinates; 
        console.log(`[Front] Центрируем карту на:`, firstPoint); // ЛОГ 5
        
        setLocation({ 
          center: firstPoint, // Они уже перевернуты на бэкенде в [lng, lat]
          zoom: 12 
        });
      }
    } catch (e) {
      console.error("[Front] Ошибка:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePointClick = (point) => {
    console.log(`[Front] Выбрана точка:`, point); // ЛОГ 6
    onDeliverySelect({
      mode: "pickup",
      point: {
        id: point.id,
        name: point.name,
        address: point.address,
        price: selectedCity.price
      },
      cityFias: selectedCity.fias
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>

        <div className={styles.header}>
          <h3>Выберите пункт выдачи</h3>
          <select 
            className={styles.citySelect}
            value={selectedCity.fias}
            onChange={(e) => {
                const city = cities.find(c => c.fias === e.target.value);
                if (city) setSelectedCity(city);
            }}
          >
            {cities.map(c => (
              <option key={c.fias} value={c.fias}>
                {c.name} — {c.price}₽
              </option>
            ))}
          </select>
        </div>

        <div className={styles.mapContainer}>
           {loading && <div className={styles.loader}>Загрузка...</div>}
           
           <YMap location={location} mode="vector">
              <YMapDefaultSchemeLayer />
              <YMapDefaultFeaturesLayer />
              
              {/* Проверяем, рендерится ли цикл */}
              {points.map((pt, index) => {
                 // ЛОГ 7 (выведет первые 3 точки, чтобы не спамить)
                 if (index < 3) console.log(`[Front] Рендер маркера #${index}:`, pt.coordinates);
                 
                 return (
                    <YMapMarker 
                      key={pt.id} 
                      coordinates={pt.coordinates} 
                    >
                      <div 
                        className={styles.marker}
                        onClick={() => handlePointClick(pt)}
                        title={pt.name}
                      >
                        <div className={styles.markerDot}></div>
                      </div>
                    </YMapMarker>
                 );
              })}
           </YMap>
        </div>
      </div>
    </div>
  );
}