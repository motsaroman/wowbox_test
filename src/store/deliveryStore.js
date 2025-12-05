import { create } from 'zustand';
import { cities } from '../data/cities';

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

export const useDeliveryStore = create((set, get) => ({
  // --- СОСТОЯНИЕ ---
  selectedCity: cities[0],
  deliveryMode: 'pickup',
  clientEmail: '', // Email для проверки повторного заказа

  points: [],
  polygons: null,

  isLoading: false,
  isCalculating: false,
  mapLocation: { center: [37.6176, 55.7558], zoom: 10 },

  courierMarker: null,
  courierAddress: '',
  addressError: '',

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
      set({ selectedCity: city });
    } else {
      set({ selectedCity: { name: cityValue, price: 350 } }); 
    }
    get().loadDataForCity();
  },

  setCourierField: (field, value) => set(state => ({
    courierForm: { ...state.courierForm, [field]: value }
  })),

  setCourierAddress: (address) => set({ courierAddress: address }),

  loadDataForCity: async () => {
    const { deliveryMode, selectedCity } = get();
    set({ isLoading: true, addressError: '' });

    try {
      if (deliveryMode === 'pickup') {
        set({ polygons: null });
        if (selectedCity.fias) {
          const res = await fetch(`https://wowbox.market/api/get-points.php?fias=${selectedCity.fias}`);
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
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  _maybeUpdateCity: (addrDetails, forceRefresh = false) => {
      const { selectedCity, setSelectedCity, loadDataForCity } = get();
      const detectedName = addrDetails.city || addrDetails.town || addrDetails.village || addrDetails.state;

      if (detectedName) {
          let foundCity = cities.find(c => c.name === detectedName);
          if (!foundCity) {
             foundCity = cities.find(c => detectedName.includes(c.name) || (c.name && c.name.includes(detectedCityName)));
          }
          const cityToSet = foundCity || { name: detectedName, price: 350 };

          if (forceRefresh || cityToSet.name !== selectedCity.name) {
              if (foundCity) setSelectedCity(foundCity.fias);
              else setSelectedCity(cityToSet.name);
              return true; 
          }
      } else {
          if (forceRefresh) loadDataForCity();
      }
      return false;
  },

  searchAddressAction: async () => {
    const { courierAddress, polygons, _maybeUpdateCity } = get();
    if (!courierAddress || courierAddress.length < 3) return;

    set({ isLoading: true, addressError: '' });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(courierAddress)}&accept-language=ru&limit=1&addressdetails=1`);
      const data = await res.json();

      if (data?.[0]) {
        const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        const cityUpdated = _maybeUpdateCity(data[0].address);

        set({
            courierMarker: { coordinates: coords },
            mapLocation: { center: coords, zoom: 14 }
        });

        if (!cityUpdated && polygons?.features) {
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

  /*detectLocationAction: async () => {
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
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru&addressdetails=1`);
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
          let msg = 'Не удалось определить местоположение';
          if (e.code === 1) msg = 'Доступ к геолокации запрещен';
          if (e.code === 3) msg = 'Тайм-аут: сигнал не найден';
          set({ addressError: msg });
      } finally {
          set({ isLoading: false });
      }
  },*/

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
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&accept-language=ru&addressdetails=1`);
      const data = await res.json();
      set({ courierAddress: data.display_name || "Адрес на карте" });
      if (data.address) get()._maybeUpdateCity(data.address);
    } catch (e) {
      set({ courierAddress: "Адрес на карте" });
    }
  },

  // --- ФУНКЦИЯ ПРОВЕРКИ БЕСПЛАТНОЙ ДОСТАВКИ ---
  checkFreeShipping: async (addressToCheck) => {
    const { clientEmail, clientPhone } = get(); // Достаем телефон

    // Разрешаем проверку, если есть хотя бы один контакт
    if ((!clientEmail && !clientPhone) || !addressToCheck) return false;

    try {
        console.log("Checking free shipping for:", { email: clientEmail, phone: clientPhone, address: addressToCheck });

        const res = await fetch('https://wowbox.market/api/check-free-shipping.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: clientEmail,
                phone: clientPhone, // Отправляем телефон
                address: addressToCheck,
                date: new Date().toISOString().split('T')[0]
            })
        });
        const data = await res.json();
        console.log("Free shipping check result:", data); // Лог для отладки

        if (data.isFree) {
            return true;
        }
    } catch (e) {
        console.error("Check free shipping error:", e);
    }
    return false;
},

  // --- РАСЧЕТ И ПОДТВЕРЖДЕНИЕ ---
  calculateAndConfirm: async () => {
    const { courierAddress, selectedCity, courierMarker, addressError, deliveryMode, checkFreeShipping } = get();

    if (deliveryMode === 'courier') {
      if (!courierMarker && !courierAddress) return null;
      if (addressError) return null;

      set({ isCalculating: true });
      let finalPrice = 0;

      // 1. Проверяем, положена ли бесплатная доставка (проверяем по адресу и email)
      const isFree = await checkFreeShipping(courierAddress);

      if (isFree) {
          finalPrice = 0;
          // Можно добавить уведомление, если нужно
          alert("🎉 Вам доступна бесплатная доставка за повторный заказ!");
      } else {
          // Если не бесплатно, считаем через Dalli или по умолчанию
          try {
            const res = await fetch(`https://wowbox.market/api/get-delivery-price.php?address=${encodeURIComponent(courierAddress)}`);
            const data = await res.json();

            if (data.price && data.price > 0) {
              finalPrice = data.price;
            } else {
              finalPrice = (selectedCity.price)
            }
          } catch (e) {
            console.error("Error calc courier", e);
            finalPrice = (selectedCity.price);
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
    } 
    
    // Pickup логика в calculateAndConfirm обычно не используется для клика по точке,
    // но если вдруг — оставим
    else if (deliveryMode === 'pickup') {
      // Здесь цена обычно берется при клике на маркер, но если нужно вернуть дефолт:
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