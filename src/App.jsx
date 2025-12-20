import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useBoxStore, BOXES_DATA } from "./store/boxStore";
import { useUIStore } from "./store/uiStore";
import { useOrderStore } from "./store/orderStore";
// Компоненты
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import BoxesCarousel from "./components/BoxesCarousel/BoxesCarousel.jsx";
import PromoPopup from "./components/PromoPopup/PromoPopup.jsx";
import TelegramChat from "./components/TelegramChat/TelegramChat.jsx";
import BoxingPersonalization from "./components/BoxPersonalization/BoxingPersonalization.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy.jsx";
import PublicOffer from "./components/PublicOffer/PublicOffer.jsx";
import PainAndSolution from "./components/PainAndSolution/PainAndSolution.jsx";
import ImageContainerBlock from "./components/ImageContainerBlock/ImageContainerBlock.jsx";
// Модалки
import OrderModal from "./components/OrderModal/OrderModal.jsx";
import DeliveryModal from "./components/DeliveryModal/DeliveryModal.jsx";
import SmsModal from "./components/SmsModal/SmsModal.jsx";
import PaymentResultModal from "./components/PaymentResultModal/PaymentResultModal.jsx";
import BankSelectionModal from "./components/BankSelectionModal/BankSelectionModal.jsx";
import PaymentWaitingModal from "./components/PaymentWaitingModal/PaymentWaitingModal.jsx";
import toRight from "./assets/icons/toRight.svg";
import { quizData } from "./data/quizData.js";
import { faqData } from "./data/faqData.js";

import styles from "./App.module.css";
import QualitySection from "./components/QualitySection/QualitySection.jsx";
import DeliverySection from "./components/DeliverySection/DeliverySection.jsx";
import HowItWorksSection from "./components/HowItWorksSection/HowItWorksSection.jsx";

const YM_ID = 105562569;

const reachGoal = (goal) => {
  if (window.ym) {
    window.ym(YM_ID, "reachGoal", goal);
    console.log(`Goal reached: ${goal}`);
  }
};

const LABELS_TO_SHOW = [3000, 5000, 20000, 50000, 120000];

export default function App() {
  const navigate = useNavigate();

  const {
    currentQuestionIndex,
    setQuizAnswer,
    nextQuestion,
    prevQuestion: prevQuestionAction,
    resetQuiz: resetQuizAction,
    getRecommendedBox,
    applyRecommendation,
    priceSteps,
    fetchPricing,
    selectedPrice,
    setSelectedPrice,
  } = useBoxStore();

  const {
    openFaqIndex,
    toggleFaq: toggleFaqAction,

    // Состояния для модальных окон
    isDeliveryModalOpen,
    setDeliveryModalOpen,
    isSmsModalOpen,
    setSmsModalOpen,
    isPaymentResultModalOpen,
    setPaymentResultModalOpen,
    isBankSelectionModalOpen,
    setBankSelectionModalOpen,
    isPaymentWaitingModalOpen,
    setPaymentWaitingModalOpen,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  } = useUIStore();

  const setOrderBoxPrice = useOrderStore((state) => state.setBoxPrice);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const foundIndex = priceSteps.indexOf(selectedPrice);
  const priceIndex = foundIndex !== -1 ? foundIndex : 1;

  // 3. Расчеты для отображения
  const currentPrice = priceSteps[priceIndex] || 5000;
  const maxTotalValue = currentPrice + 3000;
  const savings = Math.round(currentPrice * 0.4);
  const max = Math.max(0, priceSteps.length - 1);
  const percentage = (priceIndex / max) * 100;

  const sliderStyle = {
    background: `linear-gradient(to right, #93d3e1 0%, #93d3e1 ${percentage}%, #e2e1df ${percentage}%, #e2e1df 100%)`,
  };
  const scrollToWowbox = () => {
    const element = document.querySelector(`.${styles.selectYourOwnWowbox}`);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuizAnswer = (answerId) => {
    // Отправляем цель в зависимости от номера вопроса (index + 1)
    const goalMap = {
      0: "quiz_q1_completed",
      1: "quiz_q2_completed",
      2: "quiz_q3_completed",
      3: "quiz_q4_completed",
    };
    if (goalMap[currentQuestionIndex]) {
      reachGoal(goalMap[currentQuestionIndex]);
    }

    setQuizAnswer(currentQuestionIndex, answerId);
    setTimeout(nextQuestion, 300);
  };

  const prevQuestion = () => {
    reachGoal("quiz_back");
    prevQuestionAction();
  };
  const resetQuiz = () => {
    reachGoal("quiz_restart");
    resetQuizAction();
  };

  const handleSliderChange = (e) => {
    const newIndex = Number(e.target.value);
    const newPrice = priceSteps[newIndex];

    // Обновляем оба стора сразу при движении
    setSelectedPrice(newPrice);
    setOrderBoxPrice(newPrice);
  };
  const handleQuizOrder = () => {
    reachGoal("buy_after_quiz");
    const box = BOXES_DATA.find((b) => b.title === recommendedBox.title);
    if (window.dataLayer && box) {
      window.dataLayer.push({
        ecommerce: {
          currencyCode: "RUB",
          add: {
            products: [
              {
                id: box.id,
                name: box.title,
                price: selectedPrice,
                brand: "WOWBOX",
                category: "Подарочные боксы",
                quantity: 1,
                list: "Результаты квиза",
              },
            ],
          },
        },
      });
    }
    applyRecommendation();
  };

  const toggleFaq = (index) => {
    // Если мы открываем (а не закрываем), шлем цель
    if (openFaqIndex !== index) {
      reachGoal("faq_opened");
    }
    toggleFaqAction(index);
  };

  const recommendedBox = getRecommendedBox();
  useEffect(() => {
    if (currentQuestionIndex >= quizData.length && window.dataLayer) {
      const box = BOXES_DATA.find((b) => b.title === recommendedBox.title); // Находим бокс по title, т.к. recommendedBox это объект
      if (box) {
        window.dataLayer.push({
          ecommerce: {
            currencyCode: "RUB",
            detail: {
              products: [
                {
                  id: box.id,
                  name: box.title,
                  price: selectedPrice, // Цена из ползунка
                  brand: "WOWBOX",
                  category: "Подарочные боксы",
                  list: "Результаты квиза",
                },
              ],
            },
          },
        });
      }
    }
  }, [currentQuestionIndex, selectedPrice]);

  return (
    <Routes>
      <Route
        path="/privacy"
        element={<PrivacyPolicy isOpen={true} onClose={() => navigate("/")} />}
      />
      <Route
        path="/public-offer"
        element={<PublicOffer isOpen={true} onClose={() => navigate("/")} />}
      />
      <Route
        path="/"
        element={
          <>
            <PromoPopup />
            <TelegramChat />
            <Header />

            <main>
              {/*Секция Боль и Решение*/}
              <PainAndSolution />
              <ImageContainerBlock />
              {/* Секция выбора бокса (Карусель) */}
              <div className={styles.selectYourOwnWowbox}>
                <h1>Выберите свой WOWBOX</h1>
                <BoxesCarousel />
              </div>

              {/* Секция Квиза */}
              <div id="quiz" className={styles.weFoundYourSuperWowbox}>
                <div className={styles.quizContainer}>
                  <h2>
                    Найдём ваш идеальный
                    <br />
                    WOWBOX за 30 секунд
                  </h2>
                  <p className={styles.quizSubtitle}>
                    Ответьте на 4 вопроса - мы подберём бокс,
                    <br />
                    который точно вам подойдёт
                  </p>

                  <div className={styles.quizBox}>
                    <div className={styles.quizHeader}>
                      {/* Индикатор прогресса */}
                      {currentQuestionIndex < quizData.length && (
                        <div className={styles.progressDots}>
                          {quizData.map((_, index) => (
                            <span
                              key={index}
                              className={
                                currentQuestionIndex === index
                                  ? styles.active
                                  : ""
                              }
                            ></span>
                          ))}
                        </div>
                      )}

                      {/* Заголовок вопроса или результата */}
                      {currentQuestionIndex < quizData.length ? (
                        <>
                          <p className={styles.questionLabel}>
                            ВОПРОС {currentQuestionIndex + 1}/{quizData.length}:
                          </p>
                          <h3 className={styles.questionTitle}>
                            {quizData[currentQuestionIndex].question}
                          </h3>
                        </>
                      ) : (
                        <h3 className={styles.resultsTitle}>
                          Ваш идеальный бокс:
                        </h3>
                      )}
                    </div>

                    {/* Тело Квиза */}
                    {currentQuestionIndex < quizData.length ? (
                      <>
                        <div className={styles.quizOptions}>
                          {quizData[currentQuestionIndex].options.map(
                            (option) => (
                              <div
                                key={option.id}
                                className={styles.quizOption}
                                onClick={() => handleQuizAnswer(option.id)}
                              >
                                <img
                                  className={styles.optionIcon}
                                  src={option.icon}
                                  alt={option.title}
                                  loading="lazy"
                                />
                                <div className={styles.optionText}>
                                  <p className={styles.optionTitle}>
                                    {option.title}
                                  </p>
                                  {option.subtitle && (
                                    <p className={styles.optionSubtitle}>
                                      {option.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <div className={styles.quizActions}>
                          {currentQuestionIndex > 0 && (
                            <button
                              className={styles.quizBackButton}
                              onClick={prevQuestion}
                            >
                              <img src={toRight} alt="toRight" loading="lazy" />
                              <span>Назад</span>
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Результаты Квиза */}
                        <div className={styles.quizResults}>
                          <div className={styles.recommendedBox}>
                            <img
                              src={recommendedBox.image}
                              alt={recommendedBox.title}
                              className={styles.boxImage}
                              loading="lazy"
                            />
                            <h2 className={styles.boxTitle}>
                              {recommendedBox.title}
                            </h2>

                            {/* --- ЗАМЕНА СТАТИЧНОЙ ЦЕНЫ НА ПОЛЗУНОК --- */}
                            <div className={styles.budgetSection}>
                              <p className={styles.budgetTitle}>
                                Ваш бюджет на подарок:
                              </p>
                              <p className={styles.budgetTitle}>
                                {currentPrice}₽
                              </p>
                              <div className={styles.sliderContainer}>
                                <input
                                  type="range"
                                  min="0"
                                  max={max}
                                  step="1"
                                  value={priceIndex}
                                  onChange={handleSliderChange}
                                  className={styles.budgetSlider}
                                  style={sliderStyle}
                                />
                                <div className={styles.sliderLabels}>
                                  {priceSteps.map((step, idx) => {
                                    const isVisible =
                                      LABELS_TO_SHOW.includes(step);
                                    return (
                                      <div
                                        key={step}
                                        className={styles.sliderLabelWrapper}
                                      >
                                        <span
                                          className={`${
                                            styles.sliderLabelText
                                          } ${
                                            step === 5000
                                              ? styles.popularPrice
                                              : ""
                                          } ${
                                            step === 3000 ? styles.minPrice : ""
                                          } ${
                                            idx === priceIndex
                                              ? styles.activeLabel
                                              : ""
                                          }`}
                                          style={{ opacity: isVisible ? 1 : 0 }}
                                        >
                                          {step}₽
                                        </span>
                                        {step === 5000 && (
                                          <span className={styles.specialLabel}>
                                            <b>Популярный</b>
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className={styles.boxDetails}>
                              <h4 className={styles.detailsTitle}>
                                Что будет внутри:
                              </h4>
                              <ul className={styles.detailsList}>
                                {recommendedBox.details.items.map(
                                  (detail, index) => (
                                    <li
                                      key={index}
                                      dangerouslySetInnerHTML={{
                                        __html: detail,
                                      }}
                                    />
                                  )
                                )}
                              </ul>
                              {/* Динамические данные в boxSummary */}

                              <div className={styles.budgetInfoResult}>
                                <p className={styles.infoTitle}>
                                  Внутри бокса за {currentPrice}₽
                                </p>
                                <ul className={styles.infoList}>
                                  <li>
                                    Суммарная стоимость:
                                    <br />~{currentPrice}-{maxTotalValue}₽
                                  </li>
                                  <li>
                                    Вы экономите: ~{savings}₽
                                    <br /> на персональном подборе
                                  </li>
                                </ul>
                              </div>
                              {/* ----------------------------------------- */}
                            </div>
                          </div>
                        </div>
                        <div className={styles.quizActions}>
                          <div className={styles.quizFinalButtons}>
                            <button
                              className={styles.quizResetButton}
                              onClick={resetQuiz}
                            >
                              Пройти заново
                            </button>
                            <button
                              className={styles.quizOrderButton}
                              onClick={handleQuizOrder}
                            >
                              Заказать
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Секция "Как это работает" */}
              <HowItWorksSection />
              {/* Секция "Качество" */}
              <QualitySection />
              {/* Секция "Гарантии и доставка" */}
              <DeliverySection />
              {/* Секция FAQ */}
              <div className={styles.faq}>
                <h1 className={styles.faqTitle}>FAQ</h1>
                <p className={styles.faqSubtitle}>Часто задаваемые вопросы</p>
                <div className={styles.faqItems}>
                  {faqData.map((faq, index) => (
                    <div
                      key={index}
                      className={`${styles.faqItem} ${
                        openFaqIndex === index ? styles.faqItemOpen : ""
                      }`}
                    >
                      <div
                        className={styles.faqItemHeader}
                        onClick={() => toggleFaq(index)}
                      >
                        <h3>{faq.question}</h3>
                        <button className={styles.faqToggle}>
                          {openFaqIndex === index ? "×" : "+"}
                        </button>
                      </div>
                      {openFaqIndex === index && faq.answer && (
                        <div className={styles.faqItemContent}>
                          <div
                            className={styles.textContainer}
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.readyForSurprise}>
                <h1 className={styles.readyForSurpriseTitle}>
                  Готовы к сюрпризу?
                </h1>
                <p className={styles.readyForSurpriseSubtitle}>
                  Закажите WOWBOX прямо сейчас
                </p>
                <div className={styles.readyForSurpriseButtonWrapper}>
                  <button
                    className={styles.readyForSurpriseButton}
                    onClick={scrollToWowbox}
                  >
                    Собрать подарок от 3000₽
                  </button>
                </div>
              </div>
            </main>

            <Footer />
            <BoxingPersonalization />

            {/* Глобальные модальные окна (управляемые через Store) */}
            <OrderModal
              onPayment={(paymentMethod) => {
                setSelectedPaymentMethod(paymentMethod);
                setDeliveryModalOpen(true);
              }}
              onOpenPrivacyPolicy={() => navigate("/privacy")}
              onOpenPublicOffer={() => navigate("/public-offer")}
            />

            {/*<DeliveryModal
              isOpen={isDeliveryModalOpen}
              onClose={() => setDeliveryModalOpen(false)}
              onAccept={() => {
                setDeliveryModalOpen(false);
                if (selectedPaymentMethod === 'sbp') {
                  setBankSelectionModalOpen(true);
                } else {
                  setSmsModalOpen(true);
                }
              }}
            />*/}
            <BankSelectionModal
              isOpen={isBankSelectionModalOpen}
              onClose={() => setBankSelectionModalOpen(false)}
              onSelectBank={(bank) => {
                console.log("Selected bank:", bank);
                setBankSelectionModalOpen(false);
                setPaymentWaitingModalOpen(true);
                setTimeout(() => {
                  setPaymentWaitingModalOpen(false);
                  setPaymentResultModalOpen(true);
                }, 3000);
              }}
            />
            <PaymentWaitingModal
              isOpen={isPaymentWaitingModalOpen}
              onClose={() => setPaymentWaitingModalOpen(false)}
            />
            <SmsModal
              isOpen={isSmsModalOpen}
              onClose={() => setSmsModalOpen(false)}
              onVerify={(code) => {
                console.log("SMS code verified:", code);
                setSmsModalOpen(false);
                setPaymentResultModalOpen(true);
              }}
              phoneNumber="+998 XX XXX-XX-XX"
            />
            <PaymentResultModal
              isOpen={isPaymentResultModalOpen}
              onClose={() => setPaymentResultModalOpen(false)}
              isSuccess={true}
              orderNumber="OO OOO OOO1"
              onRetry={() => {
                setPaymentResultModalOpen(false);
                setDeliveryModalOpen(true);
              }}
              onGoHome={() => setPaymentResultModalOpen(false)}
            />
          </>
        }
      />
    </Routes>
  );
}
