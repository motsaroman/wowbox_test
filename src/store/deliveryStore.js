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

// Вспомогательная функция для проверки фичи
function checkFeatureContains(feature, coords) {
    if (feature.geometry.type === 'Polygon') {
        return isPointInPolygon(coords, feature.geometry.coordinates[0]);
    } 
    else if (feature.geometry.type === 'MultiPolygon') {
        for (const polygon of feature.geometry.coordinates) {
            if (isPointInPolygon(coords, polygon[0])) {
                return true;
            }
        }
    }
    return false;
}

// [НОВОЕ] Форматирование адреса в простую строку для инпута
function formatAddress(osmData) {
    const addr = osmData.address;
    if (!addr) return osmData.display_name;

    const city = addr.city || addr.town || addr.village || addr.city_district || '';
    const street = addr.road || addr.pedestrian || addr.highway || addr.street || '';
    const house = addr.house_number || '';

    // Собираем части, которые есть
    const parts = [city, street, house].filter(part => part && part.trim() !== '');
    
    // Если удалось собрать хотя бы город и улицу, возвращаем короткий вариант
    if (parts.length > 0) {
        return parts.join(', ');
    }
    
    // Иначе возвращаем полный (фоллбэк)
    return osmData.display_name;
}

const GEOCODER_API_URL = 'https://wowbox.market/api/geocode.php';

export const useDeliveryStore = create((set, get) => ({
  // ... (СОСТОЯНИЕ остаётся без изменений) ...
  selectedCity: cities[0],
  deliveryMode: 'pickup', 
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
  addressSuggestions: [],
  courierForm: { apartment: '', entrance: '', floor: '', comment: '' },

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

  setSelectedCity: async (cityValue) => {
    const city = cities.find(c => c.fias === cityValue || c.name === cityValue);
    if (city) {
      set({ selectedCity: city, addressError: '' });
      return await get().loadDataForCity(); 
    } else {
      set({ addressError: "В этот город доставка не осуществляется, выберите другой" });
      return null;
    }
  },

  setCourierField: (field, value) => set(state => ({
    courierForm: { ...state.courierForm, [field]: value }
  })),

  setCourierAddress: (address) => set({ courierAddress: address, addressError: '' }),

  clearSuggestions: () => set({ addressSuggestions: [] }),

  fetchSuggestions: async (query) => {
      if (!query || query.length < 3) {
          set({ addressSuggestions: [] });
          return;
      }
      try {
          const url = `${GEOCODER_API_URL}?q=${encodeURIComponent(query)}&accept-language=ru&limit=5&addressdetails=1&countrycodes=ru`;
          const res = await fetch(url);
          const data = await res.json();
          if (Array.isArray(data)) set({ addressSuggestions: data });
      } catch (e) {
          console.error("Autosuggest error:", e);
      }
  },

  // [ОБНОВЛЕНО] Используем formatAddress
  selectSuggestion: async (suggestion) => {
      const coords = [parseFloat(suggestion.lon), parseFloat(suggestion.lat)];
      
      // Форматируем адрес красиво
      const cleanAddress = formatAddress(suggestion);

      set({ 
          courierAddress: cleanAddress, 
          addressSuggestions: [] 
      });

      const addressDetails = suggestion.address;
      
      if (addressDetails.country_code && addressDetails.country_code !== 'ru') {
          set({ addressError: "Доставка возможна только по территории РФ" });
          return;
      }

      const newPolygonsData = await get()._maybeUpdateCity(addressDetails);
      const currentPolygons = newPolygonsData ? newPolygonsData.polygons : get().polygons;

      set({
          courierMarker: { coordinates: coords },
          mapLocation: { center: coords, zoom: 16 },
          addressError: ''
      });

      if (currentPolygons?.features) {
           let isInside = false;
           for (const feature of currentPolygons.features) {
              if (checkFeatureContains(feature, coords)) {
                  isInside = true; 
                  break;
              }
           }
           if (!isInside) set({ addressError: "Адрес вне зоны доставки выбранного города." });
      }
  },

  loadDataForCity: async () => {
    const { deliveryMode, selectedCity } = get();
    set({ isLoading: true, addressError: '' });

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
          return { points }; 
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

        if (!geoJson.features || geoJson.features.length === 0) {
            set({ 
                polygons: null, 
                addressError: "В этот регион курьерская доставка не осуществляется, выберите другой способ доставки" 
            });
            return { polygons: null };
        } else {
            set({ polygons: geoJson });
            if (!get().courierMarker && geoJson.features?.length > 0) {
              const firstPoly = geoJson.features[0].geometry.coordinates[0];
              if (firstPoly?.[0]) {
                set({ mapLocation: { center: firstPoly[0], zoom: 10 } });
              }
            }
            return { polygons: geoJson }; 
        }
      }
    } catch (e) {
      console.error("[Store] Ошибка загрузки данных:", e);
      set({ addressError: "Ошибка загрузки зон доставки" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  _maybeUpdateCity: async (addrDetails, forceRefresh = false) => {
      const { selectedCity, setSelectedCity, loadDataForCity } = get();
      
      if (addrDetails.country_code && addrDetails.country_code !== 'ru') {
          set({ addressError: "Доставка возможна только по территории РФ" });
          return null;
      }

      const detectedName = addrDetails.city || addrDetails.town || addrDetails.village || addrDetails.state;

      if (detectedName) {
          let foundCity = cities.find(c => c.name === detectedName);
          if (!foundCity) {
             foundCity = cities.find(c => detectedName.includes(c.name) || (c.name && c.name.includes(detectedName)));
          }

          const cityToSet = foundCity || { name: detectedName, price: 350 };

          if (forceRefresh || cityToSet.name !== selectedCity.name) {
              if (foundCity) {
                  return await setSelectedCity(foundCity.fias); 
              } else {
                  return await setSelectedCity(cityToSet.name); 
              }
          }
      } else {
          if (forceRefresh) {
              return await loadDataForCity();
          }
      }
      return null; 
  },

  searchAddressAction: async () => {
    const { courierAddress, _maybeUpdateCity } = get();
    if (!courierAddress || courierAddress.length < 3) return;

    set({ isLoading: true, addressError: '' });

    try {
      const url = `${GEOCODER_API_URL}?q=${encodeURIComponent(courierAddress)}&accept-language=ru&limit=1&addressdetails=1&countrycodes=ru`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data?.[0]) {
        const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        const addressDetails = data[0].address;

        const updateResult = await _maybeUpdateCity(addressDetails);
        const activePolygons = updateResult?.polygons || get().polygons;

        set({
            courierMarker: { coordinates: coords },
            mapLocation: { center: coords, zoom: 14 }
        });

        if (activePolygons?.features) {
             let isInside = false;
             for (const feature of activePolygons.features) {
                if (checkFeatureContains(feature, coords)) {
                    isInside = true; 
                    break;
                }
             }
             if (!isInside) {
                 set({ addressError: "Адрес вне зоны доставки выбранного города." });
             } else {
                 set({ addressError: "" }); 
             }
        } 

      } else {
        set({ addressError: "Адрес не найден" });
      }
    } catch (e) {
      console.error(e);
      set({ addressError: "Ошибка поиска" });
    } finally {
      set({ isLoading: false });
    }
  },

  // [ОБНОВЛЕНО] Используем formatAddress
  detectLocationAction: async () => {
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
            position = await getPosition({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        } catch (err) {
            if (err.code === 3) { 
                position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
            } else {
                throw err;
            }
        }

        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];

        const url = `${GEOCODER_API_URL}?lat=${latitude}&lon=${longitude}&accept-language=ru&addressdetails=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        // Используем чистый адрес
        const cleanAddress = formatAddress(data);
        set({ courierAddress: cleanAddress || "Мое местоположение" });

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
          let msg = 'Не удалось определить местоположение';
          if (e.code === 1) msg = 'Доступ запрещен пользователем';
          set({ addressError: msg });
      } finally {
          set({ isLoading: false });
      }
  },

  // [ОБНОВЛЕНО] Используем formatAddress
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
        if (checkFeatureContains(feature, coords)) {
            isInside = true; 
            break;
        }
      }
    }
    
    if (!isInside && polygons) {
        set({ addressError: "Точка вне зоны доставки" });
    }

    try {
      const url = `${GEOCODER_API_URL}?lat=${coords[1]}&lon=${coords[0]}&accept-language=ru&addressdetails=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      // Используем чистый адрес
      const cleanAddress = formatAddress(data);
      set({ courierAddress: cleanAddress || "Адрес на карте" });

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
              finalPrice = selectedCity.price;
            }
          } catch (e) {
            finalPrice = selectedCity.price
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
        price: selectedCity.price,
        address: "",
        cityFias: selectedCity.fias,
        cityName: selectedCity.name,
        mode: 'pickup'
      };
    }
    return null;
  }
}));