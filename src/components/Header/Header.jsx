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
  
  // Таймер оставляем здесь, так как это UI-логика конкретного блока
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
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
              else {
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

  const scrollToSection = (sectionClass) => {
    const element = document.querySelector(`.${sectionClass}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  // Вспомогательная функция для прокрутки к каталогу
  const scrollToWowbox = () => scrollToSection(styles.selectYourOwnWowbox);

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
                    <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection(link.ref); }}>
                        {link.label}
                    </a>
                    <div></div>
                </div>
             ))}
          </div>
        </div>

        {/* Burger Button */}
        <button
          className={`${styles.burgerButton} ${isMobileMenuOpen ? styles.active : ""}`}
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
        className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.active : ""}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Mobile Navigation */}
      <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.active : ""}`}>
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
                        <a href="#" onClick={(e) => { e.preventDefault(); closeMobileMenu(); scrollToSection(link.ref); }}>
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
            <div><span>{timeLeft.days}</span><span>дней</span></div>
            <div><span>{timeLeft.hours}</span><span>часа</span></div>
            <div><span>{timeLeft.minutes}</span><span>минута</span></div>
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

        {/* Stickers Block */}
        <div className={styles.heroBonus}>
            <div className={styles.heroBonusPlus}>
                <div className={styles.heroBonusWrapper}>
                <div className={`${styles.heroBonusItem} ${styles.heroBonusItem}`}>
                    <p>УНИКАЛЬНАЯ УПАКОВКА</p>
                </div>
                </div>
                <img src={heroBonusSticker1} alt="sticker" loading="lazy" />
            </div>
            <div className={styles.heroBonusWrapper}>
                <div className={`${styles.heroBonusItem} ${styles.heroBonusItem2}`}>
                <p>НАПОЛНЕНИЕ ОТ 4900₽</p>
                </div>
            </div>
            <div className={styles.heroBonusWrapper}>
                <div className={`${styles.heroBonusItem} ${styles.heroBonusItem3}`}>
                <p>ЭФФЕКТ СЮРПРИЗА</p>
                </div>
            </div>
            <div className={styles.heroBonusPlus2}>
                <div className={styles.heroBonusWrapper}>
                <div className={`${styles.heroBonusItem} ${styles.heroBonusItem4}`}>
                    <p>ТОЛЬКО ОРИГИНАЛ</p>
                </div>
                </div>
                <img src={heroBonusSticker2} alt="sticker" loading="lazy" />
            </div>
        </div>

        <div className={styles.heroSelectButtonWrapper}>
          <button className={styles.heroSelectButton} onClick={scrollToWowbox}>
            Выбрать бокс за 4900₽
          </button>
        </div>
      </div>
    </header>
  );
}