import { useState, useEffect, useMemo, useCallback } from "react";
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapClusterer,
  clusterByGrid,
  YMapListener,
} from "../../lib/ymaps";
import { cities } from "../../data/cities";
import markerIcon from "../../assets/images/5post-geo.png";
// import homeIcon from "../../assets/images/home-pin.png";
import styles from "./DeliveryMapPage.module.css";
import closeIcon from "../../assets/icons/close.svg";

export default function DeliveryMapPage({
  isOpen,
  onClose,
  onDeliverySelect,
  initialMode = "pickup",
}) {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState(initialMode);

  const [courierMarker, setCourierMarker] = useState(null);
  const [courierAddress, setCourierAddress] = useState("");

  const [matchedCity, setMatchedCity] = useState(null);
  const [addressError, setAddressError] = useState(""); // Текст ошибки

  const [location, setLocation] = useState({
    center: [37.57, 55.75],
    zoom: 10,
  });

  useEffect(() => {
    setDeliveryMode(initialMode);
  }, [initialMode]);

  const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

  useEffect(() => {
    if (isOpen && selectedCity && deliveryMode === "pickup") {
      fetchPoints(selectedCity.fias);
    }
  }, [isOpen, selectedCity, deliveryMode]);

  const fetchPoints = async (fias) => {
    // ... (код загрузки точек без изменений)
    setLoading(true);
    try {
      let data = [];
      try {
        if (fias) {
          const res = await fetch(`/api/get-points.php?fias=${fias}`);
          if (res.ok) data = await res.json();
        }
      } catch (err) {
        console.warn("API error");
      }

      if (!Array.isArray(data) || data.length === 0) {
        data = []; // Уберем fallback для чистоты, или оставьте тестовые данные
      }
      setPoints(data);
      if (data.length > 0) {
        setLocation({ center: data[0].coordinates, zoom: 12 });
      }
    } catch (e) {
      console.error(e);
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
        price: selectedCity.price, // Цена ПВЗ (обычно дешевле или фиксирована)
      },
      cityFias: selectedCity.fias,
    });
    onClose();
  };

  // --- ЛОГИКА ВАЛИДАЦИИ КУРЬЕРА ---

  const checkZoneAvailability = (nominatimAddress) => {
    // nominatimAddress - это объект { city, state, town, village ... }

    // 1. Собираем возможные названия места, куда кликнул пользователь
    const potentialNames = [
      nominatimAddress.city,
      nominatimAddress.town,
      nominatimAddress.village,
      nominatimAddress.state,
      nominatimAddress.city_district,
    ]
      .filter(Boolean)
      .map((n) => n.toLowerCase());


    const found = cities.find((c) => {
      const cityName = c.name.toLowerCase();
      return potentialNames.some(
        (addrPart) => addrPart.includes(cityName) || cityName.includes(addrPart)
      );
    });

    return found || null;
  };

  const handleMapClick = useCallback(
    async (object, event) => {
      if (deliveryMode !== "courier") return;

      const coords = event.coordinates; // [lng, lat]
      setCourierMarker({ coordinates: coords });
      setCourierAddress("Проверка адреса...");
      setAddressError("");
      setMatchedCity(null);

      try {
        // Запрашиваем детали адреса
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&accept-language=ru&addressdetails=1`
        );
        const data = await res.json();

        const fullAddress = data.display_name;
        const addressDetails = data.address; // Здесь лежат city, state и т.д.

        // --- ВАЛИДАЦИЯ ЗОНЫ ---
        const validCity = checkZoneAvailability(addressDetails);

        if (validCity) {
          setMatchedCity(validCity); // Сохраняем найденный город (с его ценой и FIAS)
          setCourierAddress(fullAddress);
        } else {
          setCourierAddress(fullAddress); // Адрес покажем, но...
          setAddressError("Доставка в этот населенный пункт недоступна");
        }
      } catch (e) {
        setCourierAddress("Ошибка определения адреса");
        console.error(e);
      }
    },
    [deliveryMode]
  );

  const handleCourierConfirm = () => {
    if (!courierMarker) return;

    if (addressError || !matchedCity) {
      alert("К сожалению, мы не доставляем заказы в эту зону.");
      return;
    }

    onDeliverySelect({
      mode: "courier",
      address: courierAddress,
      cityFias: matchedCity.fias,
      price: matchedCity.price,
      cityName: matchedCity.name,
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
          className={styles.imageMarker}
          onClick={() => handlePointClick(feature.properties)}
        />
      </YMapMarker>
    ),
    []
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
          <h3>Способ доставки</h3>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                deliveryMode === "pickup" ? styles.activeTab : ""
              }`}
              onClick={() => setDeliveryMode("pickup")}
            >
              Пункт выдачи
            </button>
            <button
              className={`${styles.tab} ${
                deliveryMode === "courier" ? styles.activeTab : ""
              }`}
              onClick={() => setDeliveryMode("courier")}
            >
              Курьером
            </button>
          </div>
          {deliveryMode === "pickup" && (
            <select
              className={styles.citySelect}
              value={selectedCity.fias || ""}
              onChange={(e) => {
                const city = cities.find((c) => c.fias === e.target.value);
                if (city) setSelectedCity(city);
              }}
            >
              {cities.map((c, i) => (
                <option key={c.fias || i} value={c.fias || ""}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.mapContainer}>
          {loading && <div className={styles.loader}>Загрузка...</div>}

          <YMap location={location} mode="vector">
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />
            <YMapListener onClick={handleMapClick} />

            {deliveryMode === "pickup" && (
              <YMapClusterer
                marker={renderMarker}
                cluster={renderCluster}
                method={gridSizedMethod}
                features={features}
              />
            )}

            {deliveryMode === "courier" && courierMarker && (
              <YMapMarker coordinates={courierMarker.coordinates}>
                <div className={styles.courierPin}>🏠</div>
              </YMapMarker>
            )}
          </YMap>

          {/* Панель курьера */}
          {deliveryMode === "courier" && (
            <div className={styles.courierPanel}>
              {/* Показываем адрес или ошибку */}
              <div
                className={styles.courierAddress}
                style={{ color: addressError ? "red" : "#333" }}
              >
                {addressError
                  ? addressError
                  : courierAddress || "Нажмите на карту, чтобы выбрать адрес"}
              </div>

              {/* Показываем цену, если зона валидна */}
              {matchedCity && !addressError && (
                <div className={styles.courierPrice}>
                  Стоимость доставки: <b>{matchedCity.price}₽</b>
                </div>
              )}

              <button
                className={styles.confirmBtn}
                onClick={handleCourierConfirm}
                disabled={!courierMarker || !!addressError}
                style={{ opacity: !courierMarker || !!addressError ? 0.5 : 1 }}
              >
                Подтвердить адрес
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
