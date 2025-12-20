import { useState, useEffect } from "react";
import { useBoxStore, BOXES_DATA } from "../../store/boxStore";

import texno1 from "../../assets/images/texno1.webp";
import texno2 from "../../assets/images/texno2.webp";
import texno3 from "../../assets/images/texno3.webp";
import texno4 from "../../assets/images/texno4.webp";

import woman from "../../assets/images/womenIcon.webp";
import man from "../../assets/images/manIcon.webp";
import other from "../../assets/images/other.webp";

import noParfume from "../../assets/images/noParfume.webp";
import noCosmetics from "../../assets/images/no-cosmetic.webp";
import noCandy from "../../assets/images/noCandy.webp";

import weFoundYourSuperWowboxStar from "../../assets/icons/weFoundYourSuperWowboxStar.svg";
import weFoundYourSuperWowboxTwoHeart from "../../assets/icons/weFoundYourSuperWowboxTwoHeart.svg";

import toRight from "../../assets/icons/toRight.svg";

import styles from "./BoxingPersonalization.module.css";

const YM_ID = 99597223;
const reachGoal = (goal) => {
  if (window.ym) {
    window.ym(YM_ID, "reachGoal", goal);
  }
};

const BoxPersonalization = () => {
  // Получаем состояние и методы из глобального стора
  const isOpen = useBoxStore((state) => state.isPersonalizationOpen);
  const onClose = useBoxStore((state) => state.closePersonalization);
  const savePersonalization = useBoxStore((state) => state.savePersonalization);
  const globalSelectedTheme = useBoxStore((state) => state.selectedTheme);
  const selectedPrice = useBoxStore((state) => state.selectedPrice);
  const savedData = useBoxStore((state) => state.personalizationData);

  // Получаем флаг пропуска
  const skipInitialSteps = useBoxStore(
    (state) => state.skipInitialPersonalizationSteps
  );
  const setSkipInitialPersonalization = useBoxStore(
    (state) => state.setSkipInitialPersonalization
  );
  // quizAnswers больше не нужен здесь, так как данные уже в savedData
  // const quizAnswers = useBoxStore((state) => state.quizAnswers);

  // Локальное состояние формы (пока пользователь не нажмет "Сохранить")
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(
    globalSelectedTheme || "techno"
  );

  const [formData, setFormData] = useState({
    recipient: "",
    gender: "",
    restrictions: [],
    additionalWishes: "",
  });

  const [checkboxes, setCheckboxes] = useState({
    noParfume: false,
    noCosmetics: false,
    noCandy: false,
  });

  useEffect(() => {
    if (isOpen && window.dataLayer) {
      const box = BOXES_DATA.find(
        (b) => b.id === (globalSelectedTheme || "techno")
      );
      if (box) {
        window.dataLayer.push({
          ecommerce: {
            currencyCode: "RUB",
            detail: {
              products: [
                {
                  id: box.id,
                  name: box.title,
                  price: selectedPrice,
                  brand: "WOWBOX",
                  category: "Подарочные боксы",
                },
              ],
            },
          },
        });
      }
    }
  }, [isOpen, globalSelectedTheme]);

  // Синхронизация при открытии модального окна
  useEffect(() => {
    if (!isOpen) return;

    // --- 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ ---
    setSelectedTheme(globalSelectedTheme || "techno");

    let startStep = 1;
    let newFormData = {
      recipient: "",
      gender: "",
      restrictions: [],
      additionalWishes: "",
    };
    let newCheckboxes = {
      noParfume: false,
      noCosmetics: false,
      noCandy: false,
    };

    // 2. ЛОГИКА ПРОПУСКА ИЗ КВИЗА: ПРИОРИТЕТ
    if (skipInitialSteps) {
      startStep = 3; // <-- Начинаем строго с шага 3
      setSkipInitialPersonalization(false); // Сбрасываем флаг

      // Данные уже предзаполнены в savedData методом applyRecommendation
      if (savedData) {
        newFormData.recipient = savedData.recipient || "Для себя";
        newFormData.gender = savedData.gender || "not-important";
        newFormData.additionalWishes =
          savedData.additionalWishes === "Нет"
            ? ""
            : savedData.additionalWishes;
      }
    } else if (savedData) {
      // 3. ЛОГИКА ВОССТАНОВЛЕНИЯ (Редактирование или обычный повторный вход)
      startStep = currentStep; // Сохраняем текущий шаг (если редактируем)

      newFormData.recipient = savedData.recipient || "";
      newFormData.gender = savedData.gender || "";
      newFormData.additionalWishes =
        savedData.additionalWishes === "Нет" ? "" : savedData.additionalWishes;

      const restrictionsStr = savedData.restrictions || "";
      newCheckboxes = {
        noParfume: restrictionsStr.includes("Без ароматов"),
        noCosmetics: restrictionsStr.includes("Без косметики"),
        noCandy: restrictionsStr.includes("Без сладкого"),
      };
    } else {
      // 4. Полный сброс для обычного старта с Шага 1
      newFormData = {
        recipient: "",
        gender: "",
        restrictions: [],
        additionalWishes: "",
      };
      newCheckboxes = { noParfume: false, noCosmetics: false, noCandy: false };
    }

    // 5. Установка финального состояния
    setCurrentStep(startStep);
    setFormData(newFormData);
    setCheckboxes(newCheckboxes);
  }, [
    isOpen,
    globalSelectedTheme,
    savedData,
    skipInitialSteps,
    setSkipInitialPersonalization,
  ]);

  const handleNext = () => {
    if (currentStep === 2 && !formData.gender) return;

    // Метрика при переходе
    if (currentStep === 2) {
      // Переход с шага 2 на 3 - значит шаг 2 (Пол) завершен
      reachGoal("pers_q2_completed");
    }
    if (currentStep === 3) {
      // Переход с шага 3 на 4 - значит шаг 3 (Ограничения) завершен
      reachGoal("pers_q3_completed");
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setFormData({ ...formData, recipient });
    reachGoal("pers_q1_completed");
    handleNext();
  };

  const handleGenderSelect = (value) => {
    setFormData({ ...formData, gender: value });
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
  };

  const toggleCheckbox = (key) => {
    setCheckboxes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const pushAddEcommerce = (theme) => {
    const box = BOXES_DATA.find(b => b.id === theme);
    if (window.dataLayer && box) {
        window.dataLayer.push({
            "ecommerce": {
                "currencyCode": "RUB",
                "add": {
                    "products": [
                        {
                            "id": box.id,
                            "name": box.title,
                            "price": selectedPrice,
                            "brand": "WOWBOX",
                            "category": "Подарочные боксы",
                            "quantity": 1
                        }
                    ]
                }
            }
        });
    }
  };

  const handleSave = () => {
    reachGoal("pers_q4_completed");
    pushAddEcommerce(selectedTheme);
    const restrictions = [];
    if (checkboxes.noParfume) restrictions.push("Без ароматов (свечи, парфюм)");
    if (checkboxes.noCosmetics) restrictions.push("Без косметики");
    if (checkboxes.noCandy) restrictions.push("Без сладкого");

    // Используем текущее состояние formData, которое было предзаполнено или заполнено вручную.
    const personalizationData = {
      theme: selectedTheme,
      recipient: formData.recipient || "Не указано",
      gender: formData.gender || "not-important",
      restrictions: restrictions.join(", ") || "Нет",
      additionalWishes: formData.additionalWishes || "Нет",
    };

    // Сохраняем в глобальный стор и переходим к заказу
    savePersonalization(personalizationData);
  };

  const handleSkip = () => {
    reachGoal("pers_skipped");
    savePersonalization({
      theme: selectedTheme,
      recipient: "Для себя",
      gender: "not-important",
      restrictions: "Нет",
      additionalWishes: "Нет",
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>Персонализация бокса</h1>

          <div className={styles.themesRow}>
            <div
              className={`${styles.themeCard} ${
                selectedTheme === "techno" ? styles.themeCardActive : ""
              }`}
              onClick={() => handleThemeSelect("techno")}
            >
              <img
                src={texno1}
                className={styles.themeIcon}
                alt="Theme 1"
                loading="lazy"
              />
              <div className={styles.themeLabel}>ТЕХНО</div>
            </div>
            <div
              className={`${styles.themeCard} ${
                selectedTheme === "party" ? styles.themeCardActive : ""
              }`}
              onClick={() => handleThemeSelect("party")}
            >
              <img
                src={texno2}
                className={styles.themeIcon}
                alt="Theme 3"
                loading="lazy"
              />
              <div className={styles.themeLabel}>ПАТИ</div>
            </div>
            <div
              className={`${styles.themeCard} ${
                selectedTheme === "sweet" ? styles.themeCardActive : ""
              }`}
              onClick={() => handleThemeSelect("sweet")}
            >
              <img
                src={texno3}
                className={styles.themeIcon}
                alt="Theme 4"
                loading="lazy"
              />
              <div className={styles.themeLabel}>СЛАДКИЙ</div>
            </div>
            <div
              className={`${styles.themeCard} ${
                selectedTheme === "cozy" ? styles.themeCardActive : ""
              }`}
              onClick={() => handleThemeSelect("cozy")}
            >
              <img
                src={texno4}
                className={styles.themeIcon}
                alt="Theme 2"
                loading="lazy"
              />
              <div className={styles.themeLabel}>УЮТНЫЙ</div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.stepIndicator}>ВОПРОС {currentStep}/4</div>

          {currentStep === 1 && (
            <>
              <h2 className={styles.question}>Для кого подарок?</h2>
              <div className={styles.optionsList}>
                {/* Если поле уже заполнено ответом из квиза, выделяем его */}
                <button
                  className={`${styles.optionButton} ${
                    formData.recipient === "Для себя"
                      ? styles.optionButtonActive
                      : ""
                  }`}
                  onClick={() => handleRecipientSelect("Для себя")}
                >
                  <span className={styles.optionIcon}>
                    <img
                      src={weFoundYourSuperWowboxStar}
                      alt="weFoundYourSuperWowboxStar"
                      loading="lazy"
                    />
                  </span>
                  <span className={styles.optionText}>Для себя</span>
                </button>
                <button
                  className={`${styles.optionButton} ${
                    formData.recipient === "Для другого человека"
                      ? styles.optionButtonActive
                      : ""
                  }`}
                  onClick={() => handleRecipientSelect("Для другого человека")}
                >
                  <span className={styles.optionIcon}>
                    <img
                      src={weFoundYourSuperWowboxTwoHeart}
                      alt="weFoundYourSuperWowboxTwoHeart"
                    />
                  </span>
                  <span className={styles.optionText}>
                    Для другого человека
                  </span>
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className={styles.question}>Пол получателя</h2>
              <div className={styles.optionsList}>
                <button
                  className={`${styles.optionButton} ${
                    formData.gender === "female"
                      ? styles.optionButtonActive
                      : ""
                  }`}
                  onClick={() => handleGenderSelect("female")}
                >
                  <span className={styles.optionIcon}>
                    <img src={woman} alt="woman" loading="lazy" />
                  </span>
                  <span className={styles.optionText}>Женщина</span>
                </button>
                <button
                  className={`${styles.optionButton} ${
                    formData.gender === "male" ? styles.optionButtonActive : ""
                  }`}
                  onClick={() => handleGenderSelect("male")}
                >
                  <span className={styles.optionIcon}>
                    <img src={man} alt="man" loading="lazy" />
                  </span>
                  <span className={styles.optionText}>Мужчина</span>
                </button>
                <button
                  className={`${styles.optionButton} ${
                    formData.gender === "not-important"
                      ? styles.optionButtonActive
                      : ""
                  }`}
                  onClick={() => handleGenderSelect("not-important")}
                >
                  <span className={styles.optionIcon}>
                    <img src={other} alt="other" loading="lazy" />
                  </span>
                  <span className={styles.optionText}>Не важно</span>
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className={styles.question}>Есть ли ограничения?</h2>
              <div className={styles.optionsList}>
                <button
                  className={`${styles.optionButton} ${
                    checkboxes.noParfume ? styles.optionButtonChecked : ""
                  }`}
                  onClick={() => toggleCheckbox("noParfume")}
                >
                  <span className={styles.optionIcon}>
                    <img src={noParfume} alt="noParfume" loading="lazy" />
                  </span>
                  <span className={styles.optionText}>
                    Без ароматов (свечи, парфюм)
                  </span>
                  <span
                    className={`${styles.checkmark} ${
                      checkboxes.noParfume ? styles.checked : ""
                    }`}
                  >
                    ✓
                  </span>
                </button>
                <button
                  className={`${styles.optionButton} ${
                    checkboxes.noCosmetics ? styles.optionButtonChecked : ""
                  }`}
                  onClick={() => toggleCheckbox("noCosmetics")}
                >
                  <span className={styles.optionIcon}>
                    <img src={noCosmetics} alt="noCosmetics" loading="lazy" />
                  </span>
                  <span className={styles.optionText}>Без косметики</span>
                  <span
                    className={`${styles.checkmark} ${
                      checkboxes.noCosmetics ? styles.checked : ""
                    }`}
                  >
                    ✓
                  </span>
                </button>
                <button
                  className={`${styles.optionButton} ${
                    checkboxes.noCandy ? styles.optionButtonChecked : ""
                  }`}
                  onClick={() => toggleCheckbox("noCandy")}
                >
                  <span className={styles.optionIcon}>
                    <img src={noCandy} alt="noCandy" loading="lazy" />
                  </span>
                  <span className={styles.optionText}>Без сладкого</span>
                  <span
                    className={`${styles.checkmark} ${
                      checkboxes.noCandy ? styles.checked : ""
                    }`}
                  >
                    ✓
                  </span>
                </button>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <h2 className={styles.question}>Дополнительные пожелания</h2>
              <textarea
                className={styles.textarea}
                placeholder="Напишите дополнительные пожелания..."
                value={formData.additionalWishes}
                onChange={(e) =>
                  setFormData({ ...formData, additionalWishes: e.target.value })
                }
              />
            </>
          )}
        </div>

        <div className={styles.footer}>
          {currentStep === 1 ? (
            <button className={styles.skipButton} onClick={handleSkip}>
              Пропустить персонализацию
            </button>
          ) : currentStep === 4 ? (
            <>
              <button className={styles.backButton} onClick={handleBack}>
                <img
                  src={toRight}
                  alt="back"
                  className={styles.backArrow}
                  loading="lazy"
                />
                <span>Назад</span>
              </button>
              <button className={styles.nextButton} onClick={handleSave}>
                Сохранить
              </button>
            </>
          ) : (
            <>
              <button className={styles.backButton} onClick={handleBack}>
                <img
                  src={toRight}
                  alt="back"
                  className={styles.backArrow}
                  loading="lazy"
                />
                <span>Назад</span>
              </button>
              <button
                className={styles.nextButton}
                onClick={handleNext}
                disabled={currentStep === 2 && !formData.gender}
              >
                Далее
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoxPersonalization;
