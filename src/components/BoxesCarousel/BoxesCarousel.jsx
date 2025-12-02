import { useState } from "react";
import { useBoxStore, BOXES_DATA } from "../../store/boxStore"; // Импортируем стор и данные
import selectYourOwnWowboxCardArrow from "../../assets/icons/selectYourOwnWowboxCardArrow.svg";
import close from "../../assets/icons/close.svg";
import styles from "./BoxesCarousel.module.css";

export default function BoxesCarousel() { // Убрали пропс onOrderClick
  // Локальный UI стейт карусели оставляем здесь
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Подключаем экшены из стора
  const selectTheme = useBoxStore((state) => state.selectTheme);
  const openPersonalization = useBoxStore((state) => state.openPersonalization);

  const carouselData = BOXES_DATA; // Используем данные из стора (или импортируем их)

  const handleOrderClick = (themeId) => {
    selectTheme(themeId);
    openPersonalization();
  };

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsExpanded(false);
    setCurrentIndex((prev) => prev === 0 ? carouselData.length - 1 : prev - 1);
    setTimeout(() => {
      setDisplayedCard((prev) => prev === 0 ? carouselData.length - 1 : prev - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsExpanded(false);
    setCurrentIndex((prev) => prev === carouselData.length - 1 ? 0 : prev + 1);
    setTimeout(() => {
      setDisplayedCard((prev) => prev === carouselData.length - 1 ? 0 : prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const getVisibleImages = () => {
    const images = [];
    for (let i = -1; i <= 2; i++) {
      const index = (currentIndex + i + carouselData.length) % carouselData.length;
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
          <img src={visibleImages[0]} className={styles.leftImage} loading="lazy" />
          <img src={visibleImages[1]} className={styles.centerImage} loading="lazy" />
          <img src={visibleImages[2]} className={styles.rightImage} loading="lazy" />
          <img src={visibleImages[3]} className={styles.hiddenImage} loading="lazy" />
        </div>
        <div className={styles.boxesCarouselNavigation}>
          <button onClick={handlePrevious} disabled={isAnimating}><img src={selectYourOwnWowboxCardArrow} alt="Prev" /></button>
          <button onClick={handleNext} disabled={isAnimating}><img src={selectYourOwnWowboxCardArrow} alt="Next" /></button>
        </div>
      </div>
      <div className={styles.boxesCarouselCards}>
        <div className={`${styles.boxesCarouselCard} ${isAnimating ? styles.cardAnimating : styles.cardVisible}`} key={displayedCard}>
          <div className={styles.boxesCarouselCardTitle}>
            <p>{currentCard.title}</p>
            <p>{currentCard.price}</p>
          </div>
          <div className={styles.boxesCarouselCardBody}>
            {!isExpanded ? (
              <>
                <p className={styles.boxesCarouselCardBodyDesc}>{currentCard.description}</p>
                <p onClick={toggleExpanded} className={styles.boxesCarouselCardBodyExpandButton}>Что будет внутри?</p>
              </>
            ) : (
              <>
                <div className={styles.boxesCarouselCardDetails}>
                  {currentCard.details.items.map((item, index) => (
                    <p key={index} className={styles.detailItem} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                  <div className={styles.detailTotals}>
                    <p className={styles.detailTotal}><strong>Всего:</strong> <br /> {currentCard.details.total}</p>
                    <p className={styles.detailValue}><strong>Розничная стоимость:</strong> <br /> {currentCard.details.value}</p>
                  </div>
                </div>
                <p onClick={toggleExpanded} className={styles.closeButton}><img src={close} alt="Close" /></p>
              </>
            )}
            <div className={styles.boxesCarouselCardWrapper}>
              <button className={styles.boxesCarouselCardButton} onClick={() => handleOrderClick(currentCard.id)}>
                Заказать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}