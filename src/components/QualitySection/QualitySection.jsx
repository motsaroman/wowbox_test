import styles from "../../App.module.css";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
//import { Pagination } from "swiper/modules";
import appStyles from "../../App.module.css";
import "swiper/css";
import "swiper/css/pagination";

export default function QualitySection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cards = [
    {
      id: 1,
      title: "Учитываем ограничения",
      text: "Аллергия, веганство, без ароматов, без алкоголя — все это фильтруется на этапе квиза. Мы не положим то, что нельзя.",
      sub: "Каждый бокс уникален",
      extraClass: "",
    },
    {
      id: 2,
      title: "Возврат в течение 7 дней",
      text: "Да, в течение 7 дней с момента получения, если подарок не вскрыт. Но мы уверены, что вам понравится!",
      sub: "Мы позаботились о вашем спокойствии — вернём деньги быстро",
      extraClass: styles.qualityBox2,
    },
    {
      id: 3,
      title: "Розничная стоимость ≥ вашего бюджета",
      text: "Вы платите 5000₽ — внутри товары на сумму минимум 5000₽, а обычно больше.",
      sub: "Вы получаете больше ценности, чем заплатили",
      extraClass: styles.qualityBox3,
    },
    {
      id: 4,
      title: "Двойная проверка качества",
      text: "Мы исключаем товары с браком, следим за состоянием упаковки, проверяем комплектацию",
      sub: "Лучше пусть мы перепроверим, чем вы разочаруетесь",
      extraClass: styles.qualityBox4,
    },
    {
      id: 5,
      title: "Только оригинальные товары",
      text: "Мы дорожим репутацией. Каждый поставщик проверен, каждый товар — оригинал. Никаких подделок и ширпотреба.",
      sub: "Никаких копий, только оригиналы с гарантией качества",
      extraClass: styles.qualityBox5,
    },
    {
      id: 6,
      title: "Поддержка, которая действительно помогает",
      text: "Если что-то пойдёт не так - мы решаем быстро, по-человечески, без споров. Без формальных отписок. Мы на вашей стороне",
      sub: "Главная цель — чтобы вы остались счастливы",
      extraClass: styles.qualityBox6,
    },
  ];

  const renderCard = (card) => (
    <div className={`${styles.qualityBox} ${card.extraClass || ""}`}>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
      <p className={styles.subText}>{card.sub}</p>
    </div>
  );

  return (
    <section className={`${styles.section} ${styles.sectionPdLeft} ${appStyles.deliverys}`}>
      <h2 className={styles.title}>"А вдруг не понравится?"<br />
— мы подумали об этом</h2>
      {isMobile ? (
        <Swiper
         // modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1.2}
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2.2,
              spaceBetween: 24,
            },
          }}
          className={styles.swiperContainer}
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id} style={{ height: "auto" }}>
              {/* style={{ height: "auto" }}*/}
              {renderCard(card)}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={styles.qualityBoxes}>
          {cards.map((card) => (
            <div key={card.id} className={styles.gridItemWrapper}>
               {renderCard(card)}
            </div>
          ))}
        </div>
      )}
      
    </section>
  );
}