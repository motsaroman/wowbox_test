import { create } from 'zustand';
import { cities } from '../data/cities';

// Функция проверки вхождения точки в полигон
function isPointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Используем ваш PHP-прокси для запросов к OSM
const GEOCODER_API_URL = 'https://wowbox.market/api/geocode.php';

export const useDeliveryStore = create((set, get) => ({
  // --- СОСТОЯНИЕ ---
  selectedCity: cities[0],
  deliveryMode: 'pickup', // 'pickup' | 'courier'
  clientEmail: '',
  clientPhone: '',

  points: [],
  polygons: null,

  isLoading: false,
  isCalculating: false,
  mapLocation: { center: [37.6176, 55.7558], zoom: 10 },

  courierMarker: null,
  courierAddress: '',
  addressError: '',
  
  // Список подсказок для автокомплита
  addressSuggestions: [],

  courierForm: {
    apartment: '',
    entrance: '',
    floor: '',
    comment: ''
  },

  // --- ДЕЙСТВИЯ ---

  initStore: (initialMode, currentData) => {
    const { courierForm } = get();
    set({
      deliveryMode: initialMode,
      clientEmail: currentData.email || '',
      clientPhone: currentData.phone || '',
      courierAddress: currentData.address || '',
      addressError: '',
      courierForm: {
        ...courierForm,
        apartment: currentData.apartment || '',
        entrance: currentData.entrance || '',
        floor: currentData.floor || '',
        comment: currentData.comment || ''
      }
    });
    get().loadDataForCity();
  },

  setDeliveryMode: (mode) => {
    set({ deliveryMode: mode });
    get().loadDataForCity();
  },

  setSelectedCity: (cityValue) => {
    const city = cities.find(c => c.fias === cityValue || c.name === cityValue);
    
    if (city) {
      set({ selectedCity: city, addressError: '' });
      get().loadDataForCity();
    } else {
      set({ addressError: "В этот город доставка не осуществляется, выберите другой" });
    }
  },

  setCourierField: (field, value) => set(state => ({
    courierForm: { ...state.courierForm, [field]: value }
  })),

  setCourierAddress: (address) => set({ courierAddress: address, addressError: '' }),

  // Очистка списка подсказок
  clearSuggestions: () => set({ addressSuggestions: [] }),

  // Загрузка подсказок (Автокомплит) с фильтром по России
  fetchSuggestions: async (query) => {
      if (!query || query.length < 3) {
          set({ addressSuggestions: [] });
          return;
      }

      try {
          // &countrycodes=ru — Ограничиваем поиск только Россией
          const url = `${GEOCODER_API_URL}?q=${encodeURIComponent(query)}&accept-language=ru&limit=5&addressdetails=1&countrycodes=ru`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (Array.isArray(data)) {
              set({ addressSuggestions: data });
          }
      } catch (e) {
          console.error("Autosuggest error:", e);
      }
  },

  // Выбор подсказки из списка
  selectSuggestion: async (suggestion) => {
      const coords = [parseFloat(suggestion.lon), parseFloat(suggestion.lat)];
      
      set({ 
          courierAddress: suggestion.display_name, 
          addressSuggestions: [] 
      });

      // Обновляем город и карту
      const addressDetails = suggestion.address;
      
      // Проверяем страну (на всякий случай)
      if (addressDetails.country_code && addressDetails.country_code !== 'ru') {
          set({ addressError: "Доставка возможна только по территории РФ" });
          return;
      }

      get()._maybeUpdateCity(addressDetails);

      set({
          courierMarker: { coordinates: coords },
          mapLocation: { center: coords, zoom: 16 },
          addressError: ''
      });

      // Проверяем зону доставки (полигоны)
      const { polygons } = get();
      if (polygons?.features) {
           let isInside = false;
           for (const feature of polygons.features) {
              if (feature.geometry.type === 'Polygon' && isPointInPolygon(coords, feature.geometry.coordinates[0])) {
                  isInside = true; break;
              }
           }
           if (!isInside) set({ addressError: "Адрес вне зоны доставки выбранного города." });
      }
  },

  loadDataForCity: async () => {
    const { deliveryMode, selectedCity } = get();
    set({ isLoading: true }); 

    try {
      if (deliveryMode === 'pickup') {
        set({ polygons: null });
        if (selectedCity.fias) {
          const url = `https://wowbox.market/api/get-points.php?fias=${selectedCity.fias}`;
          const res = await fetch(url);
          const data = await res.json();
          const points = Array.isArray(data) ? data : [];
          set({ points });
          if (points.length > 0) {
             set({ mapLocation: { center: points[0].coordinates, zoom: 11 } });
          }
        }
      } else {
        set({ points: [] });
        let url = 'https://wowbox.market/api/get-polygons.php?';
        if (selectedCity.filialId) {
            url += `filial_id=${selectedCity.filialId}`;
        } else {
            url += `city_name=${encodeURIComponent(selectedCity.name)}`;
        }

        const res = await fetch(url);
        const geoJson = await res.json();
        set({ polygons: geoJson });

        if (!get().courierMarker && geoJson.features?.length > 0) {
          const firstPoly = geoJson.features[0].geometry.coordinates[0];
          if (firstPoly?.[0]) {
            set({ mapLocation: { center: firstPoly[0], zoom: 10 } });
          }
        }
      }
    } catch (e) {
      console.error("Error loading city data:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  _maybeUpdateCity: (addrDetails, forceRefresh = false) => {
      const { selectedCity, setSelectedCity } = get();
      
      // Проверка страны при обратном геокодинге
      if (addrDetails.country_code && addrDetails.country_code !== 'ru') {
          set({ addressError: "Доставка возможна только по территории РФ" });
          return false;
      }

      const detectedName = addrDetails.city || addrDetails.town || addrDetails.village || addrDetails.state;
      console.log("[Store] Город из координат:", detectedName);

      if (detectedName) {
          let foundCity = cities.find(c => c.name === detectedName);
          if (!foundCity) {
             foundCity = cities.find(c => detectedName.includes(c.name) || (c.name && c.name.includes(detectedName)));
          }

          if (foundCity) {
              set({ addressError: '' });
              if (forceRefresh || foundCity.name !== selectedCity.name) {
                  console.log("[Store] Смена на валидный город:", foundCity.name);
                  setSelectedCity(foundCity.fias);
                  return true;
              }
          } else {
              console.warn("[Store] Город не найден в списке доставки:", detectedName);
              set({ 
                  addressError: "В этот город доставка не осуществляется, выберите другой" 
              });
              return false;
          }
      } 
      return false;
  },

  // Поиск адреса (по нажатию "Найти") с фильтром РФ
  searchAddressAction: async () => {
    const { courierAddress, polygons, _maybeUpdateCity } = get();
    if (!courierAddress || courierAddress.length < 3) return;

    set({ isLoading: true, addressError: '' });

    try {
      // &countrycodes=ru
      const url = `${GEOCODER_API_URL}?q=${encodeURIComponent(courierAddress)}&accept-language=ru&limit=1&addressdetails=1&countrycodes=ru`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data?.[0]) {
        const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        const addressDetails = data[0].address;

        const cityUpdated = _maybeUpdateCity(addressDetails);

        set({
            courierMarker: { coordinates: coords },
            mapLocation: { center: coords, zoom: 14 }
        });

        const currentError = get().addressError;
        if (!currentError && polygons?.features) {
             let isInside = false;
             for (const feature of polygons.features) {
                if (feature.geometry.type === 'Polygon' && isPointInPolygon(coords, feature.geometry.coordinates[0])) {
                    isInside = true; break;
                }
             }
             if (!isInside) set({ addressError: "Адрес вне зоны доставки выбранного города." });
        }

      } else {
        set({ addressError: "Адрес не найден" });
      }
    } catch (e) {
      set({ addressError: "Ошибка поиска" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Определение геолокации (с фоллбэком и прокси)
  detectLocationAction: async () => {
      console.log("[Store] Запуск геолокации...");
      set({ isLoading: true, addressError: '' });
      
      if (!navigator.geolocation) {
          set({ addressError: 'Геолокация не поддерживается', isLoading: false });
          return;
      }

      const getPosition = (options) => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      };

      try {
        let position;
        try {
            console.log("[Store] Попытка High Accuracy...");
            position = await getPosition({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        } catch (err) {
            if (err.code === 3) { 
                console.warn("[Store] Тайм-аут GPS. Пробуем Low Accuracy...");
                position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
            } else {
                throw err;
            }
        }

        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        console.log("[Store] Координаты:", coords);

        // Обратное геокодирование через прокси
        const url = `${GEOCODER_API_URL}?lat=${latitude}&lon=${longitude}&accept-language=ru&addressdetails=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        set({ courierAddress: data.display_name || "Мое местоположение" });

        if (data.address) {
            get()._maybeUpdateCity(data.address, true);
        } else {
            get().loadDataForCity();
        }

        set({
            courierMarker: { coordinates: coords },
            mapLocation: { center: coords, zoom: 16 }
        });

      } catch (e) {
          console.error("[Store] Ошибка геолокации:", e);
          let msg = 'Не удалось определить местоположение';
          if (e.code === 1) msg = 'Доступ запрещен пользователем';
          set({ addressError: msg });
      } finally {
          set({ isLoading: false });
      }
  },

  handleMapClickAction: async (coords) => {
    const { deliveryMode, polygons } = get();
    if (deliveryMode !== 'courier') return;

    set({
      courierMarker: { coordinates: coords },
      addressError: '',
      courierAddress: 'Загрузка...'
    });

    let isInside = false;
    if (polygons?.features) {
      for (const feature of polygons.features) {
        if (feature.geometry.type === 'Polygon') {
          if (isPointInPolygon(coords, feature.geometry.coordinates[0])) {
            isInside = true; break;
          }
        }
      }
    }

    try {
      const url = `${GEOCODER_API_URL}?lat=${coords[1]}&lon=${coords[0]}&accept-language=ru&addressdetails=1`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      set({ courierAddress: data.display_name || "Адрес на карте" });

      if (data.address) {
          get()._maybeUpdateCity(data.address);
      }
    } catch (e) {
      set({ courierAddress: "Адрес на карте" });
    }
  },

  checkFreeShipping: async (addressToCheck) => {
      const { clientEmail, clientPhone } = get(); 
      if ((!clientEmail && !clientPhone) || !addressToCheck) return false;

      try {
          const res = await fetch('https://wowbox.market/api/check-free-shipping.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  email: clientEmail,
                  phone: clientPhone, 
                  address: addressToCheck,
                  date: new Date().toISOString().split('T')[0]
              })
          });
          const data = await res.json();
          if (data.isFree) return true;
      } catch (e) {
          console.error("Check free shipping error:", e);
      }
      return false;
  },

  calculateAndConfirm: async () => {
    const { courierAddress, selectedCity, courierMarker, addressError, deliveryMode, checkFreeShipping } = get();

    if (deliveryMode === 'courier') {
      if (addressError) return null; 
      if (!courierMarker && !courierAddress) return null;

      set({ isCalculating: true });
      let finalPrice = 0;

      const isFree = await checkFreeShipping(courierAddress);

      if (isFree) {
          finalPrice = 0;
          alert("🎉 Вам доступна бесплатная доставка за повторный заказ!");
      } else {
          try {
            const res = await fetch(`https://wowbox.market/api/get-delivery-price.php?address=${encodeURIComponent(courierAddress)}`);
            const data = await res.json();

            if (data.price && data.price > 0) {
              finalPrice = data.price;
            } else {
              finalPrice = (selectedCity.price || 350) + 180;
            }
          } catch (e) {
            finalPrice = (selectedCity.price || 350) + 180;
          }
      }
      
      set({ isCalculating: false });

      return {
        price: finalPrice,
        address: courierAddress,
        cityFias: selectedCity.fias,
        cityName: selectedCity.name,
        mode: 'courier'
      };
    } else if (deliveryMode === 'pickup') {
      return {
        price: selectedCity.price || 350,
        address: "",
        cityFias: selectedCity.fias,
        cityName: selectedCity.name,
        mode: 'pickup'
      };
    }
    return null;
  }
}));