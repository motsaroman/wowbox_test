import { create } from 'zustand';

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
    description: "Для тех, кто любит современные гаджеты...",
    details: {
      items: ["<strong>3-4</strong> полезных гаджета", "<strong>4-5</strong> приятных техно-сюрпризов", "<strong>2-3</strong> новогодняя атмосфера"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
  },
  {
    id: "cozy",
    image: selectYourOwnWowboxCardImg2,
    title: "УЮТНЫЙ БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Идеален для тех, кто ценит тепло, комфорт...",
    details: {
      items: ["<strong>3-4</strong> предмета для атмосферы", "<strong>4-5</strong> товара создающих уют и комфорт", "<strong>2-3</strong> элемента домашнего декора"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
  },
  {
    id: "party",
    image: selectYourOwnWowboxCardImg3,
    title: "ПАТИ БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Для тех, кто любит веселье, активность...",
    details: {
      items: ["<strong>2-3</strong> развлечения и игры", "<strong>4-5</strong> для крутого пати", "<strong>3-4</strong> для новогодней тусовки"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
  },
  {
    id: "sweet",
    image: selectYourOwnWowboxCardImg4,
    title: "СЛАДКИЙ БОКС",
    price: "4900₽",
    priceValue: 4900,
    description: "Для тех, кто обожает вкусности...",
    details: {
      items: ["<strong>5-6</strong> уникальных сладких радостей", "<strong>2-3</strong> новогодние вкусняшки", "<strong>2-3</strong> предмета чтобы не слиплось"],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
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
  
  // Модальные окна (видимость)
  isPersonalizationOpen: false,
  isOrderModalOpen: false,

  // Квиз
  quizAnswers: {},
  currentQuestionIndex: 0,
  
  // НОВОЕ: Флаг для пропуска первых шагов персонализации после квиза
  skipInitialPersonalizationSteps: false, 

  // --- ACTIONS ---

  // Выбор бокса (из карусели или квиза)
  selectTheme: (themeId) => set({ selectedTheme: themeId }),

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