import { useState, useEffect, useMemo, useCallback } from "react";
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapClusterer,
  clusterByGrid,
} from "../../lib/ymaps";
import { cities } from "../../data/cities";
import markerIcon from "../../assets/images/5post-geo.png";
import styles from "./DeliveryMapPage.module.css";
import closeIcon from "../../assets/icons/close.svg";

export default function DeliveryMapPage({ isOpen, onClose, onDeliverySelect }) {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const [hoveredPointId, setHoveredPointId] = useState(null);
  
  const [location, setLocation] = useState({ 
    center: [37.57, 55.75], 
    zoom: 10 
  });

  const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

  useEffect(() => {
    if (isOpen && selectedCity) {
      fetchPoints(selectedCity.fias);
    }
  }, [isOpen, selectedCity]);

  const fetchPoints = async (fias) => {
    setLoading(true);
    try {
      let data = [];
      try {
        const res = await fetch(`/api/get-points?fias=${fias}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn("API недоступно");
      }

      if (!Array.isArray(data) || data.length === 0) {
        data = [
          {
            id: "test-1",
            name: "Пятерочка",
            address: "Москва, Красная площадь, 1",
            coordinates: [37.6200, 55.7500],
            workSchedule: "09:00-21:00",
            description: "Вход со двора, код 123",
            price: 99
          },
        ];
      }

      setPoints(data);

      if (data.length > 0) {
        setLocation({ 
          center: data[0].coordinates, 
          zoom: 12 
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
    (feature) => {
      const isHovered = hoveredPointId === feature.id;
      const pt = feature.properties;

      return (
        <YMapMarker 
          key={feature.id} 
          coordinates={feature.geometry.coordinates}
          zIndex={isHovered ? 2000 : 100} 
        >
          <div 
            className={styles.markerWrapper}
            onMouseEnter={() => setHoveredPointId(feature.id)}
            onMouseLeave={() => setHoveredPointId(null)}
          >
            <img 
              src={markerIcon} 
              alt={pt.name}
              className={styles.imageMarker}
              onClick={() => handlePointClick(pt)}
            />

            {isHovered && (
              <div className={styles.tooltip}>
                <div className={styles.tooltipTitle}>{pt.name}</div>
                <div className={styles.tooltipAddress}>{pt.address}</div>
                {pt.description && (
                  <div className={styles.tooltipDesc}>{pt.description}</div>
                )}
                {pt.workSchedule && (
                  <div className={styles.tooltipSchedule}>🕒 {pt.workSchedule}</div>
                )}
                <div className={styles.tooltipArrow}></div>
              </div>
            )}
          </div>
        </YMapMarker>
      );
    },
    [hoveredPointId]
  );

  const renderCluster = useCallback(
    (coordinates, features) => (
      <YMapMarker 
        key={`${coordinates.join('-')}`} 
        coordinates={coordinates}
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