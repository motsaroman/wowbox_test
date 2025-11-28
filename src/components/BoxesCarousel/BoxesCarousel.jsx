import { useState } from "react";

import selectYourOwnWowboxCardImg1 from "../../assets/images/selectYourOwnWowboxCardImg1.webp";
import selectYourOwnWowboxCardImg2 from "../../assets/images/selectYourOwnWowboxCardImg2.webp";
import selectYourOwnWowboxCardImg3 from "../../assets/images/selectYourOwnWowboxCardImg3.webp";
import selectYourOwnWowboxCardImg4 from "../../assets/images/selectYourOwnWowboxCardImg4.webp";
import selectYourOwnWowboxCardArrow from "../../assets/icons/selectYourOwnWowboxCardArrow.svg";
import close from "../../assets/icons/close.svg";

import styles from "./BoxesCarousel.module.css";

export default function BoxesCarousel({ onOrderClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const carouselData = [
    {
      image: selectYourOwnWowboxCardImg1,
      title: "ТЕХНО БОКС",
      price: "4900₽",
      description:
        "Для тех, кто любит современные гаджеты и полезные устройства. Внутри — практичные технологичные штуки, которые облегчают жизнь и реально радуют каждый день",
      details: {
        items: [
          "<strong>3-4</strong> полезных гаджета",
          "<strong>4-5</strong> приятных техно-сюрпризов",
          "<strong>2-3</strong> новогодняя атмосфера",
        ],
        total: "9-12 товаров",
        value: "от 4,900₽ до 100,000₽",
      },
    },
    {
      image: selectYourOwnWowboxCardImg2,
      title: "УЮТНЫЙ БОКС",
      price: "4900₽",
      description:
        "Идеален для тех, кто ценит тепло, комфорт и атмосферу «домашнего блаженства». Пледы, свечи, вкусный чай — всё, чтобы замедлиться и насладиться моментом",
      details: {
        items: [
          "<strong>3-4</strong> предмета для атмосферы",
          "<strong>4-5</strong> товара создающих уют и комфорт",
          "<strong>2-3</strong> элемента домашнего декора",
        ],
        total: "9-12 товаров",
        value: "от 4,900₽ до 100,000₽",
      },
    },
    {
      image: selectYourOwnWowboxCardImg3,
      title: "ПАТИ БОКС",
      price: "4900₽",
      description:
        "Для тех, кто любит веселье, активность и неожиданные развлечения. Внутри — яркие предметы для хорошего настроения, игр и лёгкого праздника в любой день",
      details: {
        items: [
          "<strong>2-3</strong> развлечения и игры",
          "<strong>4-5</strong> для крутого пати",
          "<strong>3-4</strong> для новогодней тусовки",
        ],
        total: "9-12 товаров",
        value: "от 4,900₽ до 100,000₽",
      },
    },
    {
      image: selectYourOwnWowboxCardImg4,
      title: "СЛАДКИЙ БОКС",
      price: "4900₽",
      description:
        "Для тех, кто обожает вкусности, шоколад и маленькие гастрономические удовольствия. Полезно? Может быть нет. Вкусно и радостно? Абсолютно да",
      details: {
        items: [
          "<strong>5-6</strong> уникальных сладких радостей",
          "<strong>2-3</strong> новогодние вкусняшки",
          "<strong>2-3</strong> предмета чтобы не слиплось",
        ],
        total: "9-12 товаров",
        value: "от 4,900₽ до 100,000₽",
      },
    },
  ];

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsExpanded(false);
    setCurrentIndex((prev) =>
      prev === 0 ? carouselData.length - 1 : prev - 1
    );
    setTimeout(() => {
      setDisplayedCard((prev) =>
        prev === 0 ? carouselData.length - 1 : prev - 1
      );
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsExpanded(false);
    setCurrentIndex((prev) =>
      prev === carouselData.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => {
      setDisplayedCard((prev) =>
        prev === carouselData.length - 1 ? 0 : prev + 1
      );
      setIsAnimating(false);
    }, 300);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getVisibleImages = () => {
    const images = [];
    for (let i = -1; i <= 2; i++) {
      const index =
        (currentIndex + i + carouselData.length) % carouselData.length;
      images.push(carouselData[index].image);
    }
    return images;
  };

  const visibleImages = getVisibleImages();
  const currentCard = carouselData[displayedCard];

  return (
    <div className={styles.boxesCarousel}>
      <div className={styles.boxesCarouselImagesWrapper}>
        <div className={styles.boxesCarouselImages}>
          <img
            src={visibleImages[0]}
            alt="image1"
            className={styles.leftImage}
            loading="lazy"
          />
          <img
            src={visibleImages[1]}
            alt="image2"
            className={styles.centerImage}
            loading="lazy"
          />
          <img
            src={visibleImages[2]}
            alt="image3"
            className={styles.rightImage}
            loading="lazy"
          />
          <img
            src={visibleImages[3]}
            alt="image4"
            className={styles.hiddenImage}
            loading="lazy"
          />
        </div>
        <div className={styles.boxesCarouselNavigation}>
          <button onClick={handlePrevious} disabled={isAnimating}>
            <img
              src={selectYourOwnWowboxCardArrow}
              alt="Previous"
              loading="lazy"
            />
          </button>
          <button onClick={handleNext} disabled={isAnimating}>
            <img src={selectYourOwnWowboxCardArrow} alt="Next" loading="lazy" />
          </button>
        </div>
      </div>
      <div className={styles.boxesCarouselCards}>
        <div
          className={`${styles.boxesCarouselCard} ${
            isAnimating ? styles.cardAnimating : styles.cardVisible
          }`}
          key={displayedCard}
        >
          <div className={styles.boxesCarouselCardTitle}>
            <p>{currentCard.title}</p>
            <p>{currentCard.price}</p>
          </div>
          <div className={styles.boxesCarouselCardBody}>
            {!isExpanded ? (
              <>
                <p className={styles.boxesCarouselCardBodyDesc}>
                  {currentCard.description}
                </p>
                <p
                  onClick={toggleExpanded}
                  className={styles.boxesCarouselCardBodyExpandButton}
                >
                  Что будет внутри?
                </p>
              </>
            ) : (
              <>
                <div className={styles.boxesCarouselCardDetails}>
                  {currentCard.details.items.map((item, index) => (
                    <p
                      key={index}
                      className={styles.detailItem}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                  <div className={styles.detailTotals}>
                    <p className={styles.detailTotal}>
                      <strong>Всего:</strong> <br /> {currentCard.details.total}
                    </p>
                    <p className={styles.detailValue}>
                      <strong>Розничная стоимость:</strong> <br />
                      {currentCard.details.value}
                    </p>
                  </div>
                </div>
                <p onClick={toggleExpanded} className={styles.closeButton}>
                  <img src={close} alt="Close" loading="lazy" />
                </p>
              </>
            )}
            <div className={styles.boxesCarouselCardWrapper}>
              <button
                className={styles.boxesCarouselCardButton}
                onClick={onOrderClick}
              >
                Заказать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
