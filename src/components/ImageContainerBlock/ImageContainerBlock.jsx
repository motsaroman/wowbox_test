import styles from "./ImageContainerBlock.module.css";
import sending from "../../assets/images/sending.png";
import answer from "../../assets/images/answer.png";
import users from "../../assets/images/users.png";
import marketplace from "../../assets/images/marketplace.png";
import podarki from "../../assets/images/podarki.png";
import checklist from "../../assets/images/checklist.png";
import derevo from "../../assets/images/derevo2.png";
import deliveryBox from "../../assets/images/deliveryBox.png";

import appStyles from "../../App.module.css";

export default function ImageContainerBlock() {
  return (
    <section className={`${styles.section} ${appStyles.howToWorksWowBox}`}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          КАК РАБОТАЕТ ПЕРСОНАЛИЗИРОВАННЫЙ
          <br /> ПОДБОР ПОДАРКОВ WOWbox
        </h2>
        <div className={styles.cardsRow}>
          <div className={styles.cardWrap}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>01</h3>
              <p className={styles.cardText}>
                Укажите бюджет и оставьте контакты
              </p>
              <div className={styles.imageContainer}>
                <img src={answer}  alt="Описание 1" className={styles.image} />
              </div>
            </div>
          </div>
          <div className={styles.cardWrap}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>02</h3>
              <p className={styles.cardText}>Пройдите квиз из 4-х вопросов за 30 секунд</p>
              <div className={styles.imageContainer}>
                <img src={sending} alt="Описание 1" className={styles.image} />
              </div>
            </div>
          </div>
          <div className={styles.cardWrap2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>03</h3>
              <p className={styles.cardText}>Здесь начинается магия</p>
              <p className={styles.subtitle}>
                Сервис WOWbox анализирует
                <br /> получателя по многим параметрам
              </p>
              <div className={styles.imageContainerRow}>
                <div className={styles.placeholder}>
                  <img src={users} alt="Описание 1" className={styles.image} />
                  <p>Анализ схожих предпочтений других пользователей</p>
                </div>
                <div className={styles.placeholder}>
                  <img
                    src={marketplace}
                    alt="Описание 1"
                    className={styles.image}
                  />
                  <p>Анализ интересов получателя на 100+ порталах</p>
                </div>
                <div className={styles.placeholder}>
                  <img
                    src={podarki}
                    alt="Описание 1"
                    className={styles.image}
                  />
                  <p>Вишлист и прошлые подарки</p>
                </div>
                <div className={styles.placeholder}>
                  <img
                    src={checklist}
                    alt="Описание 1"
                    className={styles.image}
                  />
                  <p>Ваши ответы</p>
                </div>
              </div>
              <img src={derevo} alt="Описание 1" className={styles.derevo} />
            </div>
          </div>
          <div className={styles.cardWrap3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>04</h3>
              <p className={styles.cardText} style={{ marginBottom: "1rem" }}>
                Готово! Персональный бокс доставлен
              </p>
              <div className={styles.imageContainer}>
                <div className={styles.placeholder}>
                  <img
                    src={deliveryBox}
                    alt="Описание 1"
                    className={styles.image}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
