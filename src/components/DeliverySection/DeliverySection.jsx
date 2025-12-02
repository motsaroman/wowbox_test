import styles from "../../App.module.css";

// Изображения
import delivery1 from "../../assets/images/delivery1.webp";
import delivery2 from "../../assets/images/delivery2.webp";

// Иконки
import saved from "../../assets/icons/saved.svg";
import rubl from "../../assets/icons/rubl.svg";
import check from "../../assets/icons/check.svg";
import clock from "../../assets/icons/clock.svg";
import messadge from "../../assets/icons/messadge.svg";
import reload from "../../assets/icons/reload.svg";

export default function DeliverySection() {
  return (
    <div className={styles.delivery}>
      <h1>Гарантии и доставка</h1>
      <div className={styles.deliveryBoxes}>
        <div className={styles.deliveryBox}>
          <img src={delivery1} alt="delivery1" loading="lazy" />
          <h1>Гарантия качества</h1>
          <div className={styles.deliveryBoxDesc}>
            <div className={styles.deliveryBoxDescItem}>
              <img src={saved} alt="saved" loading="lazy" />
              <p>Розничная стоимость не менее 4,900₽</p>
            </div>
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
          <img src={delivery2} alt="delivery2" loading="lazy" />
          <h1>Гарантия поддержки</h1>
          <div className={styles.deliveryBoxDesc}>
            <div className={styles.deliveryBoxDescItem}>
              <img src={clock} alt="clock" loading="lazy" />
              <p>Ответ в течение 1 часа</p>
            </div>
            <div className={styles.deliveryBoxDescItem}>
              <img src={messadge} alt="messadge" loading="lazy" />
              <p>Решаем любые вопросы</p>
            </div>
            <div className={styles.deliveryBoxDescItem}>
              <img src={reload} alt="reload" loading="lazy" />
              <p>Возврат в течение 7 дней</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
