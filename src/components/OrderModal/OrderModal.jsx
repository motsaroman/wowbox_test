import { useEffect, useState, useRef } from "react";
import { useOrderStore } from "../../store/orderStore";
import { useBoxStore } from "../../store/boxStore";
import DeliveryMapPage from "../DeliveryMapPage/DeliveryMapPage";
import ContactForm from "./components/ContactForm";
import RecipientForm from "./components/RecipientForm";
import DeliverySection from "./components/DeliverySection";
import PaymentSection from "./components/PaymentSection";
import OrderSummary from "./components/OrderSummary";
import DeliveryModal from "../DeliveryModal/DeliveryModal";

import editIcon from "../../assets/icons/edit.svg";
import texno1 from "../../assets/images/texno1.webp";
import texno2 from "../../assets/images/texno4.webp";
import texno3 from "../../assets/images/texno2.webp";
import texno4 from "../../assets/images/texno3.webp";
import styles from "./OrderModal.module.css";

// --- ХЕЛПЕРЫ ДЛЯ КОНВЕРТАЦИИ ID КВИЗА В НАЗВАНИЯ ---
const getQuizAnswerTitle = (questionIndex, answerId) => {
  if (!answerId) return "Не указан";

  if (questionIndex === 0) {
    const map = {
      self: "Для себя",
      partner: "Для партнёра",
      friend: "Для друга",
      colleague: "Для коллеги",
      relative: "Для родственника",
    };
    return map[answerId] || "Не указан";
  }

  if (questionIndex === 1) {
    const map = { woman: "Женщина", man: "Мужчина", other: "Не важно" };
    return map[answerId] || "Не указан";
  }

  if (questionIndex === 2) {
    const map = {
      practical: "Гаджеты и техно",
      emotions: "Уют и комфорт",
      quality: "Веселье и игры",
      surprise: "Сладости и вкусняшки",
    };
    return map[answerId] || "Не указан";
  }

  if (questionIndex === 3) {
    const map = {
      standard: "Чтобы точно пригодилось",
      premium: "Чтобы удивило и запомнилось",
      luxury: "Чтобы выглядело дорого",
      any: "Чтобы было разнообразно",
    };
    return map[answerId] || "Не указан";
  }

  return answerId;
};
// ----------------------------------------------------

export default function OrderModal({
  onPayment,
  onOpenPrivacyPolicy,
  onOpenPublicOffer,
}) {
  const {
    resetForm,
    validateForm,
    formData,
    setProcessing,
    isProcessing,
    updateDelivery,
    deliveryPrice,
    boxPrice,
    promoApplied,
  } = useOrderStore();

  const {
    isOrderModalOpen,
    closeOrderModal,
    editOrder,
    selectedTheme,
    personalizationData,
  } = useBoxStore();

  const [isMapOpen, setIsMapOpen] = useState(false);

  // Состояние видимости модального окна
  const [isDeliveryWarningOpen, setIsDeliveryWarningOpen] = useState(false);

  // ИСПОЛЬЗУЕМ REF для мгновенного хранения статуса согласия
  // Это предотвратит повторное открытие даже при быстрых кликах
  const hasAcceptedRef = useRef(false);

  useEffect(() => {
    if (isOrderModalOpen) {
      resetForm();
      // Сбрасываем реф при открытии нового заказа
      hasAcceptedRef.current = false;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOrderModalOpen, resetForm]);

  // --- ЕДИНАЯ ФУНКЦИЯ ОПЛАТЫ ---
  const processOrderPayment = async () => {
    // Если уже идет обработка - выходим, чтобы не дублировать запросы
    if (isProcessing) return;

    setProcessing(true);

    try {
      const promoDiscount = promoApplied ? 500 : 0;
      const totalPrice = boxPrice + deliveryPrice - promoDiscount;

      const fullPersonalData = {
        theme: personalizationData?.theme || selectedTheme,
        recipient: personalizationData?.recipient || "Не указан",
        gender: personalizationData?.gender || "not-important",
        restrictions: personalizationData?.restrictions || "Нет",
        wishes: personalizationData?.additionalWishes || "Нет",
        quizAnswers: personalizationData?.quiz || {},
      };

      const q = fullPersonalData.quizAnswers;

      let genderValue = fullPersonalData.gender;
      if (genderValue === "female") genderValue = "Женский";
      else if (genderValue === "male") genderValue = "Мужской";
      else if (genderValue === "not-important") genderValue = "Не важно";

      const recipientComment = formData.isGift
        ? `${formData.recipientName} (${formData.recipientPhone})`
        : "Заказчик";

      const managerCommentParts = [
        `--- Персонализация ---`,
        `Тема бокса: ${getThemeDisplayName(fullPersonalData.theme)}`,
        `Получатель: ${fullPersonalData.recipient}`,
        `Пол: ${genderValue}`,
        `Ограничения: ${fullPersonalData.restrictions}`,
        `Пожелания: ${fullPersonalData.wishes}`,
        `--- Ответы Квиза ---`,
        `Q0 (Для кого): ${getQuizAnswerTitle(0, q[0])}`,
        `Q1 (Пол): ${getQuizAnswerTitle(1, q[1])}`,
        `Q2 (Стиль): ${getQuizAnswerTitle(2, q[2])}`,
        `Q3 (Важность): ${getQuizAnswerTitle(3, q[3])}`,
        `--- Промокод ---`,
        `Промокод: ${formData.promoCode || "Нет"}`,
        `Скидка: ${promoDiscount}₽`,
        `--- Получатель ---`,
        `Получатель: ${recipientComment}`,
        formData.telegramNotify && formData.telegramUsername
          ? `Telegram: @${formData.telegramUsername.replace("@", "")}`
          : null,
        `--- Доставка ---`,
        `Пользователь уведомлен о задержке и согласился на презент.`,
      ];

      const managerCommentString = managerCommentParts.join("\n");

      let fullCourierAddress = null;
      if (formData.deliveryType === "courier") {
        const parts = [
          formData.city,
          formData.deliveryAddress,
          formData.apartment ? `кв. ${formData.apartment}` : "",
          formData.entrance ? `под. ${formData.entrance}` : "",
          formData.floor ? `эт. ${formData.floor}` : "",
        ];
        fullCourierAddress = parts.filter(Boolean).join(", ");
      }

      const payload = {
        boxTheme: fullPersonalData.theme,
        promoCode: formData.promoCode,
        promoDiscountAmount: promoDiscount,
        paymentMethod: formData.paymentMethod,
        contactData: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        },
        recipientData: formData.isGift
          ? {
              name: formData.recipientName,
              phone: formData.recipientPhone,
            }
          : null,
        comments: {
          user: formData.comment,
          courier: formData.courierComment,
          personalization: fullPersonalData,
          managerComment: managerCommentString,
        },
        deliveryData: {
          type: formData.deliveryType,
          pointId: formData.pvzCode,
          pointName: formData.deliveryPoint
            ? formData.deliveryPoint.split(" (")[1]?.replace(")", "")
            : null,
          address: fullCourierAddress,
          details: {
            city: formData.city,
            cityFias: formData.cityFias,
            street: formData.deliveryAddress,
            flat: formData.apartment,
            floor: formData.floor,
            entrance: formData.entrance,
          },
        },
        clientPrices: {
          box: boxPrice,
          delivery: deliveryPrice,
          total: totalPrice,
          discount: promoDiscount,
        },
        utm: {
          source:
            new URLSearchParams(window.location.search).get("utm_source") ||
            "direct",
          medium: new URLSearchParams(window.location.search).get("utm_medium"),
          campaign: new URLSearchParams(window.location.search).get(
            "utm_campaign"
          ),
        },
      };

      const response = await fetch(
        "https://wowbox.market/api/create-payment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.confirmationUrl) {
        // Успех
        window.location.href = data.confirmationUrl;

        onPayment(formData.paymentMethod);
        closeOrderModal();
      } else {
        alert("Ошибка: " + (data.message || "Попробуйте позже"));
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сети. Проверьте соединение.");
    } finally {
      // Сбрасываем флаг только если не ушли на редирект (в случае ошибки)
      // Если редирект произошел, компоненту все равно
      setProcessing(false);
    }
  };

  // --- ОБРАБОТЧИК САБМИТА ФОРМЫ (КНОПКА ОПЛАТИТЬ) ---
  const handleFormSubmit = (e) => {
    // Если событие есть, предотвращаем перезагрузку
    if (e) e.preventDefault();

    // Блокируем, если уже идет процесс
    if (isProcessing) return;

    if (!validateForm()) {
      console.log("Ошибка валидации формы");
      return;
    }

    // Проверяем через REF - это значение всегда актуально
    if (hasAcceptedRef.current) {
      processOrderPayment();
    } else {
      setIsDeliveryWarningOpen(true);
    }
  };

  // --- ОБРАБОТЧИК КНОПКИ "ПОЛУЧИТЬ ПРЕЗЕНТ И ОПЛАТИТЬ" ---
  const handleDeliveryAccept = () => {
    // 1. Мгновенно обновляем реф
    hasAcceptedRef.current = true;

    // 2. Закрываем модалку
    setIsDeliveryWarningOpen(false);

    // 3. Запускаем оплату
    processOrderPayment();
  };

  const getThemeDisplayName = (theme) => {
    const themeMap = {
      techno: "ТЕХНО",
      cozy: "УЮТНЫЙ",
      party: "ПАТИ",
      sweet: "СЛАДКИЙ",
    };
    return themeMap[theme] || theme?.toUpperCase() || "ТЕХНО";
  };

  const getThemeLogo = (theme) => {
    const logoMap = {
      techno: texno1,
      cozy: texno2,
      party: texno3,
      sweet: texno4,
    };
    return logoMap[theme] || texno1;
  };

  const getGenderDisplayName = (gender) =>
    ({
      female: "Женский",
      male: "Мужской",
      "not-important": "Не важно",
    }[gender] || "Не указано");

  const getPersonalizationDetails = () => {
    if (!personalizationData) return [];

    const details = [];
    const quiz = personalizationData.quiz || {};

    const recipientValue =
      personalizationData.recipient?.trim() || "Не указано";
    details.push({
      key: "recipient",
      label: "Для кого",
      value: recipientValue,
    });

    const genderValue = getGenderDisplayName(personalizationData.gender);
    details.push({ key: "gender", label: "Пол", value: genderValue });

    if (quiz["0"]) {
      details.push({
        key: "quiz_q0",
        label: "Q0(Для кого)",
        value: getQuizAnswerTitle(0, quiz["0"]),
      });
    }

    if (quiz["1"]) {
      details.push({
        key: "quiz_q1",
        label: "Q1(Пол)",
        value: getQuizAnswerTitle(1, quiz["1"]),
      });
    }

    if (quiz["2"]) {
      details.push({
        key: "stylePreference",
        label: "Стиль",
        value: getQuizAnswerTitle(2, quiz["2"]),
      });
    }

    if (quiz["3"]) {
      details.push({
        key: "importance",
        label: "Важность",
        value: getQuizAnswerTitle(3, quiz["3"]),
      });
    }

    details.push({
      key: "restrictions",
      label: "Ограничения",
      value: personalizationData.restrictions || "Нет",
    });

    const wishesValue = personalizationData.additionalWishes?.trim() || "Нет";
    details.push({ key: "wishes", label: "Пожелания", value: wishesValue });

    return details;
  };

  if (!isOrderModalOpen) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Оформление заказа</h2>
        <button className={styles.closeButton} onClick={closeOrderModal}>
          ✕
        </button>
      </div>

      <form className={styles.form} onSubmit={handleFormSubmit} noValidate>
        <div className={styles.leftColumn}>
          <ContactForm />
          <RecipientForm />
          <DeliverySection onOpenMap={() => setIsMapOpen(true)} />
          <PaymentSection />
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.rightColumnTopContent}>
            <div className={styles.selectedBox}>
              <button
                type="button"
                className={styles.editButton}
                onClick={editOrder}
                title="Редактировать"
              >
                <img src={editIcon} alt="Edit" />
              </button>

              <div className={styles.boxImageWrapper}>
                <div className={styles.boxImage}>
                  <img
                    src={getThemeLogo(
                      personalizationData?.theme || selectedTheme
                    )}
                    alt="box"
                    className={styles.boxLogo}
                  />
                </div>
                <div className={styles.boxInfo}>
                  <h4 className={styles.boxTitle}>
                    {getThemeDisplayName(
                      personalizationData?.theme || selectedTheme
                    )}
                  </h4>
                  <div className={styles.boxDetails}>
                    {getPersonalizationDetails().map((detail) => (
                      <p key={detail.key}>
                        {detail.label}: <span>{detail.value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <OrderSummary
            // ВАЖНО: передаем пустую функцию, чтобы кнопка в OrderSummary
            // просто сабмитила форму, а не вызывала логику дважды (через onClick и onSubmit)
            onSubmit={() => {}}
            onOpenPrivacy={onOpenPrivacyPolicy}
            onOpenOffer={onOpenPublicOffer}
          />
        </div>
      </form>

      {isMapOpen && (
        <DeliveryMapPage
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onDeliverySelect={updateDelivery}
          initialMode={
            formData.deliveryType === "courier" ? "courier" : "pickup"
          }
          currentData={{
            email: formData.email,
            phone: formData.phone,
            address: formData.deliveryAddress,
            apartment: formData.apartment,
            entrance: formData.entrance,
            floor: formData.floor,
            comment: formData.courierComment,
          }}
        />
      )}

      <DeliveryModal
        isOpen={isDeliveryWarningOpen}
        onClose={() => setIsDeliveryWarningOpen(false)}
        onAccept={handleDeliveryAccept}
      />
    </div>
  );
}
