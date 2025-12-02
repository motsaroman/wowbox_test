import { useNavigate } from "react-router-dom";
import styles from "../../App.module.css";

// Иконки
import footerLogo from "../../assets/icons/footerLogo.svg";
import whatsup from "../../assets/icons/whatsapp.svg";
import telegram from "../../assets/icons/tgFooter.svg";

export default function Footer() {
  const navigate = useNavigate();

  const scrollToSection = (sectionClass) => {
    const element = document.querySelector(`.${sectionClass}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerItem}>
        <img src={footerLogo} alt="Footer Logo" loading="lazy" />
        <div className={styles.footerTopLinks}>
           {[
                { label: "Главная", ref: styles.hero },
                { label: "Каталог", ref: styles.selectYourOwnWowbox },
                { label: "Подобрать WOWBOX", ref: styles.weFoundYourSuperWowbox },
                { label: "Как это работает", ref: styles.howToWorkWowBox },
                { label: "Качество", ref: styles.quality },
                { label: "Гарантии и доставка", ref: styles.delivery },
                { label: "Вопросы и ответы", ref: styles.faq },
             ].map((link, idx) => (
                <span key={idx} style={{display: 'contents'}}>
                    <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection(link.ref); }}>
                        {link.label}
                    </a>
                    {idx < 6 && <span></span>}
                </span>
             ))}
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
            {/*<a href="#"><img src={whatsup} alt="WhatsApp" loading="lazy" /></a>*/}
            <a href="https://t.me/wowboxofficial"><img src={telegram} alt="Telegram" loading="lazy" /></a>
          </div>
        </div>
      </div>
      <div className={styles.footerLine}></div>
      <div className={`${styles.footerItem} ${styles.footerItem2}`}>
        <p className={styles.footerItemContact}>Юридическая информация</p>
        <div className={styles.footerItemContactDesc}>
          <p>ООО “ИНВОРЛДС”</p>
          <p>Резидент ОЭЗ ИННОПОЛИС</p>
          <p>ИНН: 1683023860</p>
          <p>ОГРН: 1241600048689</p>
        </div>
      </div>
      <div className={styles.footerLine}></div>
      <div className={`${styles.footerItem} ${styles.footerItem3}`}>
        <p className={styles.footerItemContact}>® 2025 ВауБокс. Все права защищены.</p>
        <div className={styles.footerItempoliticsLinks}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>
            Политика конфиденциальности
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/public-offer'); }}>
            Публичная оферта
          </a>
        </div>
      </div>
    </footer>
  );
}