import { useEffect, useRef, useState } from "react";

import toLeft from "../../assets/icons/toLeft.svg";
import search from "../../assets/icons/searchIcon.svg";

import styles from "./DeliveryMapPage.module.css";

export default function DeliveryMapPage({
  isOpen = true,
  onClose,
  onDeliverySelect,
  initialMode = "pickup",
  currentData = {},
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const pickupMarkersRef = useRef([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState(initialMode);
  const [courierAddress, setCourierAddress] = useState(
    currentData.address || ""
  );
  const [apartmentNumber, setApartmentNumber] = useState(
    currentData.apartment || ""
  );
  const [entranceNumber, setEntranceNumber] = useState(
    currentData.entrance || ""
  );
  const [floorNumber, setFloorNumber] = useState(currentData.floor || "");
  const [courierComment, setCourierComment] = useState(
    currentData.comment || ""
  );
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [deliveryPoints] = useState([
    {
      id: 1,
      name: "Касса 5Post",
      coords: [55.7522, 37.6156],
      address: "Москва г, Промышленная ул, 27",
    },
    {
      id: 2,
      name: 'Пункт выдачи "Тверская"',
      coords: [55.7658, 37.6068],
      address: "Москва г, Тверская ул, д. 25",
    },
    {
      id: 3,
      name: 'Пункт выдачи "Кутузовский"',
      coords: [55.7423, 37.5352],
      address: "Москва г, Кутузовский проспект, д. 32",
    },
    {
      id: 4,
      name: 'Пункт выдачи "Сокольники"',
      coords: [55.7887, 37.6798],
      address: "Москва г, Сокольническая пл, д. 4А",
    },
    {
      id: 5,
      name: 'Пункт выдачи "Ленинский"',
      coords: [55.7065, 37.5834],
      address: "Москва г, Ленинский проспект, д. 45",
    },
    {
      id: 6,
      name: 'Пункт выдачи "Таганская"',
      coords: [55.7403, 37.6533],
      address: "Москва г, Таганская ул, д. 17",
    },
    {
      id: 7,
      name: 'Пункт выдачи "Щелковская"',
      coords: [55.8083, 37.7983],
      address: "Москва г, Щелковское шоссе, д. 100",
    },
    {
      id: 8,
      name: 'Пункт выдачи "Юго-Западная"',
      coords: [55.6638, 37.4831],
      address: "Москва г, Проспект Вернадского, д. 86",
    },
  ]);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (deliveryMode === "courier") {
      // Remove pickup markers
      pickupMarkersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      pickupMarkersRef.current = [];

      setCourierAddress("");

      // Add click event for courier mode
      mapInstanceRef.current.on("click", handleMapClick);
    } else {
      // Remove courier marker
      if (courierMarkerRef.current) {
        mapInstanceRef.current.removeLayer(courierMarkerRef.current);
        courierMarkerRef.current = null;
      }

      // Remove click event
      mapInstanceRef.current.off("click", handleMapClick);

      // Re-add pickup points
      addPointsToMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off("click", handleMapClick);
      }
    };
  }, [deliveryMode]);

  const initMap = () => {
    if (window.L && mapRef.current && !mapInstanceRef.current) {
      const map = window.L.map(mapRef.current).setView([55.7558, 37.6173], 11);

      // Add OpenStreetMap tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      addPointsToMap();
    }
  };

  const addPointsToMap = () => {
    if (!mapInstanceRef.current || !window.L) return;

    deliveryPoints.forEach((point) => {
      const blueIcon = window.L.icon({
        iconUrl:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQyQzE2IDQyIDMyIDE5LjUgMzIgMTJDMzIgNS4zNzI1OCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA1LjM3MjU4IDAgMTJDMCAxOS41IDE2IDQyIDE2IDQyWiIgZmlsbD0iIzFFODhFNSIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSI3IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });

      const marker = window.L.marker([point.coords[0], point.coords[1]], {
        icon: blueIcon,
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`<strong>${point.name}</strong><br/>${point.address}`);

      marker.on("click", () => {
        setSelectedPoint(point);
        mapInstanceRef.current.setView([point.coords[0], point.coords[1]], 14);
      });

      pickupMarkersRef.current.push(marker);
    });
  };

  const handlePointSelect = (point) => {
    setSelectedPoint(point);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([point.coords[0], point.coords[1]], 14);
    }
  };

  const geocodeAndUpdate = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`
      );
      const data = await response.json();

      if (data.display_name) {
        setCourierAddress(data.display_name);
      } else {
        setCourierAddress("Адрес не найден");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setCourierAddress("Ошибка при определении адреса");
    }
  };

  const handleMapClick = (e) => {
    if (deliveryMode !== "courier" || !window.L) return;

    const { lat, lng } = e.latlng;

    // Remove old marker
    if (courierMarkerRef.current) {
      mapInstanceRef.current.removeLayer(courierMarkerRef.current);
    }

    // Create red home icon
    const redIcon = window.L.icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQyQzE2IDQyIDMyIDE5LjUgMzIgMTJDMzIgNS4zNzI1OCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA1LjM3MjU4IDAgMTJDMCAxOS41IDE2IDQyIDE2IDQyWiIgZmlsbD0iI0VGNDQ0NCIvPgo8cGF0aCBkPSJNMTYgOEwxMCAxM1YyMEgyMlYxM0wxNiA4WiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMTMiIHk9IjE2IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    });

    // Create new marker
    const marker = window.L.marker([lat, lng], {
      draggable: true,
      icon: redIcon,
    }).addTo(mapInstanceRef.current);

    // Add dragend event
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      geocodeAndUpdate(position.lat, position.lng);
    });

    courierMarkerRef.current = marker;
    geocodeAndUpdate(lat, lng);
  };

  const handleConfirm = () => {
    if (selectedPoint) {
      if (onDeliverySelect) {
        onDeliverySelect({
          mode: "pickup",
          point: selectedPoint,
        });
      } else {
        alert(
          `Выбранный пункт: ${selectedPoint.name}\nАдрес: ${selectedPoint.address}`
        );
        if (onClose) onClose();
      }
    } else {
      alert("Пожалуйста, выберите пункт выдачи!");
    }
  };

  const handleCourierSave = () => {
    if (!courierAddress) {
      alert("Пожалуйста, выберите адрес доставки на карте!");
      return;
    }

    if (onDeliverySelect) {
      onDeliverySelect({
        mode: "courier",
        address: courierAddress,
        apartment: apartmentNumber,
        entrance: entranceNumber,
        floor: floorNumber,
        comment: courierComment,
      });
    } else {
      alert(
        `Адрес: ${courierAddress}\nКвартира: ${apartmentNumber}\nПодъезд: ${entranceNumber}\nЭтаж: ${floorNumber}\nКомментарий: ${courierComment}`
      );
      if (onClose) onClose();
    }
  };

  // Debounced search function
  const searchCities = async (query) => {
    if (!query || query.length < 2 || deliveryMode !== "courier") {
      setSearchSuggestions([]);
      return;
    }

    setIsSearchLoading(true);

    try {
      const response = await fetch(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Token d1aafef2e4fc8bd8ef8a34b7bfa7163c5d52b610",
          },
          body: JSON.stringify({
            query: query,
            locations: [{ country: "*" }],
            restrict_value: true,
            from_bound: { value: "city" },
            to_bound: { value: "settlement" },
            count: 10,
          }),
        }
      );

      const data = await response.json();
      setSearchSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchSuggestions([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Debounced search with useEffect
  // Debounced search with useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && deliveryMode === "courier") {
        searchCities(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, deliveryMode]);

  const handleCitySelect = (suggestion) => {
    // Only work in courier mode
    if (deliveryMode !== "courier") return;

    const cityName =
      suggestion.data.city || suggestion.data.settlement_with_type;
    const coordinates = [
      parseFloat(suggestion.data.geo_lat),
      parseFloat(suggestion.data.geo_lon),
    ];

    if (mapInstanceRef.current && coordinates[0] && coordinates[1]) {
      // Update map center
      mapInstanceRef.current.setView(coordinates, 12);

      // Update address for courier mode
      setCourierAddress(suggestion.value);

      // Remove existing courier marker
      if (courierMarkerRef.current) {
        mapInstanceRef.current.removeLayer(courierMarkerRef.current);
        courierMarkerRef.current = null;
      }

      // Clear existing pickup markers
      pickupMarkersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      pickupMarkersRef.current = [];
      setSelectedPoint(null);
    }

    // Close modal and reset search
    setIsSearchModalOpen(false);
    setSearchQuery("");
    setSearchSuggestions([]);
  };

  const openSearchModal = () => {
    // Only allow search in courier mode
    if (deliveryMode !== "courier") return;

    setIsSearchModalOpen(true);
    setSearchQuery("");
    setSearchSuggestions([]);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery("");
    setSearchSuggestions([]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={onClose}>
              <img src={toLeft} alt="Back" />
            </button>

            <h1 className={styles.title}>Способ доставки</h1>

            <button
              className={`${styles.searchBtn} ${
                deliveryMode !== "courier" ? styles.searchBtnDisabled : ""
              }`}
              onClick={openSearchModal}
              disabled={deliveryMode !== "courier"}
            >
              <img src={search} alt="Search" />
            </button>
          </div>
          <div className={styles.tabs}>
            <button
              onClick={() => setDeliveryMode("pickup")}
              className={`${styles.tabBtn} ${
                deliveryMode === "pickup" ? styles.tabBtnActive : ""
              }`}
            >
              Пункт выдачи
            </button>
            <button
              onClick={() => setDeliveryMode("courier")}
              className={`${styles.tabBtn} ${
                deliveryMode === "courier" ? styles.tabBtnActive : ""
              }`}
            >
              Курьером
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* Map */}
          <div className={styles.mapWrapper}>
            <div ref={mapRef} className={styles.map} />

            {/* Pickup Info Card */}
            {deliveryMode === "pickup" && selectedPoint && (
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>{selectedPoint.name}</h3>
                <p className={styles.infoAddress}>{selectedPoint.address}</p>

                <div className={styles.infoBadges}>
                  <div className={styles.badge}>Доставка 1-6 дней</div>
                  <div className={styles.badge}>Хранение 7 дней</div>
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Стоимость доставки</span>
                  <span className={styles.priceValue}>99₽</span>
                </div>

                <button onClick={handleConfirm} className={styles.deliverBtn}>
                  Доставить сюда
                </button>
              </div>
            )}

            {/* Courier Form */}
            {deliveryMode === "courier" && (
              <div className={styles.courierForm}>
                <h3 className={styles.courierAddress}>
                  {courierAddress ||
                    "Нажмите на карту для выбора адреса доставки"}
                </h3>

                <div className={styles.formGrid}>
                  <input
                    type="text"
                    placeholder="Квартира"
                    value={apartmentNumber}
                    onChange={(e) => setApartmentNumber(e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Подъезд"
                    value={entranceNumber}
                    onChange={(e) => setEntranceNumber(e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Этаж"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <textarea
                  placeholder="Комментарий для курьера"
                  value={courierComment}
                  onChange={(e) => setCourierComment(e.target.value)}
                  className={styles.textarea}
                />

                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Стоимость доставки</span>
                  <span className={styles.priceValue}>99₽</span>
                </div>

                <button onClick={handleCourierSave} className={styles.saveBtn}>
                  Сохранить
                </button>

                <p className={styles.agreement}>
                  Нажимая "Сохранить", я соглашаюсь с{" "}
                  <span className={styles.agreementLink}>условиями</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* City Search Modal */}
        {isSearchModalOpen && (
          <div className={styles.searchModalOverlay} onClick={closeSearchModal}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={styles.modalHeader}>
                <button
                  className={styles.modalBackBtn}
                  onClick={closeSearchModal}
                >
                  ←
                </button>
                <h2 className={styles.modalTitle}>Поиск города</h2>
                <button
                  className={styles.modalCloseBtn}
                  onClick={closeSearchModal}
                >
                  ×
                </button>
              </div>

              {/* Search Input */}
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Введите название города"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
                {isSearchLoading && (
                  <div className={styles.searchLoader}>Поиск...</div>
                )}
              </div>

              {/* Search Results */}
              <div className={styles.searchResults}>
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((suggestion, index) => {
                    const cityName =
                      suggestion.data.city ||
                      suggestion.data.settlement_with_type;
                    const regionInfo = suggestion.data.region_with_type;
                    const postalCode = suggestion.data.postal_code;

                    return (
                      <div
                        key={index}
                        className={styles.searchResultItem}
                        onClick={() => handleCitySelect(suggestion)}
                      >
                        <div className={styles.resultMainText}>{cityName}</div>
                        <div className={styles.resultSubText}>
                          {regionInfo}
                          {postalCode && `, ${postalCode}`}
                        </div>
                      </div>
                    );
                  })
                ) : searchQuery && !isSearchLoading ? (
                  <div className={styles.noResults}>Города не найдены</div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
