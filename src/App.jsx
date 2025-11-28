import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import BoxesCarousel from "./components/BoxesCarousel/BoxesCarousel.jsx";
import PromoPopup from "./components/PromoPopup/PromoPopup.jsx";
import TelegramChat from "./components/TelegramChat/TelegramChat.jsx";
import BoxingPersonalization from "./components/BoxPersonalization/BoxingPersonalization.jsx";
import OrderModal from "./components/OrderModal/OrderModal.jsx";
import DeliveryModal from "./components/DeliveryModal/DeliveryModal.jsx";
import SmsModal from "./components/SmsModal/SmsModal.jsx";
import PaymentResultModal from "./components/PaymentResultModal/PaymentResultModal.jsx";
import BankSelectionModal from "./components/BankSelectionModal/BankSelectionModal.jsx";
import PaymentWaitingModal from "./components/PaymentWaitingModal/PaymentWaitingModal.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy.jsx";
import PublicOffer from "./components/PublicOffer/PublicOffer.jsx";

import logo from "./assets/images/logo.webp";
import santahat from "./assets/images/santa-claus-hat-illustration.webp";
import logoBig from "./assets/images/logoBig.webp";
import heroBonusSticker1 from "./assets/images/стикер.webp";
import heroBonusSticker2 from "./assets/images/стикер2.webp";

import mapRaodImg1 from "./assets/images/mapRoadImg1.webp";
import mapRaodImg2 from "./assets/images/mapRoadImg2.webp";
import mapRaodImg3 from "./assets/images/mapRoadImg3.webp";
import mapRaodImg4 from "./assets/images/mapRoadImg4.webp";

import selectYourOwnWowboxCardImg1 from "./assets/images/selectYourOwnWowboxCardImg1.webp";
import selectYourOwnWowboxCardImg2 from "./assets/images/selectYourOwnWowboxCardImg2.webp";
import selectYourOwnWowboxCardImg3 from "./assets/images/selectYourOwnWowboxCardImg3.webp";
import selectYourOwnWowboxCardImg4 from "./assets/images/selectYourOwnWowboxCardImg4.webp";

import number1 from "./assets/images/number1.webp";
import number2 from "./assets/images/number2.webp";
import number3 from "./assets/images/number3.webp";
import number4 from "./assets/images/number4.webp";

import delivery1 from "./assets/images/delivery1.webp";
import delivery2 from "./assets/images/delivery2.webp";

import saved from "./assets/icons/saved.svg";
import check from "./assets/icons/check.svg";
import clock from "./assets/icons/clock.svg";
import messadge from "./assets/icons/messadge.svg";
import reload from "./assets/icons/reload.svg";
import rubl from "./assets/icons/rubl.svg";

import whatsup from "./assets/icons/whatsapp.svg";
import telegram from "./assets/icons/tgFooter.svg";

import footerLogo from "./assets/icons/footerLogo.svg";
import toRight from "./assets/icons/toRight.svg";
import weFoundYourSuperWowboxBag from "./assets/icons/weFoundYourSuperWowboxBag.svg";
import weFoundYourSuperWowboxHeands from "./assets/icons/weFoundYourSuperWowboxHeands.svg";
import weFoundYourSuperWowboxHeart from "./assets/icons/weFoundYourSuperWowboxHeart.svg";
import weFoundYourSuperWowboxStar from "./assets/icons/weFoundYourSuperWowboxStar.svg";
import weFoundYourSuperWowboxTwoHeart from "./assets/icons/weFoundYourSuperWowboxTwoHeart.svg";

import questtion1 from "./assets/images/questrion1.webp";
import questtion2 from "./assets/images/question2.webp";
import questtion3 from "./assets/images/question3.webp";
import questtion4 from "./assets/images/question4.webp";
import questtion5 from "./assets/images/question5.webp";
import questtion6 from "./assets/images/question6.webp";
import questtion7 from "./assets/images/question7.webp";
import questtion8 from "./assets/images/question8.webp";

import woman from "./assets/images/womenIcon.webp";
import man from "./assets/images/manIcon.webp";
import other from "./assets/images/other.webp";

import styles from "./App.module.css";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isPaymentResultModalOpen, setIsPaymentResultModalOpen] =
    useState(false);
  const [isBankSelectionModalOpen, setIsBankSelectionModalOpen] =
    useState(false);
  const [isPaymentWaitingModalOpen, setIsPaymentWaitingModalOpen] =
    useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("sbp");
  const [boxPersonalization, setBoxPersonalization] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState({
    days: 15,
    hours: 21,
    minutes: 21,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime;

        // Decrement seconds
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;

          // Decrement minutes
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;

            // Decrement hours
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;

              // Decrement days
              if (days > 0) {
                days--;
              } else {
                // Timer reached zero
                clearInterval(timer);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const quizData = [
    {
      question: "Для кого подарок?",
      options: [
        {
          id: "self",
          icon: weFoundYourSuperWowboxStar,
          title: "Для себя",
          subtitle: "Хочу порадовать себя",
        },
        {
          id: "partner",
          icon: weFoundYourSuperWowboxHeart,
          title: "Для партнёра",
          subtitle: "Любимому человеку",
        },
        {
          id: "friend",
          icon: weFoundYourSuperWowboxHeands,
          title: "Для друга",
          subtitle: "Другу или подруге",
        },
        {
          id: "colleague",
          icon: weFoundYourSuperWowboxBag,
          title: "Для коллеги",
          subtitle: "Коллеге по работе",
        },
        {
          id: "relative",
          icon: weFoundYourSuperWowboxTwoHeart,
          title: "Для родственника",
          subtitle: "Маме, папе, брату, сестре",
        },
      ],
    },
    {
      question: "Пол получателя",
      options: [
        {
          id: "woman",
          icon: woman,
          title: "Женщина",
        },
        {
          id: "man",
          icon: man,
          title: "Мужчина",
        },
        {
          id: "other",
          icon: other,
          title: "Не важно",
        },
      ],
    },
    {
      question: "Что больше всего нравится?",
      options: [
        {
          id: "practical",
          icon: questtion1,
          title: "Гаджеты и техно",
          subtitle: "Современные устройства, умные штуки",
        },
        {
          id: "emotions",
          icon: questtion2,
          title: "Уют и комфорт",
          subtitle: "Тепло, спокойствие, домашняя атмосфера",
        },
        {
          id: "quality",
          icon: questtion3,
          title: "Веселье и игры",
          subtitle: "Тусовки, развлечения, активный отдых",
        },
        {
          id: "surprise",
          icon: questtion4,
          title: "Сладости и вкусняшки",
          subtitle: "Шоколад, десерты, гастрономия",
        },
      ],
    },
    {
      question: "Что важнее всего в подарке?",
      options: [
        {
          id: "standard",
          icon: questtion5,
          title: "Чтобы точно пригодилось",
          subtitle: "Полезные вещи, которые пригодятся",
        },
        {
          id: "premium",
          icon: questtion6,
          title: "Чтобы удивило и запомнилось",
          subtitle: "Креативные штуки, которых ни у кого нет",
        },
        {
          id: "luxury",
          icon: questtion7,
          title: "Чтобы выглядело дорого",
          subtitle: "Премиум, дорого выглядящее",
        },
        {
          id: "any",
          icon: questtion8,
          title: "Чтобы было разнообразно",
          subtitle: "Сбалансированный микс",
        },
      ],
    },
  ];

  const boxData = [
    {
      id: "techno",
      image: selectYourOwnWowboxCardImg1,
      title: "ТЕХНО БОКС",
      price: "4900₽",
      details: [
        "3-4 полезных гаджета",
        "4-5 приятных техно-сюрпризов",
        "2-3 новогодняя атмосфера",
      ],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
    {
      id: "cozy",
      image: selectYourOwnWowboxCardImg2,
      title: "УЮТНЫЙ БОКС",
      price: "4900₽",
      details: [
        "3-4 предмета для атмосферы",
        "4-5 товара создающих уют и комфорт",
        "2-3 элемента домашнего декора",
      ],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
    {
      id: "party",
      image: selectYourOwnWowboxCardImg3,
      title: "ПАТИ БОКС",
      price: "4900₽",
      details: [
        "2-3 развлечения и игры",
        "4-5 для крутого пати",
        "3-4 для новогодней тусовки",
      ],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
    {
      id: "sweet",
      image: selectYourOwnWowboxCardImg4,
      title: "СЛАДКИЙ БОКС",
      price: "4900₽",
      details: [
        "5-6 уникальных сладких радостей",
        "2-3 новогодние вкусняшки",
        "2-3 предмета чтобы не слиплось",
      ],
      total: "9-12 товаров",
      value: "от 4,900₽ до 100,000₽",
    },
  ];

  const getRecommendedBox = () => {
    const styleAnswer = quizAnswers[1];

    const styleMap = {
      modern: "techno",
      cozy: "cozy",
      fun: "party",
      sweet: "sweet",
    };

    const recommendedBoxId = styleMap[styleAnswer] || "techno";
    return boxData.find((box) => box.id === recommendedBoxId) || boxData[0];
  };

  const handleQuizAnswer = (questionIndex, answerId) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerId,
    }));

    setTimeout(() => {
      setCurrentQuestion(questionIndex + 1);
    }, 300);
  };

  const handleQuizBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuizReset = () => {
    setCurrentQuestion(0);
    setQuizAnswers({});
  };

  const handleQuizOrder = () => {
    setIsPersonalizationOpen(true);
  };

  const scrollToWowbox = () => {
    const element = document.querySelector(`.${styles.selectYourOwnWowbox}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToSection = (sectionClass) => {
    const element = document.querySelector(`.${sectionClass}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const faqData = [
    {
      question: "Это лотерея или розыгрыш?",
      answer:
        "Нет. Это наша постоянная модель бизнеса. Мы вкладываем в каждый бокс товары на сумму не менее 4,900₽, а некоторым клиентам везёт больше - так мы создаём WOW-эффект.",
    },
    {
      question: "Почему в некоторых боксах наполнения дороже чем 4900 руб. ?",
      answer:
        "Мы стремимся наполнять боксы только качественными и оригинальными товарами - это первый фактор влияющий на итоговую стоимость наполнения. Но самое главное – мы хотим удивлять! Это и есть наша миссия!",
    },
    {
      question: "Как я узнаю, что внутри?",
      answer:
        "Никак! Это сюрприз. Но мы гарантируем, что все товары качественные и оригинальные, а их суммарная розничная стоимость - не менее 4,900₽.",
    },
    {
      question: "Могу ли я вернуть бокс?",
      answer:
        "Да, в течение 7 дней с момента получения, если коробка не вскрыта. Но мы уверены, что вам понравится!",
    },
    {
      question: "Как быстро придёт заказ?",
      answer:
        "3-5 дней по России через партнерскую службу доставки. Вы получите трекинг-номер сразу после отправки. И кстати, все товары застрахованы во время транспортировки",
    },
    {
      question: "Это настоящие товары или подделки?",
      answer:
        "Только оригинальные товары. Мы дорожим репутацией и проверяем каждого поставщика",
    },
    {
      question: "Можно ли заказать несколько боксов?",
      answer: "Да! Идеально для подарков друзьям и коллегам",
    },
    {
      question: "Что делать, если что-то не понравилось?",
      answer:
        "В каждом боксе есть открытка с контактами. Напишите нам - мы всегда на связи и решим любой вопрос",
    },
    {
      question: "Можно ли выбрать конкретные товары?",
      answer:
        "Нет, это противоречит концепции сюрприза. Но вы выбираете тип бокса и можете указать свои пожелания - мы их обязательно учтем",
    },
  ];

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy isOpen={true} onClose={() => navigate('/')} />} />
      <Route path="/public-offer" element={<PublicOffer isOpen={true} onClose={() => navigate('/')} />} />
      <Route path="/" element={
        <>
          <PromoPopup />
          <TelegramChat />
          <header>
        <div className={styles.navbar}>
          <a href="#">
            <img src={logo} alt="Logo" loading="lazy" />
          </a>
          <div className={styles.navbarNavigation}>
            <div className={styles.navbarLinks}>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.hero);
                  }}
                >
                  Главная
                </a>
                <div></div>
              </div>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.selectYourOwnWowbox);
                  }}
                >
                  Каталог
                </a>
                <div></div>
              </div>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.weFoundYourSuperWowbox);
                  }}
                >
                  Подобрать WOWBOX
                </a>
                <div></div>
              </div>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.howToWorkWowBox);
                  }}
                >
                  Как это работает
                </a>
                <div></div>
              </div>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.quality);
                  }}
                >
                  Качество
                </a>
                <div></div>
              </div>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.delivery);
                  }}
                >
                  Гарантии и доставка
                </a>
                <div></div>
              </div>
              <div className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(styles.faq);
                  }}
                >
                  Вопросы и ответы
                </a>
                <div></div>
              </div>
            </div>
          </div>

          {/* Burger Button */}
          <button
            className={`${styles.burgerButton} ${
              isMobileMenuOpen ? styles.active : ""
            }`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span className={styles.burgerLine}></span>
            <span className={styles.burgerLine}></span>
            <span className={styles.burgerLine}></span>
          </button>
        </div>

        {/* Mobile Overlay */}
        <div
          className={`${styles.mobileOverlay} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
          onClick={closeMobileMenu}
        ></div>

        {/* Mobile Navigation */}
        <nav
          className={`${styles.mobileNav} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
        >
          <div className={styles.mobileNavLinks}>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.hero);
                }}
              >
                Главная
              </a>
            </div>
            <div className={styles.mobileNavHr}></div>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.selectYourOwnWowbox);
                }}
              >
                Каталог
              </a>
            </div>
            <div className={styles.mobileNavHr}></div>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.weFoundYourSuperWowbox);
                }}
              >
                Подобрать WOWBOX
              </a>
            </div>
            <div className={styles.mobileNavHr}></div>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.howToWorkWowBox);
                }}
              >
                Как это работает
              </a>
            </div>
            <div className={styles.mobileNavHr}></div>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.quality);
                }}
              >
                Качество
              </a>
            </div>
            <div className={styles.mobileNavHr}></div>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.delivery);
                }}
              >
                Гарантии и доставка
              </a>
            </div>
            <div className={styles.mobileNavHr}></div>
            <div className={styles.mobileNavLink}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  scrollToSection(styles.faq);
                }}
              >
                Вопросы и ответы
              </a>
            </div>
          </div>
        </nav>

        <div className={styles.hero}>
          <div className={styles.heroTitle}>
            <h1>Участвуй в новогодней акции!</h1>
            <p>Собирай очки в игре и получай гарантированные подарки!</p>
          </div>
          <div className={styles.discount}>
            <div className={styles.discountOverTime}>
              <div>
                <span>{timeLeft.days}</span>
                <span>дней</span>
              </div>
              <div>
                <span>{timeLeft.hours}</span>
                <span>часа</span>
              </div>{" "}
              <div>
                <span>{timeLeft.minutes}</span>
                <span>минута</span>
              </div>
            </div>
            <div className={styles.discountOverTimeButtonWrapper}>
              <button className={styles.discountOverTimeButton}>Играть</button>
              <img src={santahat} alt="Santa Claus Hat" loading="lazy" />
            </div>
          </div>
          <div className={styles.heroLogo}>
            <img src={logoBig} alt="Hero Logo" loading="lazy" />
            <p>лучший способ порадовать себя и близких</p>
          </div>
          <div className={styles.heroBonus}>
            <div className={styles.heroBonusPlus}>
              <div className={styles.heroBonusWrapper}>
                <div
                  className={`${styles.heroBonusItem} ${styles.heroBonusItem}`}
                >
                  <p>УНИКАЛЬНАЯ УПАКОВКА</p>
                </div>
              </div>
              <img src={heroBonusSticker1} alt="sticker" loading="lazy" />
            </div>
            <div className={styles.heroBonusWrapper}>
              <div
                className={`${styles.heroBonusItem} ${styles.heroBonusItem2}`}
              >
                <p>НАПОЛНЕНИЕ ОТ 4900₽</p>
              </div>
            </div>
            <div className={styles.heroBonusWrapper}>
              <div
                className={`${styles.heroBonusItem} ${styles.heroBonusItem3}`}
              >
                <p>ЭФФЕКТ СЮРПРИЗА</p>
              </div>
            </div>
            <div className={styles.heroBonusPlus2}>
              <div className={styles.heroBonusWrapper}>
                <div
                  className={`${styles.heroBonusItem} ${styles.heroBonusItem4}`}
                >
                  <p>ТОЛЬКО ОРИГИНАЛ</p>
                </div>
              </div>
              <img src={heroBonusSticker2} alt="sticker" loading="lazy" />
            </div>
          </div>
          <div className={styles.heroSelectButtonWrapper}>
            <button
              className={styles.heroSelectButton}
              onClick={scrollToWowbox}
            >
              Выбрать бокс за 4900₽
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className={styles.selectYourOwnWowbox}>
          <h1>Выберите свой WOWBOX</h1>
          <BoxesCarousel onOrderClick={() => setIsPersonalizationOpen(true)} />
        </div>
        <div className={styles.weFoundYourSuperWowbox}>
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
                {/* Hide progress dots on results page (step 5) */}
                {currentQuestion < quizData.length && (
                  <div className={styles.progressDots}>
                    {quizData.map((_, index) => (
                      <span
                        key={index}
                        className={
                          currentQuestion === index ? styles.active : ""
                        }
                      ></span>
                    ))}
                  </div>
                )}

                {currentQuestion < quizData.length ? (
                  <>
                    <p className={styles.questionLabel}>
                      ВОПРОС {currentQuestion + 1}/{quizData.length}:
                    </p>
                    <h3 className={styles.questionTitle}>
                      {quizData[currentQuestion].question}
                    </h3>
                  </>
                ) : (
                  <h3 className={styles.resultsTitle}>Ваш идеальный бокс:</h3>
                )}
              </div>

              {/* Quiz Questions or Results Page */}
              {currentQuestion < quizData.length ? (
                <>
                  {/* Quiz Options */}
                  <div className={styles.quizOptions}>
                    {quizData[currentQuestion].options.map((option) => (
                      <div
                        key={option.id}
                        className={styles.quizOption}
                        onClick={() =>
                          handleQuizAnswer(currentQuestion, option.id)
                        }
                      >
                        <img
                          className={styles.optionIcon}
                          src={option.icon}
                          alt={option.title}
                          loading="lazy"
                        />
                        <div className={styles.optionText}>
                          <p className={styles.optionTitle}>{option.title}</p>
                          {option.subtitle && (
                            <p className={styles.optionSubtitle}>
                              {option.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quiz Navigation - Back Button */}
                  <div className={styles.quizActions}>
                    {currentQuestion > 0 && (
                      <button
                        className={styles.quizBackButton}
                        onClick={handleQuizBack}
                      >
                        <img src={toRight} alt="toRight" loading="lazy" />
                        <span>Назад</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Results Page */}
                  <div className={styles.quizResults}>
                    <div className={styles.recommendedBox}>
                      <img
                        src={getRecommendedBox().image}
                        alt={getRecommendedBox().title}
                        className={styles.boxImage}
                        loading="lazy"
                      />
                      <h2 className={styles.boxTitle}>
                        {getRecommendedBox().title}
                      </h2>
                      <p className={styles.boxPrice}>
                        {getRecommendedBox().price}
                      </p>

                      <div className={styles.boxDetails}>
                        <h4 className={styles.detailsTitle}>
                          Что будет внутри:
                        </h4>
                        <ul className={styles.detailsList}>
                          {getRecommendedBox().details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                        <div className={styles.boxSummary}>
                          <p>
                            <strong>Всего:</strong> {getRecommendedBox().total}
                          </p>
                          <p>
                            <strong>Розничная стоимость:</strong>{" "}
                            {getRecommendedBox().value}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Page Buttons */}
                  <div className={styles.quizActions}>
                    <div className={styles.quizFinalButtons}>
                      <button
                        className={styles.quizResetButton}
                        onClick={handleQuizReset}
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
        <div className={styles.howToWorkWowBox}>
          <h1>Как работает WOWBOX?</h1>
          <div className={styles.howToWorkWowBoxMap}>
            <div className={styles.howToWorkWowBoxMapBox}>
              <img src={mapRaodImg1} alt="mapRaodImg1" loading="lazy" />.
              <div className={styles.howToWorkWowBoxMapBoxBody}>
                <img
                  src={number1}
                  alt="number1"
                  className={styles.boxBodyNumber}
                  loading="lazy"
                />
                <p>Выбираете тип бокса</p>
                <p>Пати бокс, Уютный бокс, Техно бокс, Сладкий бокс</p>
                <p>Тип бокса влияет на стиль, но не на ценность</p>
              </div>
            </div>
            <div className={styles.howToWorkWowBoxMapBox}>
              <img src={mapRaodImg2} alt="mapRaodImg2" loading="lazy" />.
              <div className={styles.howToWorkWowBoxMapBoxBody}>
                <img
                  src={number2}
                  alt="number1"
                  className={styles.boxBodyNumber}
                  loading="lazy"
                />
                <p>Мы собираем ваш бокс</p>
                <p>
                  9–12 оригинальных премиум-товаровНаполнение от 4900 ₽ до 120
                  000 ₽
                </p>
                <p>
                  Каждый бокс собирается вручную и проходит проверку качества
                </p>
              </div>
            </div>
            <div className={styles.howToWorkWowBoxMapBox}>
              <img src={mapRaodImg3} alt="mapRaodImg3" loading="lazy" />.
              <div className={styles.howToWorkWowBoxMapBoxBody}>
                <img
                  src={number3}
                  alt="number3"
                  className={styles.boxBodyNumber}
                  loading="lazy"
                />
                <p>Получаете и наслаждаетесь</p>
                <p>Быстрая и безопасная доставка Отслеживание 24/7</p>
                <p>Доставка по всей России без задержек</p>
              </div>
            </div>
            <div className={styles.howToWorkWowBoxMapBox}>
              <img src={mapRaodImg4} alt="mapRaodImg4" loading="lazy" />.
              <div className={styles.howToWorkWowBoxMapBoxBody}>
                <img
                  src={number4}
                  alt="number4"
                  className={styles.boxBodyNumber}
                  loading="lazy"
                />
                <p>Наслаждение не только от распаковки</p>
                <p>Контроль качества даже после покупки</p>
                <p>Мы остаёмся на связи даже после получения заказа</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.quality}>
          <h1>Наш подход к качеству</h1>
          <div className={styles.qualityBoxes}>
            <div className={styles.qualityBox}>
              <h3>Качество с первого клика</h3>
              <p>
                Мы читаем ваши комментарии, учитываем ограничения и подбираем
                товары, которые подойдут именно вам
              </p>

              <p>Каждый бокс уникален</p>
            </div>
            <div className={`${styles.qualityBox} ${styles.qualityBox2}`}>
              <h3>Двойная проверка качества</h3>
              <p>
                Мы исключаем товары с браком, следим за состоянием упаковки,
                проверяем комплектацию
              </p>

              <p>Лучше пусть мы перепроверим, чем вы разочаруетесь</p>
            </div>
            <div className={`${styles.qualityBox} ${styles.qualityBox3}`}>
              <h3>Забота во время ожидания</h3>
              <p>
                В течении 24 часов мы вышлем вам трек-номер - вы сможете следить
                где ваш бокс
              </p>

              <p>
                Собрали → Упаковали → Передали курьеру → В пути → Доставлено
              </p>
            </div>

            <div className={`${styles.qualityBox} ${styles.qualityBox4}`}>
              <h3>Упаковка - как ритуал</h3>
              <p>
                Мы упаковываем каждый бокс вручную - красиво, чисто, аккуратно.
                Еще до открытия вы прочувствуете "Тот самый момент"
              </p>

              <p>Подарок будет особенный именно для Вас</p>
            </div>

            <div className={`${styles.qualityBox} ${styles.qualityBox5}`}>
              <h3>Поддержка, которая действительно помогает</h3>
              <p>
                Если что-то пойдёт не так - мы решаем быстро, по-человечески,
                без споров. Без формальных отписок. Мы на вашей стороне
              </p>

              <p>Главная цель — чтобы вы остались счастливы</p>
            </div>
          </div>
        </div>
        <div className={styles.delivery}>
          <h1>Гарантии и доставка</h1>
          <div className={styles.deliveryBoxes}>
            <div className={styles.deliveryBox}>
              <img src={delivery1} alt="delivery1 " loading="lazy" />
              <h1>Гарантия качества</h1>
              <div className={styles.deliveryBoxDesc}>
                <div className={styles.deliveryBoxDescItem}>
                  <img src={saved} alt="saved" loading="lazy" />
                  <p>Розничная стоимость не менее 4,900₽</p>
                </div>{" "}
                <div className={styles.deliveryBoxDescItem}>
                  <img src={rubl} alt="rubl" loading="lazy" />
                  <p>Все товары новые</p>
                </div>
                <div className={styles.deliveryBoxDescItem}>
                  <img src={check} alt="check" loading="lazy" />
                  <p>Только оригинальные товары</p>
                </div>
              </div>
            </div>
            <div className={styles.deliveryBox}>
              <img src={delivery2} alt="delivery2 " loading="lazy" />
              <h1>Гарантия поддержки</h1>
              <div className={styles.deliveryBoxDesc}>
                <div className={styles.deliveryBoxDescItem}>
                  <img src={clock} alt="clock" loading="lazy" />
                  <p>Ответ в течение 1 часа</p>
                </div>
                <div className={styles.deliveryBoxDescItem}>
                  <img src={messadge} alt="messadge" loading="lazy" />
                  <p>Решаем любые вопросы</p>
                </div>{" "}
                <div className={styles.deliveryBoxDescItem}>
                  <img src={reload} alt="reload" loading="lazy" />
                  <p>Возврат в течение 7 дней</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.readyForSurprise}>
          <h1 className={styles.readyForSurpriseTitle}>Готовы к сюрпризу?</h1>
          <p className={styles.readyForSurpriseSubtitle}>
            Закажите WOWBOX прямо сейчас
          </p>
          <div className={styles.readyForSurpriseButtonWrapper}>
            <button
              className={styles.readyForSurpriseButton}
              onClick={scrollToWowbox}
            >
              Выбрать бокс за 4900₽
            </button>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerItem}>
          <img src={footerLogo} alt="Footer Logo  " loading="lazy" />
          <div className={styles.footerTopLinks}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.hero);
              }}
            >
              Главная
            </a>
            <span></span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.selectYourOwnWowbox);
              }}
            >
              Каталог
            </a>
            <span></span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.weFoundYourSuperWowbox);
              }}
            >
              Подобрать WOWBOX
            </a>
            <span></span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.howToWorkWowBox);
              }}
            >
              Как это работает
            </a>
            <span></span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.quality);
              }}
            >
              Качество
            </a>
            <span></span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.delivery);
              }}
            >
              Гарантии и доставка
            </a>
            <span></span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(styles.faq);
              }}
            >
              Вопросы и ответы
            </a>
          </div>
        </div>
        <div className={styles.footerLine}></div>
        <div className={`${styles.footerItem} ${styles.footerItem2}`}>
          <p className={styles.footerItemContact}>Контакты:</p>
          <div className={styles.footerItemContactSocials}>
            <div>
              <span>Email: </span>{" "}
              <a href="mailto:hello@wowbox.market">hello@wowbox.market</a>
            </div>
            <div>
              <a href="#">
                <img src={whatsup} alt="WhatsApp" loading="lazy" />
              </a>
              <a href="#">
                <img src={telegram} alt="Telegram" loading="lazy" />
              </a>
            </div>
          </div>
        </div>
        <div className={styles.footerLine}></div>{" "}
        <div className={`${styles.footerItem} ${styles.footerItem2}`}>
          <p className={styles.footerItemContact}>Юридическая информация</p>
          <div className={styles.footerItemContactDesc}>
            <p>ООО “ИНВОРЛДС”</p>
            <p>Резидент ОЭЗ ИННОПОЛИС</p>
            <p>ИНН: 1683023860</p>
            <p>ОГРН: 1241600048689</p>
          </div>
        </div>
        <div className={styles.footerLine}></div>{" "}
        <div className={`${styles.footerItem} ${styles.footerItem3}`}>
          <p className={styles.footerItemContact}>
            ® 2025 ВауБокс. Все права защищены.
          </p>
          <div className={styles.footerItempoliticsLinks}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/privacy');
              }}
            >
              Политика конфиденциальности
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/public-offer');
              }}
            >
              Публичная оферта
            </a>
          </div>
        </div>
      </footer>
      <BoxingPersonalization
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        savedData={boxPersonalization}
        onOrderClick={(personalizationData) => {
          setBoxPersonalization(personalizationData);
          setIsPersonalizationOpen(false);
          setIsOrderModalOpen(true);
        }}
      />
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        boxPersonalization={boxPersonalization}
        onEdit={() => {
          setIsOrderModalOpen(false);
          setIsPersonalizationOpen(true);
        }}
        onPayment={(paymentMethod) => {
          setSelectedPaymentMethod(paymentMethod);
          setIsDeliveryModalOpen(true);
        }}
        onOpenPrivacyPolicy={() => navigate('/privacy')}
        onOpenPublicOffer={() => navigate('/public-offer')}
      />
      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onAccept={() => {
          setIsDeliveryModalOpen(false);
          if (selectedPaymentMethod === "sbp") {
            // SBP flow: open BankSelectionModal
            setIsBankSelectionModalOpen(true);
          } else {
            // Card/SberPay/TPay flow: open SmsModal
            setIsSmsModalOpen(true);
          }
        }}
      />
      <BankSelectionModal
        isOpen={isBankSelectionModalOpen}
        onClose={() => setIsBankSelectionModalOpen(false)}
        onSelectBank={(bank) => {
          console.log("Selected bank:", bank);
          setIsBankSelectionModalOpen(false);
          setIsPaymentWaitingModalOpen(true);

          // Simulate payment processing
          setTimeout(() => {
            setIsPaymentWaitingModalOpen(false);
            setIsPaymentResultModalOpen(true);
          }, 3000);
        }}
      />
      <PaymentWaitingModal
        isOpen={isPaymentWaitingModalOpen}
        onClose={() => setIsPaymentWaitingModalOpen(false)}
      />
      <SmsModal
        isOpen={isSmsModalOpen}
        onClose={() => {
          setIsSmsModalOpen(false);
        }}
        onVerify={(code) => {
          console.log("SMS code verified:", code);
          setIsSmsModalOpen(false);
          setIsPaymentResultModalOpen(true);
        }}
        phoneNumber="+998 XX XXX-XX-XX"
      />
      <PaymentResultModal
        isOpen={isPaymentResultModalOpen}
        onClose={() => {
          setIsPaymentResultModalOpen(false);
          setIsOrderModalOpen(false);
          setBoxPersonalization(null);
        }}
        isSuccess={true}
        orderNumber="OO OOO OOO1"
        onRetry={() => {
          console.log("Retry payment");
          setIsPaymentResultModalOpen(false);
          setIsDeliveryModalOpen(true);
        }}
        onGoHome={() => {
          setIsPaymentResultModalOpen(false);
          setIsOrderModalOpen(false);
          setBoxPersonalization(null);
        }}
      />
        </>
      } />
    </Routes>
  );
}
