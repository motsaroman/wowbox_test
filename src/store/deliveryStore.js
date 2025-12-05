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

// Прокси для геокодера
const GEOCODER_API_URL = 'https://wowbox.market/api/geocode.php';

export const useDeliveryStore = create((set, get) => ({
  // --- СОСТОЯНИЕ ---
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

  // [ИЗМЕНЕНО] Сделали async и добавили return, чтобы ждать загрузки
  setSelectedCity: async (cityValue) => {
    const city = cities.find(c => c.fias === cityValue || c.name === cityValue);

    if (city) {
      set({ selectedCity: city, addressError: '' });
      return await get().loadDataForCity(); // Ждем и возвращаем данные
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

  selectSuggestion: async (suggestion) => {
    const coords = [parseFloat(suggestion.lon), parseFloat(suggestion.lat)];

    set({
      courierAddress: suggestion.display_name,
      addressSuggestions: []
    });

    const addressDetails = suggestion.address;

    if (addressDetails.country_code && addressDetails.country_code !== 'ru') {
      set({ addressError: "Доставка возможна только по территории РФ" });
      return;
    }

    // Ждем обновления города и получения новых полигонов
    const newPolygonsData = await get()._maybeUpdateCity(addressDetails);

    // Определяем, какие полигоны использовать (новые или те что были)
    const currentPolygons = newPolygonsData ? newPolygonsData.polygons : get().polygons;

    set({
      courierMarker: { coordinates: coords },
      mapLocation: { center: coords, zoom: 16 },
      addressError: ''
    });

    // Проверка зоны с АКТУАЛЬНЫМИ полигонами
    if (currentPolygons?.features) {
      let isInside = false;
      for (const feature of currentPolygons.features) {
        if (feature.geometry.type === 'Polygon' && isPointInPolygon(coords, feature.geometry.coordinates[0])) {
          isInside = true; break;
        }
      }
      if (!isInside) set({ addressError: "Адрес вне зоны доставки выбранного города." });
    }
  },

  // [ИЗМЕНЕНО] Возвращаем загруженные данные
  loadDataForCity: async () => {
    const { deliveryMode, selectedCity } = get();
    console.log(`[Store] Загрузка данных. Город: ${selectedCity.name}, Режим: ${deliveryMode}`);

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
          return { points }; // Возвращаем для цепочки
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
            addressError: "В этот город курьерская доставка не осуществляется, выберите другой"
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
          return { polygons: geoJson }; // Возвращаем новые полигоны
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

  // [ИЗМЕНЕНО] Возвращает новые данные, если город обновился
  _maybeUpdateCity: async (addrDetails, forceRefresh = false) => {
    const { selectedCity, setSelectedCity, loadDataForCity } = get();

    if (addrDetails.country_code && addrDetails.country_code !== 'ru') {
      set({ addressError: "Доставка возможна только по территории РФ" });
      return null;
    }

    const detectedName = addrDetails.city || addrDetails.town || addrDetails.village || addrDetails.state;
    console.log("[Store] Город из координат:", detectedName);

    if (detectedName) {
      let foundCity = cities.find(c => c.name === detectedName);
      if (!foundCity) {
        foundCity = cities.find(c => detectedName.includes(c.name) || (c.name && c.name.includes(detectedName)));
      }

      const cityToSet = foundCity || { name: detectedName, price: 350 };

      if (forceRefresh || cityToSet.name !== selectedCity.name) {
        console.log("[Store] Смена на валидный город:", cityToSet.name);

        if (foundCity) {
          return await setSelectedCity(foundCity.fias); // Ждем завершения загрузки
        } else {
          return await setSelectedCity(cityToSet.name); // Ждем завершения загрузки
        }
      }
    } else {
      if (forceRefresh) {
        return await loadDataForCity();
      }
    }
    return null; // Город не менялся
  },

  // [ИЗМЕНЕНО] Поиск с ожиданием загрузки полигонов
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

        // ЖДЕМ, пока загрузятся полигоны нового города (если он сменился)
        const updateResult = await _maybeUpdateCity(addressDetails);

        // Берем полигоны: либо новые (updateResult.polygons), либо текущие из стейта
        const activePolygons = updateResult?.polygons || get().polygons;

        set({
          courierMarker: { coordinates: coords },
          mapLocation: { center: coords, zoom: 14 }
        });

        // Проверяем вхождение
        if (activePolygons?.features) {
          let isInside = false;
          for (const feature of activePolygons.features) {
            if (feature.geometry.type === 'Polygon' && isPointInPolygon(coords, feature.geometry.coordinates[0])) {
              isInside = true; break;
            }
          }
          if (!isInside) {
            set({ addressError: "Адрес вне зоны доставки выбранного города." });
          } else {
            set({ addressError: "" }); // Все ок
          }
        } else if (!activePolygons && get().deliveryMode === 'courier') {
          // Если полигонов нет вообще (например, ошибка загрузки города)
          // Ошибка уже установлена в loadDataForCity, но на всякий случай
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

  detectLocationAction: async () => {
    // (Этот код был скрыт/закомментирован, но логику с await _maybeUpdateCity нужно применить и сюда, если вы его раскомментируете)
  },

  handleMapClickAction: async (coords) => {
    const { deliveryMode, polygons } = get();
    if (deliveryMode !== 'courier') return;

    set({
      courierMarker: { coordinates: coords },
      addressError: '',
      courierAddress: 'Загрузка...'
    });

    try {
      const url = `${GEOCODER_API_URL}?lat=${coords[1]}&lon=${coords[0]}&accept-language=ru&addressdetails=1`;
      const res = await fetch(url);
      const data = await res.json();

      set({ courierAddress: data.display_name || "Адрес на карте" });

      if (data.address) {
        // Здесь тоже можно добавить await, но при клике по карте это менее критично, 
        // так как мы уже проверили полигон (клиентский) ПЕРЕД запросом адреса.
        get()._maybeUpdateCity(data.address);
      }
    } catch (e) {
      set({ courierAddress: "Адрес на карте" });
    }

    // Проверка полигонов (делаем её сразу по текущим, т.к. клик идет по текущей карте)
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
    if (!isInside && polygons) {
      set({ addressError: "Точка вне зоны доставки" });
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
            finalPrice = (selectedCity.price)
          }
        } catch (e) {
          finalPrice = (selectedCity.price)
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