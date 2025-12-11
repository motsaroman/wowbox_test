import styles from "../../App.module.css";

// Изображения
import mapRaodImg1 from "../../assets/images/mapRoadImg1.webp";
import mapRaodImg2 from "../../assets/images/mapRoadImg2.webp";
import mapRaodImg3 from "../../assets/images/mapRoadImg3.webp";
import mapRaodImg4 from "../../assets/images/mapRoadImg4.webp";

import number1 from "../../assets/images/number1.webp";
import number2 from "../../assets/images/number2.webp";
import number3 from "../../assets/images/number3.webp";
import number4 from "../../assets/images/number4.webp";

export default function HowItWorksSection() {
  return (
    <div className={styles.howToWorkWowBox}>
      <h1>Как работает WOWBOX?</h1>
      <div className={styles.howToWorkWowBoxMap}>
        <div className={styles.howToWorkWowBoxMapBox}>
          <img src={mapRaodImg1} alt="mapRoad" loading="lazy" />.
          <div className={styles.howToWorkWowBoxMapBoxBody}>
            <img
              src={number1}
              alt="1"
              className={styles.boxBodyNumber}
              loading="lazy"
            />
            <p>Выбирайте тему бокса</p>
            <p>Наполнение только из оригинальных, новых и премиум товаров</p>
            <p>Тип бокса влияет на стиль, но не на ценность</p>
          </div>
        </div>
        <div className={styles.howToWorkWowBoxMapBox}>
          <img src={mapRaodImg2} alt="mapRaodImg2" loading="lazy" />.
          <div className={styles.howToWorkWowBoxMapBoxBody}>
            <img
              src={number2}
              alt="number2"
              className={styles.boxBodyNumber}
              loading="lazy"
            />
            <p>Персонализируем наполнение бокса под конкретного получателя</p>
            <p>
              Подбор на основе >1 млн комбинаций и персональных предпочтений конкретного человека
            </p>
            <p>Каждый бокс собирается вручную и проходит проверку качества</p>
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
            <p>Подарим от вас любому человеку</p>
            <p>Быстрая и безопасная доставка<br/> Отслеживание 24/7</p>
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
            <p>Убедимся, что подарок понравился</p>
            <p>Контроль качества даже после покупки</p>
            <p>Мы остаёмся на связи даже после получения заказа</p>
          </div>
        </div>
      </div>
    </div>
  );
}
