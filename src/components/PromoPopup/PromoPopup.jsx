import React, { useState, useEffect, useCallback } from "react";
import closeIcon from "../../assets/icons/close.svg";
import copy from "../../assets/icons/copy.svg";
import copyCheck from "../../assets/icons/copyCheck.svg";

import styles from "./PromoPopup.module.css";

// Ключ для хранения статуса показа в рамках сессии
const SESSION_KEY = 'promoPopupShown';
// Время неактивности (30 секунд)
const INACTIVITY_TIMEOUT = 30000; 

const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Флаг, который отражает, был ли баннер показан в этой сессии
  const isShownInSession = sessionStorage.getItem(SESSION_KEY) === 'true';

  // Функция для показа попапа и установки флага сессии
  const showPopup = useCallback(() => {
    if (!isShownInSession) {
      setIsOpen(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
  }, [isShownInSession]);

  const handleClose = () => {
      setIsOpen(false);
  }

  // Логика триггеров и управления сессией
  useEffect(() => {
    if (isShownInSession) return; // Если уже показывали, ничего не настраиваем

    // --- 1. ЛОГИКА "EXIT INTENT" (Курсор движется к закрытию вкладки) ---
    const handleMouseLeave = (e) => {
      // Проверяем, что курсор находится вблизи верхнего края (например, < 20px)
      if (e.clientY < 20) {
        showPopup();
      }
    };

    // Добавляем слушатель на весь документ для отслеживания ухода мыши
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);


    // --- 2. ЛОГИКА НЕАКТИВНОСТИ (> 30 секунд) ---
    let activityTimer;

    const resetTimer = () => {
      clearTimeout(activityTimer);
      // Запускаем таймер, только если попап еще не был показан в этой сессии
      if (sessionStorage.getItem(SESSION_KEY) !== 'true') {
        activityTimer = setTimeout(() => {
          showPopup();
        }, INACTIVITY_TIMEOUT);
      }
    };

    const handleActivity = () => {
      resetTimer(); // При любой активности сбрасываем и перезапускаем таймер
    };

    // Инициализация и слушатели активности
    resetTimer(); 
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);


    // --- ОЧИСТКА СЛУШАТЕЛЕЙ ---
    return () => {
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(activityTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [showPopup, isShownInSession]); // Зависимости


  // Эффект для сброса иконки копирования
  useEffect(() => {
    if (isCopied) {
      const copyTimer = setTimeout(() => {
        setIsCopied(false);
      }, 2000); // 2 секунды

      return () => clearTimeout(copyTimer);
    }
  }, [isCopied]);


  const handleCopyPromoCode = async () => {
    try {
      await navigator.clipboard.writeText("ПЕРВЫЙ500");
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.popupBody}>
          <button
            onClick={handleClose}
            className={styles.closeButton}
          >
            <img src={closeIcon} alt="Close" loading="lazy" />
          </button>

          <div className={styles.content}>
            <h2 className={styles.heading}>Уже уходите?</h2>

            <p className={styles.subheading}>
              Возьмите промокод на первый заказ:
            </p>

            <div className={styles.promoSection}>
              <button
                className={styles.promoButton}
                onClick={handleCopyPromoCode}
              >
                <span className={styles.promoCode}>ПЕРВЫЙ500</span>
                <img
                  src={isCopied ? copyCheck : copy}
                  alt="Copy"
                  loading="lazy"
                />
              </button>
            </div>
            <div className={styles.popupHr}></div>
            <p className={styles.discountText}>СКИДКА 500 РУБЛЕЙ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;