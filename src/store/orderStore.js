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
  boxPrice: 4900,
  promoApplied: false,
  promoStatus: null, // 'success' | 'error' | null
  promoMessage: "",

  // --- ACTIONS ---

  // Сброс формы
  resetForm: () => set({
    formData: { ...initialFormData },
    errors: {},
    isProcessing: false,
    deliveryPrice: 0,
    promoApplied: false,
    promoStatus: null,
    promoMessage: ""
  }),

  // Обновление поля
  setField: (name, value) => set((state) => {
    const newErrors = { ...state.errors };
    delete newErrors[name]; // Сбрасываем ошибку поля при вводе

    // Спец. логика для промокода (сброс статуса при редактировании)
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
  }),

  // Маска телефона
  setPhone: (name, value) => {
    let formatted = value;
    if (!formatted.startsWith("+7 ")) formatted = "+7 ";
    get().setField(name, formatted);
  },

  setDeliveryPrice: (price) => set({ deliveryPrice: price }),


  updateDelivery: (data) => set((state) => {
    const isPickup = data.mode === "pickup";

    // 1. РАСЧЕТ ЦЕНЫ С НАЦЕНКАМИ
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
      formData: {
        ...state.formData,
        deliveryType: isPickup ? "5post" : "courier",
        cityFias: data.cityFias,
        city: data.cityName || state.formData.city,

        // Если ПВЗ
        deliveryPoint: isPickup ? `${data.point.address} (${data.point.name})` : "",
        pvzCode: isPickup ? data.point.id : "",

        // Если Курьер
        deliveryAddress: !isPickup ? data.address : "",
        apartment: !isPickup ? (data.apartment || "") : "",
        entrance: !isPickup ? (data.entrance || "") : "",
        floor: !isPickup ? (data.floor || "") : "",
        courierComment: !isPickup ? (data.comment || "") : "",
      },
      errors: { ...state.errors, delivery: null } // Сбрасываем ошибку доставки
    };
  }),

  // Проверка промокода
  applyPromo: () => {
    const { formData } = get();
    if (!formData.promoCode) return;

    if (formData.promoCode.toUpperCase() === "ПЕРВЫЙ500") {
      set({ promoApplied: true, promoStatus: 'success', promoMessage: "Промокод успешно применен!" });
    } else {
      set({ promoApplied: false, promoStatus: 'error', promoMessage: "Промокод не найден или истек" });
    }
  },

  // Валидация
  validateForm: () => {
    const { formData } = get();
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = "Введите ваше имя"; isValid = false; }
    if (!formData.phone || formData.phone.length < 12) { newErrors.phone = "Введите корректный телефон"; isValid = false; }
    if (!formData.email.trim() || !formData.email.includes('@')) { newErrors.email = "Введите корректный email"; isValid = false; }
    if (formData.telegramNotify && !formData.telegramUsername.trim()) {
      newErrors.telegramUsername = "Укажите ваш никнейм";
      isValid = false;
    }
    if (formData.deliveryType === '5post' && !formData.pvzCode) {
      newErrors.delivery = "Выберите пункт выдачи на карте"; isValid = false;
    }
    if (formData.deliveryType === 'courier' && !formData.deliveryAddress) {
      newErrors.delivery = "Укажите адрес доставки на карте"; isValid = false;
    }

    if (formData.isGift) {
      if (!formData.recipientName.trim()) { newErrors.recipientName = "Укажите имя получателя"; isValid = false; }
      if (!formData.recipientPhone || formData.recipientPhone.length < 12) { newErrors.recipientPhone = "Укажите телефон получателя"; isValid = false; }
    }

    if (!formData.acceptTerms) { newErrors.terms = "Необходимо согласие"; isValid = false; }

    set({ errors: newErrors });
    return isValid;
  },

  setProcessing: (status) => set({ isProcessing: status }),
}));