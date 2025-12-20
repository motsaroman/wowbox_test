import { useState, useEffect } from "react";
import { useBoxStore, BOXES_DATA } from "../../store/boxStore";
import { useOrderStore } from "../../store/orderStore";
import selectYourOwnWowboxCardArrow from "../../assets/icons/selectYourOwnWowboxCardArrow.svg";
import close from "../../assets/icons/close.svg";
import styles from "./BoxesCarousel.module.css";

const YM_ID = 105562569;
const reachGoal = (goal) => {
  if (window.ym) {
    window.ym(YM_ID, 'reachGoal', goal);
  }
};
const LABELS_TO_SHOW = [3000, 5000, 20000, 50000, 120000];

export default function BoxesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // const [priceIndex, setPriceIndex] = useState(1);

  const selectTheme = useBoxStore((state) => state.selectTheme);
  const setSelectedPrice = useBoxStore((state) => state.setSelectedPrice);
  const openPersonalization = useBoxStore((state) => state.openPersonalization);

  const {
    fetchPricing,
    priceSteps,
    selectedPrice, // Глобальная цена
  } = useBoxStore();

  const setOrderBoxPrice = useOrderStore((state) => state.setBoxPrice);

  const carouselData = BOXES_DATA;

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // --- СИНХРОНИЗАЦИЯ ---
  // Вычисляем индекс на основе глобальной цены
  const foundIndex = priceSteps.indexOf(selectedPrice);
  const priceIndex = foundIndex !== -1 ? foundIndex : 1;

  const currentPrice = priceSteps[priceIndex] || 5000;
  const maxTotalValue = currentPrice + 3000;
  const savings = Math.round(currentPrice * 0.4);

  // Обработчик движения ползунка
  const handleSliderChange = (e) => {
    const newIndex = Number(e.target.value);
    const newPrice = priceSteps[newIndex];

    setSelectedPrice(newPrice); // Обновляем глобальный стор
    setOrderBoxPrice(newPrice); // Синхронизируем с заказом
  };

  const handleOrderClick = (themeId) => {
    // Цель: Клик "Купить" после выбора бокса
    reachGoal('buy_after_selection');
    
    selectTheme(themeId);
    openPersonalization();
  };

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

  const toggleExpanded = () => setIsExpanded(!isExpanded);

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

  const max = Math.max(0, priceSteps.length - 1);
  const percentage = (priceIndex / max) * 100;

  const sliderStyle = {
    background: `linear-gradient(to right, #93d3e1 0%, #93d3e1 ${percentage}%, #e2e1df ${percentage}%, #e2e1df 100%)`,
  };
  return (
    <div className={styles.boxesCarousel}>
      <div className={styles.boxesCarouselImagesWrapper}>
        <div className={styles.boxesCarouselImages}>
          <img
            src={visibleImages[0]}
            className={styles.leftImage}
            loading="lazy"
            alt=""
          />
          <img
            src={visibleImages[1]}
            className={styles.centerImage}
            loading="lazy"
            alt=""
          />
          <img
            src={visibleImages[2]}
            className={styles.rightImage}
            loading="lazy"
            alt=""
          />
          <img
            src={visibleImages[3]}
            className={styles.hiddenImage}
            loading="lazy"
            alt=""
          />
        </div>
        <div className={styles.boxesCarouselNavigation}>
          <button onClick={handlePrevious} disabled={isAnimating}>
            <img src={selectYourOwnWowboxCardArrow} alt="Prev" />
          </button>
          <button onClick={handleNext} disabled={isAnimating}>
            <img src={selectYourOwnWowboxCardArrow} alt="Next" />
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

            <div className={styles.budgetSection}>
              <p className={styles.budgetTitle}>Ваш бюджет на подарок:</p>
              <p className={styles.budgetTitle}>{currentPrice}₽</p>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max={max}
                  step="1"
                  value={priceIndex}
                  onChange={handleSliderChange}
                  className={styles.budgetSlider}
                  style={sliderStyle}
                />
                <div className={styles.sliderLabels}>
                  {priceSteps.map((step, idx) => {
                    const isVisible = LABELS_TO_SHOW.includes(step);
                    return (
                      <div key={step} className={styles.sliderLabelWrapper}>
                        <span
                          className={`${styles.sliderLabelText} ${step === 5000 ? styles.popularPrice : ""} ${step === 3000 ? styles.minPrice : ""} ${
                            idx === priceIndex ? styles.activeLabel : ""
                          }`}
                          style={{ opacity: isVisible ? 1 : 0 }}
                        >
                          {step}₽
                        </span>
                        {step === 5000 && (
                          <span className={styles.specialLabel}><b>Популярный</b></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
                </div>
                <div className={styles.budgetInfoResult}>
                  <p className={styles.infoTitle}>
                    Внутри бокса за {currentPrice}₽
                  </p>
                  <ul className={styles.infoList}>
                    <li>
                      Суммарная стоимость:
                      <br /> ~{currentPrice}-{maxTotalValue}₽
                    </li>
                    <li>
                      Вы экономите:  ~{savings}₽
                      <br /> на персональном подборе
                    </li>
                  </ul>
                </div>
                <p onClick={toggleExpanded} className={styles.closeButton}>
                  <img src={close} alt="Close" />
                </p>
              </>
            )}
            <div className={styles.boxesCarouselCardWrapper}>
              <button
                className={styles.boxesCarouselCardButton}
                onClick={() => handleOrderClick(currentCard.id)}
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
