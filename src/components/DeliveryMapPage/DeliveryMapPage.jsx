import { useState, useEffect, useMemo, useCallback } from "react";
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapClusterer,
  clusterByGrid,
  YMapListener,
  YMapFeature,
} from "../../lib/ymaps";
import { cities } from "../../data/cities";
import markerIcon from "../../assets/images/5post-geo.png";
// import homeIcon from "../../assets/images/home-pin.png"; // Раскомментируйте, если есть иконка
import styles from "./DeliveryMapPage.module.css";
import closeIcon from "../../assets/icons/close.svg";

// --- ФУНКЦИЯ: Проверка попадания точки в полигон (Ray-casting) ---
function isPointInPolygon(point, vs) {
  // point = [lng, lat], vs = массив координат полигона [[lng, lat], ...]
  const x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function DeliveryMapPage({
  isOpen,
  onClose,
  onDeliverySelect,
  initialMode = "pickup",
  currentData = {},
}) {
  // Выбор города (по умолчанию первый из списка - Москва)
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  // Данные карты
  const [points, setPoints] = useState([]); // Точки ПВЗ (5Post)
  const [polygons, setPolygons] = useState(null); // Полигоны (Dalli)

  // Состояния интерфейса
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false); // Загрузка цены
  const [deliveryMode, setDeliveryMode] = useState(initialMode);

  // Данные курьера
  const [courierMarker, setCourierMarker] = useState(null);
  const [courierAddress, setCourierAddress] = useState(
    currentData.address || ""
  );
  const [addressError, setAddressError] = useState("");

  // Поля ввода (квартира, этаж...)
  const [apartment, setApartment] = useState(currentData.apartment || "");
  const [entrance, setEntrance] = useState(currentData.entrance || "");
  const [floor, setFloor] = useState(currentData.floor || "");
  const [comment, setComment] = useState(currentData.comment || "");

  // Тултип для ПВЗ
  const [hoveredPointId, setHoveredPointId] = useState(null);

  // Позиция карты (Москва)
  const [location, setLocation] = useState({
    center: [37.6176, 55.7558],
    zoom: 10,
  });

  // Синхронизация режима при открытии
  useEffect(() => {
    setDeliveryMode(initialMode);
  }, [initialMode]);

  const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

  // --- ГЛАВНЫЙ ЭФФЕКТ: ЗАГРУЗКА ДАННЫХ ---
  useEffect(() => {
    if (!isOpen || !selectedCity) return;

    setAddressError("");

    // 1. Режим ПВЗ -> Грузим точки 5Post
    if (deliveryMode === "pickup") {
      fetchPoints(selectedCity.fias);
      setPolygons(null); // Чистим полигоны
    }

    // 2. Режим КУРЬЕР -> Грузим полигоны Dalli
    if (deliveryMode === "courier") {
      setPoints([]); // Чистим точки

      if (selectedCity.filialId) {
        fetchPolygons(selectedCity.filialId);
      } else {
        setPolygons(null);
        console.warn("Для этого города нет курьерской доставки (нет filialId)");
      }
    }
  }, [isOpen, selectedCity, deliveryMode]);

  // --- ЗАГРУЗКА ТОЧЕК 5POST ---
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
        setLocation({ center: data[0].coordinates, zoom: 11 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- ЗАГРУЗКА ПОЛИГОНОВ DALLI ---
  const fetchPolygons = async (filialId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://wowbox.market/api/get-polygons.php?filial_id=${filialId}`
      );
      if (res.ok) {
        const geoJson = await res.json();
        setPolygons(geoJson);

        // Центрируем карту по первому полигону
        if (geoJson.features && geoJson.features.length > 0) {
          const firstPolygon = geoJson.features[0].geometry.coordinates[0];
          if (firstPolygon && firstPolygon.length > 0) {
            setLocation({ center: firstPolygon[0], zoom: 10 });
          }
        }
      }
    } catch (e) {
      console.error("Ошибка загрузки полигонов:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- ПРОВЕРКА ЗОНЫ ---
  const checkDeliveryZone = (coords) => {
    if (!polygons || !polygons.features) return false;
    for (const feature of polygons.features) {
      if (feature.geometry.type === "Polygon") {
        const polygonCoords = feature.geometry.coordinates[0];
        if (isPointInPolygon(coords, polygonCoords)) return true;
      }
    }
    return false;
  };

  // --- РУЧНОЙ ПОИСК АДРЕСА ---
  const handleManualSearch = async () => {
    if (!courierAddress || courierAddress.length < 3) return;

    setLoading(true);
    setAddressError("");
    setCourierMarker(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          courierAddress
        )}&accept-language=ru&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coords = [parseFloat(result.lon), parseFloat(result.lat)]; // [lng, lat]

        // Проверяем зону
        const isInside = checkDeliveryZone(coords);

        if (isInside) {
          setCourierMarker({ coordinates: coords });
          setLocation({ center: coords, zoom: 16 });
          // Можно обновить адрес на официальный из базы, если нужно:
          // setCourierAddress(result.display_name);
        } else {
          setAddressError("Адрес вне зоны доставки. Выберите другой адрес.");
          // Всё равно покажем на карте, где это, чтобы юзер понял
          setLocation({ center: coords, zoom: 14 });
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

  // --- КЛИК ПО КАРТЕ ---
  const handleMapClick = useCallback(
    async (object, event) => {
      if (deliveryMode !== "courier") return;

      const coords = event.coordinates; // [lng, lat]
      setAddressError("");
      setCourierAddress("Определяем адрес...");

      // 1. Проверяем полигоны
      const isInside = checkDeliveryZone(coords);

      if (!isInside) {
        setCourierMarker(null); // Убираем маркер, если кликнули мимо
        setAddressError(
          "Выбранная точка находится вне зоны курьерской доставки."
        );
        setCourierAddress("Вне зоны доставки");
        return;
      }

      // 2. Ставим маркер и ищем адрес
      setCourierMarker({ coordinates: coords });

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&accept-language=ru`
        );
        const data = await res.json();
        setCourierAddress(
          data.display_name || "Адрес определен по координатам"
        );
      } catch (e) {
        setCourierAddress("Адрес на карте");
      }
    },
    [deliveryMode, polygons]
  );

  // --- ПОДТВЕРЖДЕНИЕ И РАСЧЕТ ЦЕНЫ ---
  const handleCourierConfirm = async () => {
    // Разрешаем, если маркер стоит ИЛИ адрес введен вручную и нет ошибок
    if (
      (!courierMarker && !currentData.address && !courierAddress) ||
      addressError
    ) {
      alert("Пожалуйста, укажите корректный адрес в зоне доставки.");
      return;
    }

    setIsCalculating(true);
    let finalPrice = 0;

    try {
      // Запрос к API Dalli для точного расчета
      const res = await fetch(
        `https://wowbox.market/api/get-delivery-price.php?address=${encodeURIComponent(
          courierAddress
        )}`
      );
      const data = await res.json();

      if (data.price && data.price > 0) {
        finalPrice = data.price;
      } else {
        console.warn("API цены вернуло ошибку или 0:", data.error);
        // Fallback: цена из таблицы городов + наценка 180р
        finalPrice = (selectedCity.price || 350) + 180;
      }
    } catch (e) {
      console.error("Ошибка расчета цены:", e);
      finalPrice = (selectedCity.price || 350) + 180;
    } finally {
      setIsCalculating(false);
    }

    // Передаем данные в OrderModal
    onDeliverySelect({
      mode: "courier",
      address: courierAddress,
      apartment,
      entrance,
      floor,
      comment,
      cityFias: selectedCity.fias,
      price: finalPrice,
      cityName: selectedCity.name,
    });
    onClose();
  };

  // --- ВЫБОР ПВЗ ---
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

  // --- РЕНДЕР МАРКЕРОВ ---
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

          {/* Селект города показываем всегда для смены региона */}
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
        </div>

        <div className={styles.mapContainer}>
          {loading && <div className={styles.loader}>Загрузка...</div>}

          <YMap location={location} mode="vector">
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />
            <YMapListener onClick={handleMapClick} />

            {/* 1. ПОЛИГОНЫ */}
            {deliveryMode === "courier" &&
              polygons &&
              polygons.features &&
              polygons.features.map((feature, idx) => (
                <YMapFeature
                  key={idx}
                  geometry={feature.geometry}
                  style={{
                    // Делаем заливку заметнее (0.4)
                    fill: "rgba(0, 200, 83, 0.6)",
                    stroke: [{ color: "#00C853", width: 3 }],
                  }}
                />
              ))}

            {/* 2. МАРКЕР КУРЬЕРА */}
            {deliveryMode === "courier" && courierMarker && (
              <YMapMarker coordinates={courierMarker.coordinates}>
                <div
                  style={{
                    fontSize: "34px",
                    transform: "translate(-50%, -100%)",
                    filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.3))",
                  }}
                >
                  🏠
                </div>
              </YMapMarker>
            )}

            {/* 3. ТОЧКИ ПВЗ */}
            {deliveryMode === "pickup" && (
              <YMapClusterer
                marker={renderMarker}
                cluster={renderCluster}
                method={gridSizedMethod}
                features={features}
              />
            )}
          </YMap>

          {/* ПАНЕЛЬ КУРЬЕРА */}
          {deliveryMode === "courier" && (
            <div className={styles.courierPanel}>
              <div className={styles.searchRow}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Введите адрес или кликните на карту"
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

              <button
                className={styles.confirmBtn}
                onClick={handleCourierConfirm}
                disabled={!!addressError || isCalculating}
                style={{ opacity: !!addressError || isCalculating ? 0.7 : 1 }}
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
