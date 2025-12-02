import { useEffect, useState } from "react";
import { useOrderStore } from "../../store/orderStore";
import { useBoxStore } from "../../store/boxStore";
import DeliveryMapPage from "../DeliveryMapPage/DeliveryMapPage";
import ContactForm from "./components/ContactForm";
import RecipientForm from "./components/RecipientForm";
import DeliverySection from "./components/DeliverySection";
import PaymentSection from "./components/PaymentSection";
import OrderSummary from "./components/OrderSummary";

import editIcon from "../../assets/icons/edit.svg";
import texno1 from "../../assets/images/texno1.webp";
import texno2 from "../../assets/images/texno4.webp";
import texno3 from "../../assets/images/texno2.webp";
import texno4 from "../../assets/images/texno3.webp";
import styles from "./OrderModal.module.css";

export default function OrderModal({
  onPayment,
  onOpenPrivacyPolicy,
  onOpenPublicOffer,
}) {
  // Данные формы и логика валидации из OrderStore
  const { 
    resetForm, 
    validateForm, 
    formData, 
    setProcessing, 
    updateDelivery, 
    deliveryPrice, 
    boxPrice, 
    promoApplied 
  } = useOrderStore();
  
  // Данные товара и управление модалкой из BoxStore
  const { 
      isOrderModalOpen, 
      closeOrderModal, 
      editOrder, 
      selectedTheme, 
      personalizationData 
  } = useBoxStore();

  const [isMapOpen, setIsMapOpen] = useState(false);

  // Инициализация при открытии (сброс формы и блокировка скролла)
  useEffect(() => {
    if (isOrderModalOpen) {
      resetForm();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOrderModalOpen, resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Запускаем валидацию полей в сторе
    if (!validateForm()) {
        console.log("Ошибка валидации формы");
        return; 
    }

    setProcessing(true);

    try {
      // Расчет итоговой суммы
      const totalPrice = boxPrice + deliveryPrice - (promoApplied ? 500 : 0);
      
      // Формируем данные персонализации (если есть, или берем дефолт)
      const personalData = {
        theme: personalizationData?.theme || selectedTheme,
        gender: personalizationData?.gender || 'не указан',
        recipient: personalizationData?.recipient || 'не указан',
        restrictions: personalizationData?.restrictions || 'нет',
        wishes: personalizationData?.additionalWishes || 'нет',
      };

      // Формируем полный адрес для курьера (строкой)
      let fullCourierAddress = null;
      if (formData.deliveryType === 'courier') {
        const parts = [
          formData.city,
          formData.deliveryAddress,
          formData.apartment ? `кв. ${formData.apartment}` : '',
          formData.entrance ? `под. ${formData.entrance}` : '',
          formData.floor ? `эт. ${formData.floor}` : ''
        ];
        fullCourierAddress = parts.filter(Boolean).join(', ');
      }

      // Основной пейлоад
      const payload = {
        boxTheme: personalData.theme,
        promoCode: formData.promoCode,
        paymentMethod: formData.paymentMethod,
        contactData: { 
            name: formData.name, 
            phone: formData.phone, 
            email: formData.email 
        },
        recipientData: formData.isGift ? { 
            name: formData.recipientName, 
            phone: formData.recipientPhone 
        } : null,
        comments: {
          user: formData.comment,
          courier: formData.courierComment,
          personalization: personalData 
        },
        deliveryData: {
          type: formData.deliveryType,
          pointId: formData.pvzCode,
          // Очищаем название точки от лишнего
          pointName: formData.deliveryPoint ? formData.deliveryPoint.split(' (')[1]?.replace(')', '') : null, 
          address: fullCourierAddress, 
          details: {
            city: formData.city,
            cityFias: formData.cityFias,
            street: formData.deliveryAddress,
            flat: formData.apartment,
            floor: formData.floor,
            entrance: formData.entrance
          }
        },
        clientPrices: { 
            box: boxPrice, 
            delivery: deliveryPrice, 
            total: totalPrice 
        },
        utm: {
          source: new URLSearchParams(window.location.search).get("utm_source") || "direct",
          medium: new URLSearchParams(window.location.search).get("utm_medium"),
          campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
        }
      };

      // Отправляем на бэкенд
      const response = await fetch('/create-payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.confirmationUrl) {
        // Переход на оплату
        window.location.href = data.confirmationUrl;
        
        // (Опционально) Сообщаем родителю об успехе, если нужно открыть модалку ожидания
        onPayment(formData.paymentMethod); 
        closeOrderModal();
      } else {
        alert('Ошибка: ' + (data.message || 'Попробуйте позже'));
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка сети. Проверьте соединение.');
    } finally {
      setProcessing(false);
    }
  };

  // Хелперы для отображения
  const getThemeDisplayName = (theme) => {
    const themeMap = { techno: "ТЕХНО", cozy: "УЮТНЫЙ", party: "ПАТИ", sweet: "СЛАДКИЙ" };
    return themeMap[theme] || theme?.toUpperCase() || "ТЕХНО";
  };
  
  const getThemeLogo = (theme) => {
    const logoMap = { techno: texno1, cozy: texno2, party: texno3, sweet: texno4 };
    return logoMap[theme] || texno1;
  };

  const getGenderDisplayName = (gender) => ({ 
      female: "Женский", 
      male: "Мужской", 
      "not-important": "Не важно" 
  }[gender] || "Не указано");

  if (!isOrderModalOpen) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Оформление заказа</h2>
        <button className={styles.closeButton} onClick={closeOrderModal}>✕</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.leftColumn}>
          <ContactForm />
          <RecipientForm />
          {/* Передаем открытие карты */}
          <DeliverySection onOpenMap={() => setIsMapOpen(true)} />
          <PaymentSection />
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.rightColumnTopContent}>
            <div className={styles.selectedBox}>
              <button type="button" className={styles.editButton} onClick={editOrder} title="Редактировать">
                  <img src={editIcon} alt="Edit" />
              </button>
              
              <div className={styles.boxImageWrapper}>
                <div className={styles.boxImage}>
                  <img 
                    src={getThemeLogo(personalizationData?.theme || selectedTheme)} 
                    alt="box" 
                    className={styles.boxLogo} 
                  />
                </div>
                <div className={styles.boxInfo}>
                  <h4 className={styles.boxTitle}>
                      {getThemeDisplayName(personalizationData?.theme || selectedTheme)}
                  </h4>
                  <div className={styles.boxDetails}>
                    <p>Для кого: <span>{personalizationData?.recipient || "Не указано"}</span></p>
                    <p>Пол: <span>{getGenderDisplayName(personalizationData?.gender)}</span></p>
                    <p>Ограничения: <span>{personalizationData?.restrictions || "Нет"}</span></p>
                    <p>Пожелания: <span>{personalizationData?.additionalWishes || "Нет"}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Компонент с итогами, промокодом и кнопкой отправки */}
          <OrderSummary 
            onSubmit={handleSubmit} 
            onOpenPrivacy={onOpenPrivacyPolicy} 
            onOpenOffer={onOpenPublicOffer} 
          />
        </div>
      </form>

      {isMapOpen && (
        <DeliveryMapPage
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onDeliverySelect={updateDelivery} // Экшен из OrderStore
          initialMode={formData.deliveryType === "courier" ? "courier" : "pickup"}
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