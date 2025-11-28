import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const BOX_DATA = {
  techno: {
    title: "ТЕХНО БОКС",
    price: 4900,
  },
  cozy: {
    title: "УЮТНЫЙ БОКС",
    price: 4900,
  },
  party: {
    title: "ПАТИ БОКС",
    price: 4900,
  },
  sweet: {
    title: "СЛАДКИЙ БОКС",
    price: 4900,
  },
};

const DELIVERY_PRICE = 99;
const VALID_PROMO = "ПЕРВЫЙ500";
const PROMO_DISCOUNT = 500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { 
      boxTheme,
      promoCode, 
      contactData, 
      deliveryData
    } = req.body;
    const selectedBox = BOX_DATA[boxTheme];
    if (!selectedBox) {
      return res.status(400).json({ message: 'Неверно выбран бокс (товар не найден)' });
    }
    let deliveryDescription = "";
    if (deliveryData.type === '5post') {
      if (!deliveryData.pointId || !deliveryData.pointName) {
        return res.status(400).json({ message: 'Не выбран пункт выдачи 5Post' });
      }
      deliveryDescription = `ПВЗ: ${deliveryData.pointName} (${deliveryData.pointId})`;
    } else if (deliveryData.type === 'courier') {
      if (!deliveryData.address) {
        return res.status(400).json({ message: 'Не указан адрес доставки' });
      }
      deliveryDescription = `Курьер: ${deliveryData.address}`;
    } else {

       return res.status(400).json({ message: 'Неверный тип доставки' });
    }

    let amount = selectedBox.price + DELIVERY_PRICE;

    let appliedDiscount = 0;
    if (promoCode && promoCode.toUpperCase() === VALID_PROMO) {
      appliedDiscount = PROMO_DISCOUNT;
      amount -= appliedDiscount;
    }

    const auth = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');
    const idempotenceKey = uuidv4();
    const paymentDescription = `Заказ: ${selectedBox.title}. Доставка: ${deliveryData.type === '5post' ? '5Post' : 'Курьер'}`;

    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${req.headers.origin}/?payment_success=true`
      },
      description: paymentDescription,
      receipt: {
        customer: {
          full_name: contactData.name,
          phone: contactData.phone,
          email: contactData.email
        },
        items: [
          {
            description: selectedBox.title,
            quantity: "1.00",
            amount: {
              value: (selectedBox.price - appliedDiscount).toFixed(2),
              currency: "RUB"
            },
            vat_code: "1",
            payment_mode: "full_prepayment",
            payment_subject: "commodity"
          },
          {
            description: "Доставка (" + deliveryDescription + ")",
            quantity: "1.00",
            amount: {
              value: DELIVERY_PRICE.toFixed(2),
              currency: "RUB"
            },
            vat_code: "1",
            payment_mode: "full_prepayment",
            payment_subject: "service"
          }
        ]
      },
      metadata: {
        theme: boxTheme,
        deliveryType: deliveryData.type,
        deliveryPoint: deliveryData.pointName,
        recipientPhone: contactData.phone
      }
    };

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
    console.error('Payment Error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Ошибка создания платежа' });
  }
}