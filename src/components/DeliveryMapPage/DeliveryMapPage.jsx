import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  YMap, 
  YMapDefaultSchemeLayer, 
  YMapDefaultFeaturesLayer, 
  YMapMarker,
  YMapClusterer,
  clusterByGrid
} from "../../lib/ymaps"; 
import { cities } from "../../data/cities"; 
import markerIcon from "../../assets/images/5post-geo.png";
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

  // 1. Метод кластеризации (сетка 64px)
  // useMemo нужен, чтобы не пересоздавать объект при каждом рендере
  const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

  useEffect(() => {
    if (isOpen && selectedCity) {
      fetchPoints(selectedCity.fias);
    }
  }, [isOpen, selectedCity]);

  const fetchPoints = async (fias) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-points?fias=${fias}`);
      if (!res.ok) throw new Error('Ошибка сети');
      const data = await res.json();
      setPoints(data);

      if (data.length > 0) {
        // Центрируем карту на первой точке
        setLocation({ 
          center: data[0].coordinates, 
          zoom: 10 
        });
      }
    } catch (e) {
      console.error("Ошибка:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePointClick = (point) => {
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

  const features = useMemo(() => points.map((pt) => ({
    type: 'Feature',
    id: pt.id,
    geometry: { coordinates: pt.coordinates },
    properties: { ...pt }
  })), [points]);

  const renderMarker = useCallback(
    (feature) => (
      <YMapMarker 
        key={feature.id} 
        coordinates={feature.geometry.coordinates}
        source="my-source"
      >
        <img 
          src={markerIcon} 
          alt={feature.properties.name}
          className={styles.imageMarker}
          onClick={() => handlePointClick(feature.properties)}
        />
      </YMapMarker>
    ),
    [handlePointClick]
  );

  const renderCluster = useCallback(
    (coordinates, features) => (
      <YMapMarker 
        key={`${coordinates.join('-')}`} 
        coordinates={coordinates}
        source="my-source"
      >
        <div className={styles.cluster}>
          <div className={styles.clusterContent}>
            <span className={styles.clusterText}>{features.length}</span>
          </div>
        </div>
      </YMapMarker>
    ),
    []
  );

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
              
              <YMapClusterer
                marker={renderMarker}
                cluster={renderCluster}
                method={gridSizedMethod}
                features={features}
              />
           </YMap>
        </div>
      </div>
    </div>
  );
}