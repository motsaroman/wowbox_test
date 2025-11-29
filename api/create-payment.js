import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// ------------------------------------------------------------------
// 1. КОНСТАНТЫ И НАСТРОЙКИ
// ------------------------------------------------------------------

const BOX_DATA = {
  techno: { title: "ТЕХНО БОКС", price: 4900 },
  cozy: { title: "УЮТНЫЙ БОКС", price: 4900 },
  party: { title: "ПАТИ БОКС", price: 4900 },
  sweet: { title: "СЛАДКИЙ БОКС", price: 4900 },
};

const DEFAULT_DELIVERY_PRICE = 350; // Цена, если города нет в списке
const VALID_PROMO = "ПЕРВЫЙ500";
const PROMO_DISCOUNT = 500;

// Таблица цен доставки (ФИАС -> Цена)
const DELIVERY_RATES = {
    // Москва и область
    '0c5b2444-70a0-4932-980c-b4dc0d3f02b5': 211, // Москва
    '29251dcf-00a1-4e34-98d4-5c47484a36d4': 232, // Московская область
    'c2deb16a-0330-4f05-821f-1d09c93331e6': 220, // Санкт-Петербург

    // Группа за 233 руб (Астрахань, Белгород, Воронеж, Краснодар, Казань...)
    'a101dd8b-3aee-4bda-9c61-9df106f145ff': 233, // Астрахань
    '02e9c019-ab4d-4fa0-928e-d6c0a41dc256': 233, // Белгород
    '414b71cf-921e-4bfc-b6e0-f7395d16aaef': 233, // Брянск
    'f66a00e6-179e-4de9-8ecb-78b0277c9f10': 233, // Владимир
    '5bf5ddff-6353-4a3d-80c4-6fb27f00c6c1': 233, // Воронеж
    'a52b7389-0cfe-46fb-ae15-298652a64cf8': 233, // Волгоград
    '7dfa745e-aa19-4688-b121-b655c11e482f': 233, // Краснодар
    'c1cfe4b9-f7c2-423c-abfa-6ed1c05a15c5': 233, // Ростов-на-Дону
    'bb035cc3-1dc2-4627-9d25-a1bf2d4b936b': 233, // Самара
    '93b3df57-4c89-44df-ac42-96f05e9cd3b9': 233, // Казань
    '7339e834-2cb4-4734-a4c7-1fca2c66e562': 233, // Уфа
    '555e7d61-d9a7-4ba6-9770-6caa8198c483': 233, // Нижний Новгород
    'a309e4ce-2f36-4106-b1ca-53e0f48a6d95': 233, // Пермь

    // Группа за 287 руб (Екатеринбург, Тюмень...)
    '2763c110-cb8b-416a-9dac-ad28a55b4402': 287, // Екатеринбург
    '9ae64229-9f7b-4149-b27a-d1f6ec74b5ce': 287, // Тюмень
    'a376e68d-724a-4472-be7c-891bdb09ae32': 287, // Челябинск
    '2a1c7bdb-05ea-492f-9e1c-b3999f79dcbc': 287, // Ставрополь

    // Группа за 398 руб (Новосибирск, Омск...)
    '8dea00e3-9aab-4d8e-887c-ef2aaa546456': 398, // Новосибирск
    '140e31da-27bf-4519-9ea0-6185d681d44e': 398, // Омск
    'e3b0eae8-a4ce-4779-ae04-5c0797de66be': 398, // Томск

    // Группа за 614 руб
    '9b968c73-f4d4-4012-8da8-3dacd4d4c1bd': 614, // Красноярск
};

// ------------------------------------------------------------------
// 2. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: СОЗДАНИЕ ЗАКАЗА В RETAILCRM
// ------------------------------------------------------------------

async function createOrderInRetailCRM(data) {
  // Проверяем наличие ключей
  if (!process.env.RETAILCRM_URL || !process.env.RETAILCRM_API_KEY) {
    console.warn("RetailCRM credentials missing");
    return null;
  }

  try {
    // Подготовка адреса
    let deliveryAddressText = "";
    if (data.delivery.type === '5post') {
      deliveryAddressText = `ПВЗ 5Post: ${data.delivery.pointName} (Code: ${data.delivery.pointId})`;
    } else {
      deliveryAddressText = data.delivery.fullAddress; // Строка адреса от курьера
    }

    // Данные для CRM
    const crmOrder = {
      orderMethod: 'site',
      firstName: data.contact.name,
      email: data.contact.email,
      phone: data.contact.phone,
      customerComment: data.comments.user,
      managerComment: `
        Персонализация:
        Пол: ${data.comments.personalization.gender || 'Не указан'}
        Ограничения: ${data.comments.personalization.restrictions || 'Нет'}
        Пожелания: ${data.comments.personalization.wishes || 'Нет'}
        Получатель: ${data.recipient ? `${data.recipient.name} (${data.recipient.phone})` : 'Заказчик'}
      `,
      delivery: {
        // Коды доставки должны совпадать с CRM (например, 'courier' и 'pickup')
        code: data.delivery.type === 'courier' ? 'courier' : 'pickup',
        cost: data.prices.delivery, // Передаем рассчитанную цену доставки
        netCost: data.prices.delivery,
        address: {
          text: deliveryAddressText,
          city: data.delivery.city
        }
      },
      items: [
        {
          productName: data.boxTitle,
          initialPrice: data.prices.box,
          quantity: 1,
          offer: {
            displayName: data.boxTitle,
            name: data.boxTitle
          }
        },
        {
          productName: "Доставка",
          initialPrice: data.prices.delivery,
          quantity: 1
        }
      ],
      // Создаем "пустой" платеж, чтобы потом обновить его вебхуком
      payments: [
        {
          type: data.paymentTypeCrm, // 'bank-card', 'sbp' и т.д.
          status: 'not-paid',
          amount: data.prices.total
        }
      ],
      customFields: {
        // Если настроены UTM метки в CRM
        utm_source: data.utm?.source,
        utm_medium: data.utm?.medium,
        utm_campaign: data.utm?.campaign
      }
    };

    // Отправка в RetailCRM (формат x-www-form-urlencoded)
    const params = new URLSearchParams();
    params.append('order', JSON.stringify(crmOrder));
    params.append('apiKey', process.env.RETAILCRM_API_KEY);
    params.append('site', 'wowbox'); // Код магазина

    const response = await axios.post(
      `${process.env.RETAILCRM_URL}/api/v5/orders/create`,
      params
    );

    if (response.data.success) {
      console.log(`CRM Order Created: ID ${response.data.id}`);
      return response.data.id;
    } else {
      console.error('RetailCRM Error:', response.data);
      return null;
    }

  } catch (error) {
    console.error('RetailCRM Request Failed:', error.message);
    return null;
  }
}

// ------------------------------------------------------------------
// 3. ОСНОВНОЙ ХЕНДЛЕР (API ENTRY POINT)
// ------------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { 
      boxTheme, promoCode, contactData, deliveryData, 
      paymentMethod, recipientData, comments, utm 
    } = req.body;

    // --- А. ВАЛИДАЦИЯ ТОВАРА ---
    const selectedBox = BOX_DATA[boxTheme] || BOX_DATA['techno'];
    
    // --- Б. РАСЧЕТ СТОИМОСТИ ---
    // 1. Цена бокса
    let boxPrice = selectedBox.price;
    if (promoCode && promoCode.toUpperCase() === VALID_PROMO) {
      boxPrice -= PROMO_DISCOUNT;
    }

    // 2. Цена доставки (Считаем на сервере по ФИАС!)
    const cityFias = deliveryData.details?.cityFias;
    let deliveryPrice = DELIVERY_RATES[cityFias] || DEFAULT_DELIVERY_PRICE;

    // (Опционально) Наценка на курьера, если нужно
    // if (deliveryData.type === 'courier') { deliveryPrice += 0; }

    const totalAmountValue = (boxPrice + deliveryPrice).toFixed(2);

    // --- В. ПОДГОТОВКА ДАННЫХ ---
    // Маппинг метода оплаты для ЮKassa
    const yookassaPaymentMap = {
      'sbp': 'sbp',
      'card': 'bank_card',
      'sberpay': 'sberbank',
      'tpay': 'tinkoff_bank'
    };
    const yookassaMethod = yookassaPaymentMap[paymentMethod] || 'bank_card';

    // Маппинг метода оплаты для CRM (сверьте с вашим справочником CRM!)
    const crmPaymentType = 'bank-card'; // Пока ставим общий, или сделайте маппинг

    // Описание доставки
    let deliveryDescription = "";
    if (deliveryData.type === '5post') {
      deliveryDescription = `ПВЗ 5Post: ${deliveryData.pointName}`;
    } else {
      deliveryDescription = `Курьер: ${deliveryData.address}`;
    }

    // --- Г. СОЗДАНИЕ ЗАКАЗА В CRM ---
    const crmId = await createOrderInRetailCRM({
      contact: contactData,
      recipient: recipientData,
      comments: comments || { personalization: {} },
      delivery: {
        type: deliveryData.type,
        pointId: deliveryData.pointId,
        pointName: deliveryData.pointName,
        fullAddress: deliveryData.address,
        city: deliveryData.details?.city || 'Москва'
      },
      boxTitle: selectedBox.title,
      prices: {
        box: boxPrice,
        delivery: deliveryPrice,
        total: parseFloat(totalAmountValue)
      },
      paymentTypeCrm: crmPaymentType,
      utm: utm
    });

    // --- Д. СОЗДАНИЕ ПЛАТЕЖА В ЮKASSA ---
    const auth = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');
    const idempotenceKey = uuidv4();
    const cleanPhone = contactData.phone.replace(/[^\d]/g, '');

    const paymentData = {
      amount: {
        value: totalAmountValue,
        currency: "RUB"
      },
      capture: true,
      payment_method_data: {
        type: yookassaMethod
      },
      confirmation: {
        type: "redirect",
        return_url: `${req.headers.origin}/?payment_success=true`
      },
      description: `Заказ ${crmId ? `#${crmId}` : ''}: ${selectedBox.title}`,
      metadata: {
        crmId: crmId, // Важно для вебхука
        theme: boxTheme
      },
      receipt: {
        customer: {
          full_name: contactData.name,
          phone: cleanPhone,
          email: contactData.email
        },
        items: [
          {
            description: selectedBox.title,
            quantity: "1",
            amount: {
              value: boxPrice.toFixed(2),
              currency: "RUB"
            },
            vat_code: "1",
            payment_mode: "full_prepayment",
            payment_subject: "commodity"
          },
          {
            description: "Доставка",
            quantity: "1",
            amount: {
              value: deliveryPrice.toFixed(2),
              currency: "RUB"
            },
            vat_code: "1",
            payment_mode: "full_prepayment",
            payment_subject: "service"
          }
        ]
      }
    };

    console.log('Sending to Yookassa...');
    
    const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({ 
      confirmationUrl: response.data.confirmation.confirmation_url,
      crmId: crmId 
    });

  } catch (error) {
    console.error('Global Error:', error.message);
    if (error.response) {
       console.error('Yookassa/CRM Response:', error.response.data);
    }
    
    return res.status(500).json({ 
      message: 'Ошибка при создании заказа',
      details: error.message 
    });
  }
}