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
  deliveryMode: 'pickup', // 'pickup' | 'courier'

  // Данные карты
  points: [],      // ПВЗ
  polygons: null,  // Зоны доставки

  // UI состояния
  isLoading: false,
  isCalculating: false,
  mapLocation: { center: [37.6176, 55.7558], zoom: 10 },

  // Данные курьера
  courierMarker: null,
  courierAddress: '',
  addressError: '',

  // Форма курьера (доп. поля)
  courierForm: {
    apartment: '',
    entrance: '',
    floor: '',
    comment: ''
  },

  // --- ДЕЙСТВИЯ (ACTIONS) ---

  // Инициализация (вызывается при открытии модалки)
  initStore: (initialMode, currentData) => {
    const { courierForm } = get();
    set({
      deliveryMode: initialMode,
      courierAddress: currentData.address || '',
      courierForm: {
        ...courierForm,
        apartment: currentData.apartment || '',
        entrance: currentData.entrance || '',
        floor: currentData.floor || '',
        comment: currentData.comment || ''
      }
    });
    // Сразу грузим данные для текущего города
    get().loadDataForCity();
  },

  setDeliveryMode: (mode) => {
    set({ deliveryMode: mode });
    get().loadDataForCity(); // Перезагружаем данные (точки или полигоны)
  },

  setSelectedCity: (cityFias) => {
    const city = cities.find(c => c.fias === cityFias);
    if (city) {
      set({ selectedCity: city });
      get().loadDataForCity();
    }
  },

  setCourierField: (field, value) => set(state => ({
    courierForm: { ...state.courierForm, [field]: value }
  })),

  setCourierAddress: (address) => set({ courierAddress: address }),

  // Логика загрузки данных (ПВЗ или Полигоны)
  loadDataForCity: async () => {
    const { deliveryMode, selectedCity } = get();
    set({ isLoading: true, addressError: '' });

    try {
      if (deliveryMode === 'pickup') {
        // Грузим ПВЗ
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
        // Грузим Полигоны
        set({ points: [] });
        let url = 'https://wowbox.market/api/get-polygons.php?';
        if (selectedCity.filialId) url += `filial_id=${selectedCity.filialId}`;
        else url += `&city_name=${encodeURIComponent(selectedCity.name)}`;

        const res = await fetch(url);
        const geoJson = await res.json();
        set({ polygons: geoJson });

        // Центрируем
        if (geoJson.features?.length > 0) {
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

  // Проверка зоны (при клике на карту)
  handleMapClickAction: async (coords) => {
    const { deliveryMode, polygons } = get();
    if (deliveryMode !== 'courier') return;

    set({
      courierMarker: { coordinates: coords },
      addressError: '',
      courierAddress: 'Определяем адрес...'
    });

    // 1. Проверка полигонов
    let isInside = false;
    if (polygons?.features) {
      for (const feature of polygons.features) {
        if (feature.geometry.type === 'Polygon') {
          if (isPointInPolygon(coords, feature.geometry.coordinates[0])) {
            isInside = true;
            break;
          }
        }
      }
    }

    if (!isInside && polygons) { // Если полигоны загрузились, но не попали
      set({
        courierMarker: null,
        addressError: 'Выбранная точка находится вне зоны курьерской доставки.',
        courierAddress: 'Вне зоны доставки'
      });
      return;
    }

    // 2. Геокодинг (координаты -> адрес)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&accept-language=ru`);
      const data = await res.json();
      set({ courierAddress: data.display_name || "Адрес на карте" });
    } catch (e) {
      set({ courierAddress: "Адрес на карте" });
    }
  },

  // Ручной поиск адреса
  searchAddressAction: async () => {
    const { courierAddress, polygons } = get();
    if (!courierAddress || courierAddress.length < 3) return;

    set({ isLoading: true, addressError: '' });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(courierAddress)}&accept-language=ru&limit=1`);
      const data = await res.json();

      if (data?.[0]) {
        const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];

        // Проверка зоны для найденного адреса
        let isInside = false;
        if (polygons?.features) {
          for (const feature of polygons.features) {
            if (isPointInPolygon(coords, feature.geometry.coordinates[0])) {
              isInside = true; break;
            }
          }
        }

        if (isInside || !polygons) {
          set({
            courierMarker: { coordinates: coords },
            mapLocation: { center: coords, zoom: 16 }
          });
        } else {
          set({ addressError: "Адрес вне зоны доставки.", mapLocation: { center: coords, zoom: 14 } });
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

  // Расчет цены и подготовка данных для возврата
  calculateAndConfirm: async () => {
    const { courierAddress, selectedCity, courierMarker, addressError, deliveryMode } = get();

    // --- ЛОГИКА ДЛЯ КУРЬЕРА ---
    if (deliveryMode === 'courier') {
      // Проверяем, что адрес выбран
      if (!courierMarker && !courierAddress) return null;
      if (addressError) return null;

      set({ isCalculating: true });
      let finalPrice = 0;

      try {
        // Запрос в службу доставки (Dalli)
        const res = await fetch(`https://wowbox.market/api/get-delivery-price.php?address=${encodeURIComponent(courierAddress)}`);
        const data = await res.json();

        if (data.price && data.price > 0) {
          finalPrice = data.price;
        } else {
          // Если Dalli не вернул цену, берем фоллбэк: Цена города (если есть) или 350 + 180 (курьерская наценка)
          finalPrice = (selectedCity.price || 350) + 180;
        }
      } catch (e) {
        console.error("Ошибка расчета курьерской доставки", e);
        finalPrice = (selectedCity.price || 350) + 180;
      } finally {
        set({ isCalculating: false });
      }

      return {
        price: finalPrice,
        address: courierAddress,
        cityFias: selectedCity.fias,
        cityName: selectedCity.name,
        mode: 'courier'
      };
    }

    // --- ЛОГИКА ДЛЯ ПВЗ (PICKUP) ---
    else if (deliveryMode === 'pickup') {
      // Для ПВЗ нам важен только город (FIAS)
      set({ isCalculating: true });
      let finalPrice = 0;

      try {
        // Запрашиваем цену из нашего массива тарифов
        const fiasQuery = selectedCity.fias ? `?fias=${selectedCity.fias}` : '';
        const res = await fetch(`https://wowbox.market/api/get-pickup-price.php${fiasQuery}`);
        const data = await res.json();

        finalPrice = data.price; // Получаем точную цену из массива PHP
      } catch (e) {
        console.error("Ошибка расчета доставки в ПВЗ", e);
        finalPrice = 350; // Дефолт
      } finally {
        set({ isCalculating: false });
      }

      return {
        price: finalPrice,
        address: "", // Адрес ПВЗ передастся отдельно через selectedPoint, здесь он не обязателен для расчета цены
        cityFias: selectedCity.fias,
        cityName: selectedCity.name,
        mode: 'pickup'
      };
    }

    return null;
  }
}));