import React from "react";
import appStyles from "../../App.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";

import styles from "./PartnerSwiper.module.css";

// Импорт картинок
import partner1 from "../../assets/images/partner1.png";
import partner2 from "../../assets/images/partner2.png";
import partner3 from "../../assets/images/partner3.png";
import partner4 from "../../assets/images/partner4.png";
import partner5 from "../../assets/images/partner5.png";
import partner6 from "../../assets/images/partner6.png";
import partner7 from "../../assets/images/partner7.png";
import partner8 from "../../assets/images/partner8.png";
import partner9 from "../../assets/images/partner9.png";
import partner10 from "../../assets/images/partner10.png";

export default function PartnerSwiper() {
  return (
    <section className={`${styles.section} ${appStyles.partners}`}>
      <div className={styles.container}>
        <h2 className={styles.title}>Партнеры WOWbox</h2>
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={20}
          slidesPerView={2}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          freeMode={{
            enabled: true,
            momentum: false,
          }}
          speed={6000}
          breakpoints={{
            320: {
              slidesPerView: 4,
            },
            640: {
              slidesPerView: 5.5,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 6.5,
              spaceBetween: 30,
            },
          }}
          className={styles.swiperContainer}
        >
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner1} alt="Партнер 1" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner2} alt="Партнер 2" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner3} alt="Партнер 3" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner4} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner5} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner6} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner7} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner8} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner9} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={partner10} alt="Партнер 4" className={styles.image} />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}
