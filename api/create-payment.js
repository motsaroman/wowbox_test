import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const BOX_DATA = {
  techno: { title: "ТЕХНО БОКС", price: 4900 },
  cozy: { title: "УЮТНЫЙ БОКС", price: 4900 },
  party: { title: "ПАТИ БОКС", price: 4900 },
  sweet: { title: "СЛАДКИЙ БОКС", price: 4900 },
};

const DELIVERY_PRICE = 99;
const VALID_PROMO = "ПЕРВЫЙ500";
const PROMO_DISCOUNT = 500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { boxTheme, promoCode, contactData, deliveryData, paymentMethod } = req.body;

    console.log('Incoming Request:', JSON.stringify(req.body, null, 2));

    const selectedBox = BOX_DATA[boxTheme];
    if (!selectedBox) {
      return res.status(400).json({ message: 'Неверно выбран бокс' });
    }

    const paymentMap = {
      'card': 'bank_card',
      'sbp': 'sbp',
      'sberpay': 'sberbank',
      'tpay': 'tinkoff_bank'
    };

    const yookassaMethodType = paymentMap[paymentMethod] || 'bank_card';

    let deliveryDescription = "";
    if (deliveryData.type === '5post') {
      deliveryDescription = `ПВЗ: ${deliveryData.pointName || 'Не указан'}`;
    } else if (deliveryData.type === 'courier') {
      deliveryDescription = `Курьер: ${deliveryData.address || 'Не указан'}`;
    }

    let boxPrice = selectedBox.price;
    if (promoCode && promoCode.toUpperCase() === VALID_PROMO) {
      boxPrice -= PROMO_DISCOUNT;
    }

    const items = [
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
          value: DELIVERY_PRICE.toFixed(2),
          currency: "RUB"
        },
        vat_code: "1",
        payment_mode: "full_prepayment",
        payment_subject: "service"
      }
    ];

    const totalAmountValue = (boxPrice + DELIVERY_PRICE).toFixed(2);
    const cleanPhone = contactData.phone ? contactData.phone.replace(/[^\d]/g, '') : '';

    const paymentData = {
      amount: {
        value: totalAmountValue,
        currency: "RUB"
      },
      capture: true,
      payment_method_data: {
        type: yookassaMethodType
      },
      confirmation: {
        type: "redirect",
        return_url: `${req.headers.origin}/?payment_success=true`
      },
      description: `Заказ: ${selectedBox.title}. ${deliveryDescription}`,
      receipt: {
        customer: {
          full_name: contactData.name || 'Покупатель',
          phone: cleanPhone,
          email: contactData.email || 'no-reply@example.com'
        },
        items: items
      },
      metadata: {
        theme: boxTheme,
        deliveryType: deliveryData.type,
        recipientPhone: contactData.phone
      }
    };

    console.log('Sending to Yookassa:', JSON.stringify(paymentData, null, 2));

    const auth = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');
    const idempotenceKey = uuidv4();

    const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      confirmationUrl: response.data.confirmation.confirmation_url
    });

  } catch (error) {
    console.error('Yookassa Error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Ошибка оплаты',
      yookassaError: error.response?.data
    });
  }
}