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
  isCheckingPromo: false,

  // --- ACTIONS ---

  // Сброс формы
  resetForm: () => set({
    formData: { ...initialFormData },
    errors: {},
    isProcessing: false,
    deliveryPrice: 0,
    promoApplied: false,
    promoStatus: null,
    promoMessage: "",
    isCheckingPromo: false
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
      // 1. Проверка на известный промокод (если он единственный)
      if (promoCode !== "ПЕРВЫЙ500") {
        set({ 
          promoStatus: 'error', 
          promoMessage: "Промокод не найден или истек",
          isCheckingPromo: false
        });
        return;
      }
      
      // 2. Валидация входных данных для CRM-проверки
      if (!formData.email.trim() && formData.phone.length < 12) {
           set({ 
              promoStatus: 'error', 
              promoMessage: "Для проверки промокода введите Email или Телефон",
              isCheckingPromo: false
            });
          return;
      }

      // 3. Асинхронный запрос для проверки использования в CRM
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
        // Промокод уже использован
        set({ 
          promoApplied: false, 
          promoStatus: 'error', 
          promoMessage: data.message || "Промокод уже был использован данным клиентом",
          isCheckingPromo: false 
        });
      } else if (data.status === 'ok' && data.used === false) {
        // Промокод не использован и валиден
        set({ 
          promoApplied: true, 
          promoStatus: 'success', 
          promoMessage: "Промокод успешно применен!",
          isCheckingPromo: false 
        });
      } else {
        // Ошибка API или непредвиденный ответ
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