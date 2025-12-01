import { useState, useEffect } from "react";
import styles from "./OrderModal.module.css";
import DeliveryMapPage from "../DeliveryMapPage/DeliveryMapPage";

// Icons and images
import editIcon from "../../assets/icons/edit.svg";
import rightArrow from "../../assets/icons/right-arrow.svg";
import texno1 from "../../assets/images/texno1.webp";
import texno2 from "../../assets/images/texno2.webp";
import texno3 from "../../assets/images/texno3.webp";
import texno4 from "../../assets/images/texno4.webp";
import fivePostLogo from "../../assets/images/5post-logo.png";
import truckIcon from "../../assets/icons/truck.svg";
import spbBankLogo from "../../assets/images/spb-bank-logo.png";
import sberPayLogo from "../../assets/images/sber-pay-bank-logo.png";
import tBankLogo from "../../assets/images/t-bank-logo.png";
import bankCardIcon from "../../assets/icons/bank-card.svg";

export default function OrderModal({
  isOpen = true,
  onClose,
  selectedBox,
  boxPersonalization,
  onPayment,
  onEdit,
  onOpenPrivacyPolicy,
  onOpenPublicOffer,
  selectedTheme = "techno",
}) {
  // Инициализация состояния формы
  const [formData, setFormData] = useState({
    name: "",
    phone: "+7 ",
    email: "",
    telegramNotify: false,
    telegramUsername: "",
    isGift: false,
    recipientName: "",
    recipientPhone: "+7 ",
    comment: "",
    deliveryType: "5post",
    pvzCode: "",
    city: "Москва", // Значение по умолчанию, будет перезаписано картой
    cityFias: null,
    deliveryPoint: "",
    deliveryAddress: "",
    apartment: "",
    entrance: "",
    floor: "",
    courierComment: "",
    paymentMethod: "sbp",
    promoCode: "",
    acceptTerms: false,
    receiveNews: false,
  });

  const [promoApplied, setPromoApplied] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Состояния для ошибок и статусов
  const [errors, setErrors] = useState({});
  const [promoStatus, setPromoStatus] = useState(null); // 'success', 'error', null
  const [promoMessage, setPromoMessage] = useState("");

  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const boxPrice = 4900;
  const promoDiscount = promoApplied ? 500 : 0;
  const totalPrice = boxPrice + deliveryPrice - promoDiscount;

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Обработчик ввода текста
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Сброс ошибки поля при вводе
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Сброс статуса промокода при редактировании
    if (name === "promoCode") {
      setPromoStatus(null);
      setPromoMessage("");
      setPromoApplied(false);
    }
  };

  // Обработчик ввода телефона (маска +7)
  const handlePhoneChange = (e, fieldName) => {
    let value = e.target.value;
    if (!value.startsWith("+7 ")) {
      value = "+7 ";
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  // Проверка промокода
  const handlePromoApply = () => {
    if (!formData.promoCode) return;

    if (formData.promoCode.toUpperCase() === "ПЕРВЫЙ500") {
      setPromoApplied(true);
      setPromoStatus("success");
      setPromoMessage("Промокод успешно применен!");
    } else {
      setPromoApplied(false);
      setPromoStatus("error");
      setPromoMessage("Промокод не найден или истек");
    }
  };

  // Управление картой
  const handleOpenMap = () => {
    setIsMapOpen(true);
    setErrors((prev) => ({ ...prev, delivery: null }));
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  // Обработка выбора доставки из карты
  const handleDeliverySelect = (deliveryData) => {
    // 1. САМОВЫВОЗ (5Post)
    if (deliveryData.mode === "pickup" && deliveryData.point) {
      setFormData((prev) => ({
        ...prev,
        deliveryType: "5post",
        deliveryPoint: `${deliveryData.point.address} (${deliveryData.point.name})`,
        pvzCode: deliveryData.point.id,
        cityFias: deliveryData.cityFias,
        city: deliveryData.cityName || prev.city, // Обновляем город из карты
        // Очищаем поля курьера
        deliveryAddress: "",
        apartment: "",
        entrance: "",
        floor: "",
        courierComment: "",
      }));

      if (deliveryData.point.price) {
        setDeliveryPrice(deliveryData.point.price + 50);
      }
    }
    // 2. КУРЬЕР
    else if (deliveryData.mode === "courier") {
      setFormData((prev) => ({
        ...prev,
        deliveryType: "courier",
        deliveryAddress: deliveryData.address,
        // Заполняем поля, пришедшие из карты
        apartment: deliveryData.apartment,
        entrance: deliveryData.entrance,
        floor: deliveryData.floor,
        courierComment: deliveryData.comment,

        cityFias: deliveryData.cityFias,
        city: deliveryData.cityName || prev.city, // Обновляем город из карты
      }));

      // Используем точную цену из API (которую вернула карта)
      if (deliveryData.price) {
        setDeliveryPrice(deliveryData.price);
      } else {
        setDeliveryPrice(0); // Или дефолт
      }
    }
    // Сбрасываем ошибку
    setErrors((prev) => ({ ...prev, delivery: null }));
    setIsMapOpen(false);
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Контакты
    if (!formData.name.trim()) {
      newErrors.name = "Введите ваше имя";
      isValid = false;
    }
    if (!formData.phone || formData.phone.length < 12) {
      newErrors.phone = "Введите корректный телефон";
      isValid = false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Введите корректный email";
      isValid = false;
    }

    // Доставка
    if (formData.deliveryType === "5post") {
      if (!formData.pvzCode) {
        newErrors.delivery = "Выберите пункт выдачи на карте";
        isValid = false;
      }
    } else if (formData.deliveryType === "courier") {
      if (!formData.deliveryAddress) {
        newErrors.delivery = "Укажите адрес доставки на карте";
        isValid = false;
      }
    }

    // Получатель (если подарок)
    if (formData.isGift) {
      if (!formData.recipientName.trim()) {
        newErrors.recipientName = "Укажите имя получателя";
        isValid = false;
      }
      if (!formData.recipientPhone || formData.recipientPhone.length < 12) {
        newErrors.recipientPhone = "Укажите телефон получателя";
        isValid = false;
      }
    }

    // Соглашение
    if (!formData.acceptTerms) {
      newErrors.terms = "Необходимо согласие";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed", errors);
      return;
    }

    if (!formData.acceptTerms) {
      alert(
        "Пожалуйста, согласитесь с условиями публичной оферты и конфиденциальности"
      );
      return;
    }

    setIsProcessing(true);

    try {
      const personalizationData = {
        theme: boxPersonalization?.theme || selectedTheme,
        gender: boxPersonalization?.gender || "не указан",
        recipient: boxPersonalization?.recipient || "не указан",
        restrictions: boxPersonalization?.restrictions || "нет",
        wishes: boxPersonalization?.additionalWishes || "нет",
      };

      // Формируем полный адрес
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
        boxTheme: personalizationData.theme,
        promoCode: formData.promoCode,
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
          personalization: personalizationData,
        },
        deliveryData: {
          type: formData.deliveryType,
          pointId: formData.deliveryType === "5post" ? formData.pvzCode : null,
          pointName:
            formData.deliveryType === "5post" ? formData.deliveryPoint : null,
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

      // Запрос на бэкенд (PHP)
      const response = await fetch("/create-payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        alert(
          "Ошибка при создании заказа: " + (data.message || "Попробуйте позже")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Произошла ошибка сети. Попробуйте еще раз.");
    } finally {
      setIsProcessing(false);
    }
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

  const getGenderDisplayName = (gender) => {
    const genderMap = {
      female: "Женский",
      male: "Мужской",
      "not-important": "Не важно",
    };
    return genderMap[gender] || "Не указано";
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

  if (!isOpen) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Оформление заказа</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.leftColumn}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Контактные данные</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Имя<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите имя..."
                className={`${styles.input} ${
                  errors.name ? styles.inputError : ""
                }`}
                required
              />
              {errors.name && (
                <div className={styles.errorMessage}>{errors.name}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Телефон<span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e, "phone")}
                placeholder="+7 (000) 000-00-00"
                className={`${styles.input} ${
                  errors.phone ? styles.inputError : ""
                }`}
                required
              />
              {errors.phone && (
                <div className={styles.errorMessage}>{errors.phone}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Email<span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите свою почту"
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ""
                }`}
                required
              />
              {errors.email && (
                <div className={styles.errorMessage}>{errors.email}</div>
              )}
            </div>

            <div className={styles.checkboxRow}>
              <span className={styles.checkboxText}>
                Хочу получать информацию о заказе в Telegram
              </span>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  name="telegramNotify"
                  checked={formData.telegramNotify}
                  onChange={handleInputChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            {formData.telegramNotify && (
              <div className={styles.inputGroup}>
                <div className={styles.telegramInput}>
                  <span className={styles.telegramPrefix}>@</span>
                  <input
                    type="text"
                    name="telegramUsername"
                    value={formData.telegramUsername}
                    onChange={handleInputChange}
                    placeholder="username"
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.checkboxRow}>
              <span className={styles.checkboxText}>
                Получатель другой человек
              </span>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  name="isGift"
                  checked={formData.isGift}
                  onChange={handleInputChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            {formData.isGift && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Имя получателя<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="Введите имя..."
                    className={`${styles.input} ${
                      errors.recipientName ? styles.inputError : ""
                    }`}
                  />
                  {errors.recipientName && (
                    <div className={styles.errorMessage}>
                      {errors.recipientName}
                    </div>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Телефон получателя<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={(e) => handlePhoneChange(e, "recipientPhone")}
                    placeholder="+7 (000) 000-00-00"
                    className={`${styles.input} ${
                      errors.recipientPhone ? styles.inputError : ""
                    }`}
                  />
                  {errors.recipientPhone && (
                    <div className={styles.errorMessage}>
                      {errors.recipientPhone}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Комментарий к заказу</label>
              <input
                type="text"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Добавьте комментарий..."
                className={styles.input}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Доставка</h3>

            <div className={styles.deliveryOptions}>
              <label
                className={`${styles.deliveryOption} ${
                  formData.deliveryType === "5post" ? styles.active : ""
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="5post"
                  checked={formData.deliveryType === "5post"}
                  onChange={handleInputChange}
                />
                <div className={styles.deliveryContent}>
                  <img
                    src={fivePostLogo}
                    alt="5post"
                    className={styles.deliveryLogo}
                    loading="lazy"
                  />
                  <span>ПВЗ 5POST</span>
                </div>
              </label>

              <label
                className={`${styles.deliveryOption} ${
                  formData.deliveryType === "courier" ? styles.active : ""
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="courier"
                  checked={formData.deliveryType === "courier"}
                  onChange={handleInputChange}
                />
                <div className={styles.deliveryContent}>
                  <img
                    src={truckIcon}
                    alt="Курьер"
                    className={styles.deliveryIcon}
                    loading="lazy"
                  />
                  <span>Курьером до адреса</span>
                </div>
              </label>
            </div>

            {errors.delivery && (
              <div
                style={{
                  color: "#ff4444",
                  marginBottom: "10px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                ⚠️ {errors.delivery}
              </div>
            )}

            {/* ПОЛЕ ГОРОДА УДАЛЕНО ОТСЮДА, КАК ВЫ И ПРОСИЛИ */}

            {formData.deliveryType === "5post" ? (
              <div className={styles.inputGroup}>
                <p className={styles.label}>
                  Пункт выдачи<span className={styles.required}>*</span>
                </p>
                <div
                  className={`${styles.select} ${
                    errors.delivery ? styles.inputError : ""
                  }`}
                  onClick={handleOpenMap}
                >
                  <p
                    style={{
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formData.deliveryPoint || "Выберите пункт выдачи..."}
                  </p>
                  <img src={rightArrow} alt="" />
                </div>
              </div>
            ) : (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Адрес доставки<span className={styles.required}>*</span>
                  </label>
                  <div
                    className={`${styles.input} ${
                      errors.delivery ? styles.inputError : ""
                    }`}
                    onClick={handleOpenMap}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginRight: "10px",
                      }}
                    >
                      {formData.deliveryAddress ||
                        "Нажмите, чтобы выбрать адрес..."}
                    </div>
                    <img src={rightArrow} alt="" />
                  </div>
                </div>

                <div className={styles.addressGrid}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Квартира"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="entrance"
                      value={formData.entrance}
                      onChange={handleInputChange}
                      placeholder="Подъезд"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      placeholder="Этаж"
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="courierComment"
                    value={formData.courierComment}
                    onChange={handleInputChange}
                    placeholder="Комментарий для курьера"
                    className={styles.input}
                  />
                </div>
              </>
            )}

            <p className={styles.deliveryNote}>
              ПРИ ПОВТОРНОМ ЗАКАЗЕ СЕГОДНЯ ДО 23:59 НА ТОТ ЖЕ АДРЕС — ДОСТАВКА
              БЕСПЛАТНАЯ!
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Оплата</h3>
            <div className={styles.paymentOptions}>
              <label
                className={`${styles.paymentOption} ${
                  formData.paymentMethod === "sbp" ? styles.active : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="sbp"
                  checked={formData.paymentMethod === "sbp"}
                  onChange={handleInputChange}
                />
                <div className={styles.paymentContent}>
                  <img
                    src={spbBankLogo}
                    alt="СБП"
                    className={styles.paymentLogo}
                    loading="lazy"
                  />
                  <span>СБП</span>
                </div>
              </label>
              <label
                className={`${styles.paymentOption} ${
                  formData.paymentMethod === "sberpay" ? styles.active : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="sberpay"
                  checked={formData.paymentMethod === "sberpay"}
                  onChange={handleInputChange}
                />
                <div className={styles.paymentContent}>
                  <img
                    src={sberPayLogo}
                    alt="SberPay"
                    className={styles.paymentLogo}
                    loading="lazy"
                  />
                  <span>SberPay</span>
                </div>
              </label>
              <label
                className={`${styles.paymentOption} ${
                  formData.paymentMethod === "tpay" ? styles.active : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="tpay"
                  checked={formData.paymentMethod === "tpay"}
                  onChange={handleInputChange}
                />
                <div className={styles.paymentContent}>
                  <img
                    src={tBankLogo}
                    alt="T-Pay"
                    className={styles.paymentLogo}
                    loading="lazy"
                  />
                  <span>T-Pay</span>
                </div>
              </label>
              <label
                className={`${styles.paymentOption} ${
                  formData.paymentMethod === "card" ? styles.active : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={handleInputChange}
                />
                <div className={styles.paymentContent}>
                  <img
                    src={bankCardIcon}
                    alt="Банковская карта"
                    className={styles.paymentIcon}
                    loading="lazy"
                  />
                  <span>Банковская карта</span>
                </div>
              </label>
            </div>
            <p className={styles.paymentNote}>
              Перенаправим вас на страницу СБП, где вы сможете выбрать банк для
              оплаты. Это безопасно и надежно.
            </p>
          </section>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.rightColumnTopContent}>
            <div className={styles.selectedBox}>
              <button
                type="button"
                className={styles.editButton}
                title="Редактировать"
                onClick={onEdit}
              >
                <img src={editIcon} alt="Edit" loading="lazy" />
              </button>
              <div className={styles.boxImageWrapper}>
                <div className={styles.boxImage}>
                  <img
                    src={getThemeLogo(
                      boxPersonalization?.theme || selectedTheme
                    )}
                    alt={getThemeDisplayName(
                      boxPersonalization?.theme || selectedTheme
                    )}
                    className={styles.boxLogo}
                    loading="lazy"
                  />
                </div>
                <div className={styles.boxInfo}>
                  <h4 className={styles.boxTitle}>
                    {getThemeDisplayName(
                      boxPersonalization?.theme || selectedTheme
                    )}
                  </h4>
                  <div className={styles.boxDetails}>
                    <p>
                      Для кого:{" "}
                      <span>
                        {boxPersonalization?.recipient || "Не указано"}
                      </span>
                    </p>
                    <p>
                      Пол:{" "}
                      <span>
                        {boxPersonalization
                          ? getGenderDisplayName(boxPersonalization.gender)
                          : "Не указано"}
                      </span>
                    </p>
                    <p>
                      Ограничения:{" "}
                      <span>{boxPersonalization?.restrictions || "Нет"}</span>
                    </p>
                    <p>
                      Пожелания:{" "}
                      <span>
                        {boxPersonalization?.additionalWishes || "Нет"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightColumnBottomContent}>
            <div className={styles.promoSection}>
              <div className={styles.promoInput}>
                <input
                  type="text"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handleInputChange}
                  placeholder="Промокод"
                  className={`${styles.input} ${
                    promoStatus === "success"
                      ? styles.inputSuccess
                      : promoStatus === "error"
                      ? styles.inputError
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handlePromoApply}
                  className={`${styles.promoButton} ${
                    promoApplied ? styles.promoButtonDisabled : ""
                  }`}
                  disabled={promoApplied}
                >
                  <img src={rightArrow} alt="Apply" loading="lazy" />
                </button>
              </div>
              {promoMessage && (
                <div
                  className={
                    promoStatus === "success"
                      ? styles.promoMessageSuccess
                      : styles.promoMessageError
                  }
                >
                  {promoMessage}
                </div>
              )}
            </div>

            <div className={styles.priceDetails}>
              <h4 className={styles.priceTitle}>Детали цены</h4>
              <div className={styles.priceRow}>
                <span>Бокс</span>
                <span>{boxPrice}₽</span>
              </div>
              <div className={styles.priceRow}>
                <span>Доставка</span>
                <span>{deliveryPrice}₽</span>
              </div>
              {promoApplied && (
                <div className={`${styles.priceRow} ${styles.discount}`}>
                  <span>Скидка</span>
                  <span>-{promoDiscount}₽</span>
                </div>
              )}
              <div className={styles.priceLine}></div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Итого</span>
                <span>{totalPrice}₽</span>
              </div>
            </div>

            <div className={styles.agreements}>
              <label className={styles.checkboxLabel2}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                />
                <span className={styles.checkmark}></span>
                <span className={styles.agreementText}>
                  Согласен с{" "}
                  <a
                    href="#"
                    className={styles.link}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenPublicOffer) onOpenPublicOffer();
                    }}
                  >
                    публичной оферты
                  </a>{" "}
                  и{" "}
                  <a
                    href="#"
                    className={styles.link}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenPrivacyPolicy) onOpenPrivacyPolicy();
                    }}
                  >
                    конфиденциальности
                  </a>
                </span>
              </label>
              {errors.terms && (
                <div
                  style={{ color: "red", fontSize: "12px", marginLeft: "30px" }}
                >
                  {errors.terms}
                </div>
              )}

              <label className={styles.checkboxLabel2}>
                <input
                  type="checkbox"
                  name="receiveNews"
                  checked={formData.receiveNews}
                  onChange={handleInputChange}
                />
                <span className={styles.checkmark}></span>
                <span className={styles.agreementText}>
                  Хочу получать новости и спецпредложения
                </span>
              </label>
            </div>

            <div className={styles.finalPrice}>{totalPrice}₽</div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isProcessing}
              style={{
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? "wait" : "pointer",
              }}
            >
              {isProcessing ? "Обработка..." : "Оплатить"}
            </button>
          </div>
        </div>
      </form>

      {isMapOpen && (
        <DeliveryMapPage
          isOpen={isMapOpen}
          onClose={handleCloseMap}
          onDeliverySelect={handleDeliverySelect}
          initialMode={
            formData.deliveryType === "courier" ? "courier" : "pickup"
          }
          currentData={{
            address: formData.deliveryAddress,
            apartment: formData.apartment,
            entrance: formData.entrance,
            floor: formData.floor,
            comment: formData.courierComment,
          }}
        />
      )}
    </div>
  );
}
