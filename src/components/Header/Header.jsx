import { useState, useEffect } from "react";
import { useUIStore } from "../../store/uiStore";
import styles from "../../App.module.css"; // Импортируем стили из App или создаем свои

// Изображения (пути могут отличаться, проверьте относительно новой папки)
import logo from "../../assets/images/logo.webp";
import logoBig from "../../assets/images/logoBig.webp";
import santahat from "../../assets/images/santa-claus-hat-illustration.webp";
import heroBonusSticker1 from "../../assets/images/стикер.webp";
import heroBonusSticker2 from "../../assets/images/стикер2.webp";

export default function Header() {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  // Функция для расчета времени до Нового года
  const calculateTimeLeft = () => {
    const now = new Date();
    // Целевая дата: 1 января следующего года, 00:00:00
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;
    const newYearDate = new Date(`January 1, ${nextYear} 00:00:00`);

    const difference = newYearDate - now;

    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  // Инициализируем состояние результатом функции
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Очистка таймера при размонтировании
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (sectionClass) => {
    const element = document.querySelector(`.${sectionClass}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Вспомогательная функция для прокрутки к каталогу
  const scrollToWowbox = () => scrollToSection(styles.selectYourOwnWowbox);
  const scrollToQuiz = () => scrollToSection(styles.quizContainer);

  return (
    <header>
      <div className={styles.navbar}>
        <a href="#">
          <img src={logo} alt="Logo" loading="lazy" />
        </a>
        <div className={styles.navbarNavigation}>
          <div className={styles.navbarLinks}>
            {/* Ссылки десктоп */}
            {[
              { label: "Главная", ref: styles.hero },
              { label: "Каталог", ref: styles.selectYourOwnWowbox },
              { label: "Подобрать WOWBOX", ref: styles.weFoundYourSuperWowbox },
              { label: "Как это работает", ref: styles.howToWorkWowBox },
              { label: "Качество", ref: styles.quality },
              { label: "Гарантии и доставка", ref: styles.delivery },
              { label: "Вопросы и ответы", ref: styles.faq },
            ].map((link, idx) => (
              <div key={idx} className={styles.navbarLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.ref);
                  }}
                >
                  {link.label}
                </a>
                <div></div>
              </div>
            ))}
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
          {[
            { label: "Главная", ref: styles.hero },
            { label: "Каталог", ref: styles.selectYourOwnWowbox },
            { label: "Подобрать WOWBOX", ref: styles.weFoundYourSuperWowbox },
            { label: "Как это работает", ref: styles.howToWorkWowBox },
            { label: "Качество", ref: styles.quality },
            { label: "Гарантии и доставка", ref: styles.delivery },
            { label: "Вопросы и ответы", ref: styles.faq },
          ].map((link, idx) => (
            <div key={idx}>
              <div className={styles.mobileNavLink}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    scrollToSection(link.ref);
                  }}
                >
                  {link.label}
                </a>
              </div>
              {idx < 6 && <div className={styles.mobileNavHr}></div>}
            </div>
          ))}
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
            </div>
            <div>
              <span>{timeLeft.minutes}</span>
              <span>минута</span>
            </div>
          </div>
          <div className={styles.discountOverTimeButtonWrapper}>
            <button
              className={styles.discountOverTimeButton}
              onClick={() =>
                window.dispatchEvent(new CustomEvent("eg-open-widget"))
              }
            >
              Играть
            </button>
            <img src={santahat} alt="Santa Claus Hat" loading="lazy" />
          </div>
        </div>

        <div className={styles.heroLogo}>
          <img src={logoBig} alt="Hero Logo" loading="lazy" />
          <p>Проанализируем интересы и увлечения, чтобы собрать подарок, который человек действительно хочет</p>
        </div>

        {/* Stickers Block */}
        <div className={styles.heroBonus}>
          <div className={styles.heroBonusPlus}>
            <div className={styles.heroBonusWrapper}>
              <div
                className={`${styles.heroBonusItem} ${styles.heroBonusItem}`}
              >
                <p>ПОДБЕРЕМ И СОБЕРЕМ ПОДАРОК</p>
              </div>
            </div>
            <img src={heroBonusSticker1} alt="sticker" loading="lazy" />
          </div>
          <div className={styles.heroBonusWrapper}>
            <div className={`${styles.heroBonusItem} ${styles.heroBonusItem2}`}>
              <p>ПОД ЛЮБОЙ БЮДЖЕТ</p>
            </div>
          </div>
          <div className={styles.heroBonusWrapper}>
            <div className={`${styles.heroBonusItem} ${styles.heroBonusItem3}`}>
              <p>БЕЗ ПОТЕРИ ВРЕМЕНИ НА ПОИСКИ</p>
            </div>
          </div>
          <div className={styles.heroBonusPlus2}>
            <div className={styles.heroBonusWrapper}>
              <div
                className={`${styles.heroBonusItem} ${styles.heroBonusItem4}`}
              >
                <p>WOW-ЭФФЕКТ ОТ ПОДАРКА</p>
              </div>
            </div>
            <img src={heroBonusSticker2} alt="sticker" loading="lazy" />
          </div>
        </div>

        <div className={styles.heroSelectButtonWrapper}>
          <button className={styles.heroSelectButton} onClick={scrollToWowbox}>
            Купить в 1 клик
          </button>
          <button className={styles.heroSelectButton} onClick={scrollToQuiz}>
            Собрать подарок от 3000₽
          </button>
        </div>
      </div>
    </header>
  );
}
