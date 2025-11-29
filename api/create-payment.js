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
    '29251dcf-00a1-4e34-98d4-5c47484a36d4': 232, // МО
    'c2deb16a-0330-4f05-821f-1d09c93331e6': 220, // СПб

    // Остальные города (сгенерировано из вашего списка)
    'a101dd8b-3aee-4bda-9c61-9df106f145ff': 233, // Астрахань
    '02e9c019-ab4d-4fa0-928e-d6c0a41dc256': 233, // Белгород
    '414b71cf-921e-4bfc-b6e0-f7395d16aaef': 233, // Брянск
    '023484a5-f98d-4849-82e1-b7e0444b54ef': 233, // Вологда
    'f66a00e6-179e-4de9-8ecb-78b0277c9f10': 233, // Владимир
    '5bf5ddff-6353-4a3d-80c4-6fb27f00c6c1': 233, // Воронеж
    'a52b7389-0cfe-46fb-ae15-298652a64cf8': 233, // Волгоград
    '40c6863e-2a5f-4033-a377-3416533948bd': 233, // Иваново
    '93b3df57-4c89-44df-ac42-96f05e9cd3b9': 233, // Казань
    'b502ae45-897e-4b6f-9776-6ff49740b537': 233, // Калуга
    '452a2ddf-88a1-4e35-8d8d-8635493768d4': 233, // Киров
    '14c73394-b886-40a9-9e5c-547cfd4d6aad': 233, // Кострома
    '7dfa745e-aa19-4688-b121-b655c11e482f': 233, // Краснодар
    'd790c72e-479b-4da2-90d7-842b1712a71c': 233, // Курск
    'eacb5f15-1a2e-432e-904a-ca56bd635f1b': 233, // Липецк
    '555e7d61-d9a7-4ba6-9770-6caa8198c483': 233, // Нижний Новгород
    '2abed4d9-5565-4885-bc96-f4ffccc6cba4': 233, // Орел
    'dce97bff-deb2-4fd9-9aec-4f4327bbf89b': 233, // Оренбург
    'ff3292b1-a1d2-47d4-b35b-ac06b50555cc': 233, // Пенза
    'a309e4ce-2f36-4106-b1ca-53e0f48a6d95': 233, // Пермь
    'c1cfe4b9-f7c2-423c-abfa-6ed1c05a15c5': 233, // Ростов-на-Дону
    '86e5bae4-ef58-4031-b34f-5e9ff914cd55': 233, // Рязань
    'bb035cc3-1dc2-4627-9d25-a1bf2d4b936b': 233, // Самара
    'bf465fda-7834-47d5-986b-ccdb584a85a6': 233, // Саратов
    'd414a2e8-9e1e-48c1-94a4-7308d5608177': 233, // Смоленск
    'ea2a1270-1e19-4224-b1a0-4228b9de3c7a': 233, // Тамбов
    'c52ea942-555e-45c6-9751-58897717b02f': 233, // Тверь
    'b2601b18-6da2-4789-9fbe-800dde06a2bb': 233, // Тула
    '7339e834-2cb4-4734-a4c7-1fca2c66e562': 233, // Уфа
    'bebfd75d-a0da-4bf9-8307-2e2c85eac463': 233, // Ульяновск
    'dd8caeab-c685-4f2a-bf5f-550aca1bbc48': 233, // Чебоксары
    '6b1bab7d-ee45-4168-a2a6-4ce2880d90d3': 233, // Ярославль
    
    // Группа 287 руб
    '2763c110-cb8b-416a-9dac-ad28a55b4402': 287, // Екатеринбург
    '9ae64229-9f7b-4149-b27a-d1f6ec74b5ce': 287, // Тюмень
    'a376e68d-724a-4472-be7c-891bdb09ae32': 287, // Челябинск
    '913a82e3-b671-43d5-97b4-8a08b8ee2d28': 287, // Нальчик
    '20ea2341-4f49-4c5c-a9dc-a54688c8cc61': 287, // Владикавказ
    '2a1c7bdb-05ea-492f-9e1c-b3999f79dcbc': 287, // Ставрополь
    '8d0a05bf-3b8a-43e9-ac26-7ce61d7c4560': 287, // Великий Новгород

    // Группа 398 руб
    '06814fb6-0dc3-4bec-ba20-11f894a0faf5': 398, // Архангельск
    'd13945a8-7017-46ab-b1e6-ede1e89317ad': 398, // Барнаул
    '94bb19a3-c1fa-410b-8651-ac1bf7c050cd': 398, // Кемерово
    '8dea00e3-9aab-4d8e-887c-ef2aaa546456': 398, // Новосибирск
    '140e31da-27bf-4519-9ea0-6185d681d44e': 398, // Омск
    'e3b0eae8-a4ce-4779-ae04-5c0797de66be': 398, // Томск

    // Группа 614 руб
    '9b968c73-f4d4-4012-8da8-3dacd4d4c1bd': 614, // Красноярск

    // Дополнительные
    'fc9c55d0-c66e-455e-8034-b0944b025c38': 337, // Армавир
    'a2072dc5-45be-4db3-ab13-10784ba8b2ae': 410, // Грозный
    '988157bf-d6d5-4c2a-80ec-4ad531eea056': 410, // Магнитогорск
    '727cdf1e-1b70-4e07-8995-9bf7ca9abefb': 410, // Махачкала
    'cc73d6af-6e2e-4a1f-be8e-682c289b0b57': 410, // Нижний Тагил
    'b28b6f6f-1435-444e-95a6-68c499b0d27a': 468, // Новокузнецк
    '9b0efbd0-22bb-400d-86db-ddc69b9939d9': 410, // Пятигорск
    'b9001e55-72ed-43bf-b7eb-41b86a14380e': 410, // Симферополь
    '79da737a-603b-4c19-9b54-9114c96fb912': 337, // Сочи
    '242e87c1-584d-4360-8c4c-aae2fe90048e': 337, // Тольятти
    'b4c30848-5181-44b4-88fa-456e1c4aeb0f': 337, // Череповец
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