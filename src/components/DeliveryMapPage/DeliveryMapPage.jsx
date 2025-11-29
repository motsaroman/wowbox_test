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

  const [location, setLocation] = useState({
    center: [37.57, 55.75],
    zoom: 10,
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
        console.warn("API недоступно, используем тестовые данные");
      }

      // --- FALLBACK (ТЕСТОВЫЕ ДАННЫЕ) ---
      if (!Array.isArray(data) || data.length === 0) {
        console.log("Применяем тестовые точки (Fallback)");
        data = [
          {
            id: "test-1",
            name: "Тестовый ПВЗ: Кремль",
            address: "Москва, Красная площадь, 1",
            coordinates: [37.62, 55.75],
            workSchedule: "Пн-Вс 09:00-21:00",
            price: 99,
          },
          {
            id: "test-2",
            name: "Тестовый ПВЗ: Арбат",
            address: "Москва, ул. Арбат, 10",
            coordinates: [37.595, 55.752],
            workSchedule: "24/7",
            price: 99,
          },
          {
            id: "test-3",
            name: "Тестовый ПВЗ: Парк Горького",
            address: "Москва, Крымский Вал, 9",
            coordinates: [37.605, 55.73],
            workSchedule: "10:00-22:00",
            price: 99,
          },
        ];
      }
      setPoints(data);

      if (data.length > 0) {
        setLocation({
          center: data[0].coordinates,
          zoom: 12,
        });
      }
    } catch (e) {
      console.error("Критическая ошибка:", e);
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
        price: selectedCity.price,
      },
      cityFias: selectedCity.fias,
    });
    onClose();
  };

  const features = useMemo(
    () =>
      points.map((pt) => ({
        type: "Feature",
        id: pt.id,
        geometry: { coordinates: pt.coordinates },
        properties: { ...pt },
      })),
    [points]
  );

  const renderMarker = useCallback(
    (feature) => (
      <YMapMarker key={feature.id} coordinates={feature.geometry.coordinates}>
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
      <YMapMarker key={`${coordinates.join("-")}`} coordinates={coordinates}>
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
              const city = cities.find((c) => c.fias === e.target.value);
              if (city) setSelectedCity(city);
            }}
          >
            {cities.map((c) => (
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
