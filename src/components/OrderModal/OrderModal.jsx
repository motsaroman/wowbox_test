// src/components/OrderModal/OrderModal.jsx
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
}) {
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
    city: "Москва",
    deliveryPoint: "",
    deliveryAddress: "",
    apartment: "",
    entrance: "",
    floor: "",
    courierComment: "",
    paymentMethod: "sbp",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    saveCard: false,
    promoCode: "",
    acceptTerms: false,
    receiveNews: false,
  });

  const [promoApplied, setPromoApplied] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const boxPrice = 4900;
  const deliveryPrice = 99;
  const promoDiscount = promoApplied ? 500 : 0;
  const totalPrice = boxPrice + deliveryPrice - promoDiscount;

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (e, fieldName) => {
    let value = e.target.value;
    if (!value.startsWith("+7 ")) {
      value = "+7 ";
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handlePromoApply = () => {
    if (formData.promoCode.toUpperCase() === "ПЕРВЫЙ500") {
      setPromoApplied(true);
    }
  };

  const handleOpenMap = () => {
    setIsMapOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  const handleDeliverySelect = (deliveryData) => {
    if (deliveryData.mode === "pickup" && deliveryData.point) {
      setFormData((prev) => ({
        ...prev,
        deliveryType: "5post",
        deliveryPoint: deliveryData.point.name,
        pvzCode: deliveryData.point.id,
      }));
    } else if (deliveryData.mode === "courier") {
      setFormData((prev) => ({
        ...prev,
        deliveryType: "courier",
        deliveryAddress: deliveryData.address,
        apartment: deliveryData.apartment || prev.apartment,
        entrance: deliveryData.entrance || prev.entrance,
        floor: deliveryData.floor || prev.floor,
        courierComment: deliveryData.comment || prev.courierComment,
      }));
    }
    setIsMapOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      alert(
        "Пожалуйста, согласитесь с условиями публичной оферты и конфиденциальности"
      );
      return;
    }

    console.log("Order data:", formData);
    if (onPayment) {
      onPayment(formData.paymentMethod);
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

      <form className={styles.form} onSubmit={handleSubmit}>
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
                className={styles.input}
                required
              />
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
                className={styles.input}
                required
              />
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
                className={styles.input}
                required
              />
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
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Телефон получателя
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={(e) => handlePhoneChange(e, "recipientPhone")}
                    placeholder="+7 (000) 000-00-00"
                    className={styles.input}
                  />
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

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Город<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            {formData.deliveryType === "5post" ? (
              <div className={styles.inputGroup}>
                <p className={styles.label}>
                  Пункт выдачи<span className={styles.required}>*</span>
                </p>

                <div className={styles.select} onClick={handleOpenMap}>
                  <p style={{ cursor: "pointer" }}>
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
                  <div className={styles.input} onClick={handleOpenMap}>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Введите адрес..."
                      className={styles.inputItem}
                      required
                    />
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

            {formData.paymentMethod === "card" && (
              <div className={styles.cardForm}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Номер карты"
                    className={styles.input}
                    maxLength="19"
                  />
                </div>

                <div className={styles.cardGrid}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/ГГ"
                      className={styles.input}
                      maxLength="5"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={handleInputChange}
                      placeholder="CVV / CVC"
                      className={styles.input}
                      maxLength="3"
                    />
                  </div>
                </div>

                <label className={styles.checkboxLabel2}>
                  <input
                    type="checkbox"
                    name="saveCard"
                    checked={formData.saveCard}
                    onChange={handleInputChange}
                  />
                  <span className={styles.checkmark}></span>
                  <span className={styles.agreementText}>Сохранить карту</span>
                </label>
              </div>
            )}

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
                    src={
                      boxPersonalization
                        ? getThemeLogo(boxPersonalization.theme)
                        : texno1
                    }
                    alt={
                      boxPersonalization
                        ? getThemeDisplayName(boxPersonalization.theme)
                        : "Техно бокс"
                    }
                    className={styles.boxLogo}
                    loading="lazy"
                  />
                </div>
                <div className={styles.boxInfo}>
                  <h4 className={styles.boxTitle}>
                    {boxPersonalization
                      ? getThemeDisplayName(boxPersonalization.theme)
                      : "ТЕХНО"}
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
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={handlePromoApply}
                  className={styles.promoButton}
                  disabled={promoApplied}
                >
                  <img src={rightArrow} alt="Apply" loading="lazy" />
                </button>
              </div>
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

            <button type="submit" className={styles.submitButton}>
              Оплатить
            </button>
          </div>
        </div>
      </form>

      {/* Delivery Map Modal */}
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
