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
  currentData = {},
}) {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState(initialMode);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- СОСТОЯНИЕ ФОРМЫ КУРЬЕРА ---
  const [courierMarker, setCourierMarker] = useState(null);
  const [courierAddress, setCourierAddress] = useState(
    currentData.address || ""
  );

  // Инициализация полей ввода
  const [apartment, setApartment] = useState(currentData.apartment || "");
  const [entrance, setEntrance] = useState(currentData.entrance || "");
  const [floor, setFloor] = useState(currentData.floor || "");
  const [comment, setComment] = useState(currentData.comment || "");

  const [matchedCity, setMatchedCity] = useState(null);
  const [addressError, setAddressError] = useState("");

  // Состояние тултипа
  const [hoveredPointId, setHoveredPointId] = useState(null);

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
    setLoading(true);
    try {
      let data = [];
      try {
        if (fias) {
          const res = await fetch(
            `https://wowbox.market/api/get-points.php?fias=${fias}`
          );
          if (res.ok) data = await res.json();
        }
      } catch (err) {
        console.warn("API error");
      }
      setPoints(Array.isArray(data) ? data : []);
      if (data.length > 0)
        setLocation({ center: data[0].coordinates, zoom: 12 });
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
        price: selectedCity.price,
      },
      cityFias: selectedCity.fias,
    });
    onClose();
  };

  const checkZoneAvailability = (nominatimAddress) => {
    const potentialNames = [
      nominatimAddress.city,
      nominatimAddress.town,
      nominatimAddress.village,
      nominatimAddress.state,
      nominatimAddress.city_district,
    ]
      .filter(Boolean)
      .map((n) => n.toLowerCase());

    return cities.find((c) => {
      const cityName = c.name.toLowerCase();
      return potentialNames.some(
        (addrPart) => addrPart.includes(cityName) || cityName.includes(addrPart)
      );
    });
  };

  // --- РУЧНОЙ ПОИСК АДРЕСА ---
  const handleManualSearch = async () => {
    if (!courierAddress || courierAddress.length < 3) return;

    setLoading(true);
    setAddressError("");

    try {
      // Поиск координат по тексту (Forward Geocoding)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          courierAddress
        )}&accept-language=ru&addressdetails=1&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coords = [parseFloat(result.lon), parseFloat(result.lat)]; // [lng, lat] для YMap v3

        // Обновляем маркер и карту
        setCourierMarker({ coordinates: coords });
        setLocation({ center: coords, zoom: 16 }); // Приближаем карту

        // Валидируем зону
        const validCity = checkZoneAvailability(result.address);
        if (validCity) {
          setMatchedCity(validCity);
          // Обновляем адрес на полный официальный, если нужно, или оставляем то что ввел юзер
          // setCourierAddress(result.display_name);
        } else {
          setAddressError("Доставка в этот населенный пункт недоступна");
        }
      } else {
        setAddressError("Адрес не найден");
      }
    } catch (e) {
      console.error(e);
      setAddressError("Ошибка поиска");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = useCallback(
    async (object, event) => {
      if (deliveryMode !== "courier") return;
      const coords = event.coordinates;
      setCourierMarker({ coordinates: coords });
      // setCourierAddress("Определяем адрес..."); // Можно не сбрасывать, если хотите оставить введенное
      setAddressError("");
      setMatchedCity(null);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&accept-language=ru&addressdetails=1`
        );
        const data = await res.json();
        const validCity = checkZoneAvailability(data.address);

        if (validCity) {
          setMatchedCity(validCity);
          setCourierAddress(data.display_name);
        } else {
          setCourierAddress(data.display_name);
          setAddressError("Доставка в этот населенный пункт недоступна");
        }
      } catch (e) {
        setCourierAddress("Ошибка");
      }
    },
    [deliveryMode]
  );

  const handleCourierConfirm = async () => {
    // 1. Проверки
    if (!courierMarker && !currentData.address && !courierAddress) {
      alert("Пожалуйста, введите адрес или выберите точку на карте.");
      return;
    }

    if (addressError) {
      alert("К сожалению, мы не доставляем заказы в эту зону.");
      return;
    }

    setIsCalculating(true); // Включаем спиннер на кнопке

    try {
      const res = await fetch(
        `https://wowbox.market/api/get-delivery-price.php?address=${encodeURIComponent(
          courierAddress
        )}`
      );
      const data = await res.json();

      let finalPrice = 0;

      if (data.price && data.price > 0) {
        finalPrice = data.price;
      } else {
        console.warn("API не вернуло цену:", data.error);
        finalPrice = (matchedCity?.price || 350) + 180;
      }

      onDeliverySelect({
        mode: "courier",
        address: courierAddress,
        apartment: apartment,
        entrance: entrance,
        floor: floor,
        comment: comment,

        cityFias: matchedCity?.fias || selectedCity.fias,
        price: finalPrice,
        cityName: matchedCity?.name || selectedCity.name,
      });

      onClose();
    } catch (e) {
      console.error("Ошибка расчета цены:", e);
      alert(
        "Не удалось рассчитать точную стоимость доставки. Попробуйте еще раз."
      );
    } finally {
      setIsCalculating(false);
    }
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
                  <div className={styles.tooltipSchedule}>
                    🕒 {pt.workSchedule}
                  </div>
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
                <div
                  style={{
                    fontSize: "30px",
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  🏠
                </div>
              </YMapMarker>
            )}
          </YMap>

          {deliveryMode === "courier" && (
            <div className={styles.courierPanel}>
              {/* Поле поиска адреса */}
              <div className={styles.searchRow}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Введите город и адрес..."
                  value={courierAddress}
                  onChange={(e) => setCourierAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                />
                <button
                  className={styles.searchBtn}
                  onClick={handleManualSearch}
                >
                  Найти
                </button>
              </div>

              {addressError && (
                <div
                  style={{
                    color: "red",
                    marginBottom: "10px",
                    fontSize: "14px",
                  }}
                >
                  {addressError}
                </div>
              )}

              <div className={styles.inputGrid}>
                <input
                  type="text"
                  placeholder="Кв/Оф"
                  className={styles.miniInput}
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Подъезд"
                  className={styles.miniInput}
                  value={entrance}
                  onChange={(e) => setEntrance(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Этаж"
                  className={styles.miniInput}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Комментарий курьеру"
                className={styles.fullInput}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              {matchedCity && !addressError && (
                <div className={styles.courierPrice}>
                  Доставка: <b>{matchedCity.price + 180}₽</b>
                </div>
              )}

              <button
                className={styles.confirmBtn}
                onClick={handleCourierConfirm}
                disabled={isCalculating || !!addressError}
                style={{ opacity: isCalculating || !!addressError ? 0.7 : 1 }}
              >
                {isCalculating
                  ? "Расчет стоимости..."
                  : "Подтвердить и Сохранить"}
              </button>
              <p className={styles.diclaimer}>
                Нажимая "Сохранить", я соглашаюсь с{" "}
                <a href="/public-offer">условиями</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
