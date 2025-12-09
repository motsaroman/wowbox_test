import { create } from 'zustand';

const initialFormData = {
  name: "",
  phone: "+7 ",
  email: "",
  telegramNotify: false,
  telegramUsername: "",
  isGift: false,
  recipientName: "",
  recipientPhone: "+7 ",
  comment: "",
  deliveryType: "5post",
  pvzCode: "",
  city: "Москва",
  cityFias: null,
  deliveryPoint: "",
  deliveryAddress: "",
  apartment: "",
  entrance: "",
  floor: "",
  courierComment: "",
  paymentMethod: "sbp",
  promoCode: "",
  acceptTerms: false,
  receiveNews: false,
};

export const useOrderStore = create((set, get) => ({
  // --- STATE ---
  formData: { ...initialFormData },
  errors: {},
  isProcessing: false,

  // Цены и Промокод
  deliveryPrice: 0,
  baseDeliveryPrice: 0,
  boxPrice: 4900,
  promoApplied: false,
  promoStatus: null,
  promoMessage: "",
  isCheckingPromo: false,

  freeShippingMessage: "",

  // --- ACTIONS ---

  resetForm: () => set({
    formData: { ...initialFormData },
    errors: {},
    isProcessing: false,
    deliveryPrice: 0,
    baseDeliveryPrice: 0,
    promoApplied: false,
    promoStatus: null,
    promoMessage: "",
    isCheckingPromo: false,
    freeShippingMessage: ""
  }),

  setField: (name, value) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[name];

      if (name === 'promoCode') {
        return {
          formData: { ...state.formData, [name]: value },
          errors: newErrors,
          promoStatus: null,
          promoMessage: "",
          promoApplied: false
        };
      }

      return {
        formData: { ...state.formData, [name]: value },
        errors: newErrors
      };
    });

    if (name === 'email' || name === 'phone') {
      get().checkFreeShipping();
    }
  },

  setPhone: (name, value) => {
    // 1. Оставляем только цифры
    let raw = value.replace(/\D/g, "");

    // 2. Обработка начала номера (если начали с 8 или пусто)
    if (raw.startsWith('8')) {
      raw = '7' + raw.slice(1);
    }

    if (!raw.startsWith('7')) {
      raw = '7' + raw;
    }
    if (raw.length > 11) {
      raw = raw.slice(0, 11);
    }

    const numbersAfter7 = raw.slice(1);
    const formatted = "+7 " + numbersAfter7;

    get().setField(name, formatted);
  },

  setDeliveryPrice: (price) => set({ deliveryPrice: price, baseDeliveryPrice: price }),

  updateDelivery: (data) => {
    set((state) => {
      const isPickup = data.mode === "pickup";

      let newPrice = 0;
      if (isPickup) {
        const base = data.point?.price || 0;
        newPrice = base > 0 ? base + 0 : 0;
      } else {
        const base = data.price || 0;
        newPrice = base > 0 ? base + 180 : 0;
      }

      return {
        deliveryPrice: newPrice,
        baseDeliveryPrice: newPrice,
        formData: {
          ...state.formData,
          deliveryType: isPickup ? "5post" : "courier",
          cityFias: data.cityFias,
          city: data.cityName || state.formData.city,

          deliveryPoint: isPickup ? `${data.point.address} (${data.point.name})` : "",
          pvzCode: isPickup ? data.point.id : "",

          deliveryAddress: !isPickup ? data.address : "",
          apartment: !isPickup ? (data.apartment || "") : "",
          entrance: !isPickup ? (data.entrance || "") : "",
          floor: !isPickup ? (data.floor || "") : "",
          courierComment: !isPickup ? (data.comment || "") : "",
        },
        errors: { ...state.errors, delivery: null }
      };
    });

    get().checkFreeShipping();
  },

  // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ПРОВЕРКИ ---
  checkFreeShipping: async () => {
    const { formData, baseDeliveryPrice } = get();

    let addressToCheck = "";

    if (formData.deliveryType === '5post') {
      // Достаем название точки
      const pointName = formData.deliveryPoint.split('(')[1]?.replace(')', '') || '';

      // [ВАЖНО] Добавляем город (formData.city) к строке проверки
      // Формат: "Город, ПВЗ 5Post: Название"
      // Это позволит PHP скрипту найти совпадение по частичному вхождению
      if (pointName) {
        addressToCheck = `${formData.city}, ПВЗ 5Post: ${pointName}`;
      }
    } else {
      addressToCheck = formData.deliveryAddress;
    }

    const hasEmail = formData.email && formData.email.includes('@');
    const hasPhone = formData.phone && formData.phone.length >= 12;

    if (!addressToCheck || addressToCheck.trim() === 'ПВЗ 5Post:' || (!hasEmail && !hasPhone)) {
      if (get().deliveryPrice !== baseDeliveryPrice) {
        set({
          deliveryPrice: baseDeliveryPrice,
          freeShippingMessage: ""
        });
      }
      return;
    }

    try {
      const res = await fetch('https://wowbox.market/api/check-free-shipping.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          address: addressToCheck,
          date: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();

      if (data.isFree) {
        set({
          deliveryPrice: 0,
          freeShippingMessage: data.message || "Бесплатная доставка за повторный заказ!"
        });
      } else {
        set({
          deliveryPrice: baseDeliveryPrice,
          freeShippingMessage: ""
        });
      }
    } catch (e) {
      console.error("Check free shipping error:", e);
      set({
        deliveryPrice: baseDeliveryPrice,
        freeShippingMessage: ""
      });
    }
  },

  applyPromo: async () => {
    const { formData, promoApplied } = get();
    if (promoApplied) return;
    const promoCode = formData.promoCode.toUpperCase().trim();

    if (!promoCode) return;

    set({
      isCheckingPromo: true,
      promoApplied: false,
      promoStatus: null,
      promoMessage: ""
    });

    try {
      if (promoCode !== "ПЕРВЫЙ500") {
        set({
          promoStatus: 'error',
          promoMessage: "Промокод не найден или истек",
          isCheckingPromo: false
        });
        return;
      }

      if (!formData.email.trim() && formData.phone.length < 12) {
        set({
          promoStatus: 'error',
          promoMessage: "Для проверки промокода введите Email или Телефон",
          isCheckingPromo: false
        });
        return;
      }

      const response = await fetch(`https://wowbox.market/api/check-promo-usage.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: promoCode,
          email: formData.email.trim(),
          phone: formData.phone.length > 5 ? formData.phone : null,
        }),
      });

      const data = await response.json();

      if (data.status === 'ok' && data.used === true) {
        set({
          promoApplied: false,
          promoStatus: 'error',
          promoMessage: data.message || "Промокод уже был использован данным клиентом",
          isCheckingPromo: false
        });
      } else if (data.status === 'ok' && data.used === false) {
        set({
          promoApplied: true,
          promoStatus: 'success',
          promoMessage: "Промокод успешно применен!",
          isCheckingPromo: false
        });
      } else {
        set({
          promoApplied: false,
          promoStatus: 'error',
          promoMessage: "Ошибка сервера при проверке промокода. Попробуйте позже.",
          isCheckingPromo: false
        });
      }

    } catch (e) {
      console.error("Promo check failed:", e);
      set({
        promoApplied: false,
        promoStatus: 'error',
        promoMessage: "Ошибка сети. Проверьте соединение.",
        isCheckingPromo: false
      });
    }
  },

  validateForm: () => {
    const { formData } = get();
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = "Введите ваше имя"; isValid = false; }

    // Валидация телефона (длина должна быть строго 13 символов: "+7 " + 10 цифр)
    // Либо проверяем только цифры: 7 + 10 = 11 цифр
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 11) {
      newErrors.phone = "Введите 10 цифр номера";
      isValid = false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) { newErrors.email = "Введите корректный email"; isValid = false; }

    // Валидация Telegram
    if (formData.telegramNotify) {
      if (!formData.telegramUsername.trim()) {
        newErrors.telegramUsername = "Укажите ваш никнейм";
        isValid = false;
      } else {
        const tgRegex = /^[a-zA-Z0-9_]{1,20}$/;
        if (!tgRegex.test(formData.telegramUsername.replace('@', ''))) {
          newErrors.telegramUsername = "Только латиница, цифры и _, макс 20 символов";
          isValid = false;
        }
      }
    }

    if (formData.deliveryType === '5post' && !formData.pvzCode) {
      newErrors.delivery = "Выберите пункт выдачи на карте"; isValid = false;
    }
    if (formData.deliveryType === 'courier' && !formData.deliveryAddress) {
      newErrors.delivery = "Укажите адрес доставки на карте"; isValid = false;
    }

    if (formData.isGift) {
      if (!formData.recipientName.trim()) { newErrors.recipientName = "Укажите имя получателя"; isValid = false; }

      // Валидация телефона получателя
      const cleanRecipientPhone = formData.recipientPhone.replace(/\D/g, "");
      if (cleanRecipientPhone.length !== 11) {
        newErrors.recipientPhone = "Введите 10 цифр номера";
        isValid = false;
      }
    }

    if (!formData.acceptTerms) { newErrors.terms = "Необходимо согласие"; isValid = false; }

    set({ errors: newErrors });
    return isValid;
  },

  setProcessing: (status) => set({ isProcessing: status }),
}));