import { create } from 'zustand';
import { useOrderStore } from './orderStore';
// Статические данные боксов (чтобы они были доступны в сторе для логики рекомендаций)
// Можно вынести в отдельный файл src/data/boxes.js, но пока оставим здесь или импортируем, если они есть отдельно.
import selectYourOwnWowboxCardImg1 from "../assets/images/selectYourOwnWowboxCardImg1.webp";
import selectYourOwnWowboxCardImg2 from "../assets/images/selectYourOwnWowboxCardImg2.webp";
import selectYourOwnWowboxCardImg3 from "../assets/images/selectYourOwnWowboxCardImg3.webp";
import selectYourOwnWowboxCardImg4 from "../assets/images/selectYourOwnWowboxCardImg4.webp";

export const BOXES_DATA = [
  {
    id: "techno",
    image: selectYourOwnWowboxCardImg1,
    title: "ТЕХНО БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Для тех, кто любит современные гаджеты и полезные устройства. Внутри — практичные технологичные штуки, которые облегчают жизнь и реально радуют каждый день",
    details: {
      items: ["Фирменная теника", "Полезные гаджеты"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 120,000₽",
    },
  },
  {
    id: "cozy",
    image: selectYourOwnWowboxCardImg2,
    title: "УЮТНЫЙ БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Идеален для тех, кто ценит тепло, комфорт и атмосферу «домашнего блаженства». Пледы, свечи, вкусный чай — всё, чтобы замедлиться и насладиться моментом",
    details: {
      items: ["Предметы для атмосферы", "Элементы домашнего декора", "Сертификаты в СПА и массажи"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 120,000₽",
    },
  },
  {
    id: "party",
    image: selectYourOwnWowboxCardImg3,
    title: "ПАТИ БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Для тех, кто любит веселье, активность и неожиданные развлечения. Внутри — яркие предметы для хорошего настроения, игр и лёгкого праздника в любой день",
    details: {
      items: ["Развлечения и игры", "Предметы крутого пати", "Сертификаты на эвенты"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 120,000₽",
    },
  },
  {
    id: "sweet",
    image: selectYourOwnWowboxCardImg4,
    title: "СЛАДКИЙ БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Для тех, кто обожает вкусности, шоколад и маленькие гастрономические удовольствия. Полезно? Может быть нет. Вкусно и радостно? Абсолютно да",
    details: {
      items: ["Премиум сладости", "Сертификаты в кодитерские", "Разные предметы чтобы не слиплось"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 120,000₽",
    },
  },
];

// Функция для маппинга ID квиза в нужные строковые значения
const getQuizAnswerValue = (questionIndex, answerId) => {
  // Mapping for Question 0 (Recipient) -> Full Title String
  if (questionIndex === 0) {
    const map = {
      "self": "Для себя",
      "partner": "Для партнёра",
      "friend": "Для друга",
      "colleague": "Для коллеги",
      "relative": "Для родственника",
    };
    return map[answerId] || "Не указано";
  }
  // Mapping for Question 1 (Gender) -> Internal ID ("female", "male", "not-important")
  if (questionIndex === 1) {
    const map = {
      "woman": "female",
      "man": "male",
      "other": "not-important",
    };
    return map[answerId] || "not-important";
  }
  return answerId;
};

export const useBoxStore = create((set, get) => ({
  // --- STATE ---
  selectedTheme: "techno", // Текущий выбранный бокс
  personalizationData: null, // Данные после этапа персонализации
  selectedPrice: 5000,
  priceSteps: [3000,
    4000,
    5000,
    8000,
    11000,
    14000,
    17000,
    20000,
    25000,
    30000,
    35000,
    40000,
    45000,
    50000,
    60000,
    70000,
    80000,
    90000,
    100000,
    110000,
    120000],
  // Модальные окна (видимость)
  isPersonalizationOpen: false,
  isOrderModalOpen: false,

  // Квиз
  quizAnswers: {},
  currentQuestionIndex: 0,

  // НОВОЕ: Флаг для пропуска первых шагов персонализации после квиза
  skipInitialPersonalizationSteps: false,

  // --- ACTIONS ---
  fetchPricing: async () => {
    set({ isLoadingPricing: true });
    try {
      // Замените URL на ваш реальный домен, если нужно
      const response = await fetch('https://wowbox.market/api/get-pricing.php');
      if (!response.ok) throw new Error("Failed to fetch pricing");

      const data = await response.json();

      // Обновляем данные в этом сторе
      set({
        priceSteps: data.priceSteps || [3000, 5000, 8000, 15000, 120000],
        serverDeliveryPrice: data.defaultDelivery || 350,
        isLoadingPricing: false
      });

      // СРАЗУ обновляем базовую доставку в OrderStore, чтобы синхронизировать данные
      useOrderStore.getState().setDeliveryPrice(data.defaultDelivery || 350);

    } catch (error) {
      console.error("Pricing fetch error:", error);
      set({ isLoadingPricing: false });
    }
  },
  // Выбор бокса (из карусели или квиза)
  selectTheme: (themeId) => set({ selectedTheme: themeId }),
  // НОВОЕ: Экшен для установки цены
  setSelectedPrice: (price) => set({ selectedPrice: price }),

  setBoxPrice: (price) => set({ boxPrice: price }),
  // Управление персонализацией
  openPersonalization: () => set({ isPersonalizationOpen: true }),
  closePersonalization: () => set({ isPersonalizationOpen: false }),

  // Сохранение персонализации и переход к заказу
  savePersonalization: (data) => {
    const { quizAnswers } = get();

    // Если в персонализации сменили тему, обновляем и её
    if (data?.theme) {
      set({ selectedTheme: data.theme });
    }

    // Объединяем персонализацию (шаги 1-4) с ответами квиза
    const mergedData = {
      ...data,
      quiz: quizAnswers // Добавляем ответы квиза под ключом 'quiz'
    };

    set({
      personalizationData: mergedData,
      isPersonalizationOpen: false,
      isOrderModalOpen: true
    });
  },

  // Управление окном заказа
  openOrderModal: () => set({ isOrderModalOpen: true }),
  closeOrderModal: () => set({ isOrderModalOpen: false }),

  // Возврат к редактированию (из заказа в персонализацию)
  editOrder: () => set({ isOrderModalOpen: false, isPersonalizationOpen: true }),

  // Логика Квиза
  setQuizAnswer: (questionIndex, answerId) => {
    set((state) => ({
      quizAnswers: { ...state.quizAnswers, [questionIndex]: answerId }
    }));
    // Автопереход (можно вызвать в компоненте, но логику храним тут)
  },

  nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  prevQuestion: () => set((state) => ({ currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1) })),

  resetQuiz: () => set({ quizAnswers: {}, currentQuestionIndex: 0 }),

  getRecommendedBox: () => {
    const { quizAnswers } = get();
    const styleAnswer = quizAnswers[2];

    const styleMap = {
      practical: "techno",
      emotions: "cozy",
      quality: "party",
      surprise: "sweet",
    };

    const recommendedId = styleMap[styleAnswer] || "techno";
    return BOXES_DATA.find((b) => b.id === recommendedId) || BOXES_DATA[0];
  },

  // НОВОЕ: Действие для установки флага
  setSkipInitialPersonalization: (skip) => set({ skipInitialPersonalizationSteps: skip }),

  // Применение рекомендации (переход к персонализации с пропуском шагов)
  applyRecommendation: () => {
    const { quizAnswers } = get();
    const box = get().getRecommendedBox();

    // 1. Конвертируем ID в нужные строковые значения
    const quizRecipient = getQuizAnswerValue(0, quizAnswers[0]) || "Не указано";
    const quizGender = getQuizAnswerValue(1, quizAnswers[1]) || "not-important";

    // 2. Предварительно заполняем personalizationData этими ответами
    const initialPersonalData = {
      theme: box.id,
      recipient: quizRecipient, // Теперь это строка-заголовок
      gender: quizGender,       // Теперь это внутренний ID ("female", "male", "not-important")
      restrictions: "Нет",
      additionalWishes: "Нет",
    };

    set({
      selectedTheme: box.id,
      isPersonalizationOpen: true,
      // Устанавливаем флаг, чтобы модалка открылась сразу на Шаге 3
      skipInitialPersonalizationSteps: true,
      // Сохраняем начальные данные, чтобы BoxingPersonalization мог их восстановить
      personalizationData: initialPersonalData,
    });
  }
}));