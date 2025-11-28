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


async function createOrderInRetailCRM(orderData) {
  if (!process.env.RETAILCRM_URL || !process.env.RETAILCRM_API_KEY) {
    console.warn("RetailCRM не найден");
    return null;
  }

  try {
    const crmOrder = {
      orderMethod: 'site',
      firstName: orderData.contact.name,
      email: orderData.contact.email,
      phone: orderData.contact.phone,
      customerComment: orderData.comments.user,
      managerComment: `
        Персонализация:
        Пол: ${orderData.comments.personalization.gender}
        Ограничения: ${orderData.comments.personalization.restrictions}
        Пожелания: ${orderData.comments.personalization.wishes}
        Получатель: ${orderData.recipient ? `${orderData.recipient.name} (${orderData.recipient.phone})` : 'Заказчик'}
      `,
      delivery: {
        code: orderData.delivery.type === 'courier' ? 'courier' : 'pickup',
        address: {
          text: orderData.delivery.fullAddress,
          city: orderData.delivery.details.city,
        }
      },
      items: [
        {
          productName: orderData.boxTitle,
          initialPrice: orderData.boxPrice,
          quantity: 1,
          offer: {
            displayName: orderData.boxTitle,
            name: orderData.boxTitle,
            // externalId: 'code-123'
          }
        },
        {
           productName: "Доставка",
           initialPrice: DELIVERY_PRICE,
           quantity: 1
        }
      ],
      customFields: {
        // utm_source: orderData.utm.source 
      }
    };

    const params = new URLSearchParams();
    params.append('order', JSON.stringify(crmOrder));
    params.append('apiKey', process.env.RETAILCRM_API_KEY);
    params.append('site', 'wowbox-site');

    const response = await axios.post(
      `${process.env.RETAILCRM_URL}/api/v5/orders/create`,
      params
    );

    if (response.data.success) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { 
      boxTheme, promoCode, contactData, deliveryData, 
      paymentMethod, recipientData, comments, utm 
    } = req.body;

    const selectedBox = BOX_DATA[boxTheme] || BOX_DATA['techno'];
    
    let boxPrice = selectedBox.price;
    if (promoCode && promoCode.toUpperCase() === VALID_PROMO) {
      boxPrice -= PROMO_DISCOUNT;
    }
    const totalAmountValue = (boxPrice + DELIVERY_PRICE).toFixed(2);
    
    let deliveryDescription = "";
    let fullDeliveryAddress = "";
    
    if (deliveryData.type === '5post') {
      fullDeliveryAddress = `ПВЗ: ${deliveryData.pointName} (${deliveryData.pointId})`;
      deliveryDescription = fullDeliveryAddress;
    } else {
      fullDeliveryAddress = deliveryData.address;
      deliveryDescription = `Курьер: ${fullDeliveryAddress}`;
    }

    const crmId = await createOrderInRetailCRM({
      contact: contactData,
      recipient: recipientData,
      comments: comments,
      delivery: { ...deliveryData, fullAddress: fullDeliveryAddress },
      boxTitle: selectedBox.title,
      boxPrice: boxPrice,
      utm: utm || {}
    });

    console.log(`Создан заказ в RetailCRM: ${crmId}`);

    const items = [
      {
        description: selectedBox.title,
        quantity: "1",
        amount: { value: boxPrice.toFixed(2), currency: "RUB" },
        vat_code: "1", payment_mode: "full_prepayment", payment_subject: "commodity"
      },
      {
        description: "Доставка",
        quantity: "1",
        amount: { value: DELIVERY_PRICE.toFixed(2), currency: "RUB" },
        vat_code: "1", payment_mode: "full_prepayment", payment_subject: "service"
      }
    ];

    const paymentMap = { 'sbp': 'sbp', 'card': 'bank_card', 'sberpay': 'sberbank', 'tpay': 'tinkoff_bank' };
    
    const paymentData = {
      amount: { value: totalAmountValue, currency: "RUB" },
      capture: true,
      payment_method_data: { type: paymentMap[paymentMethod] || 'bank_card' },
      confirmation: { type: "redirect", return_url: `${req.headers.origin}/?payment_success=true` },
      description: `Заказ CRM #${crmId || '?'}: ${selectedBox.title}`,
      receipt: {
        customer: {
          full_name: contactData.name,
          phone: contactData.phone.replace(/[^\d]/g, ''),
          email: contactData.email
        },
        items: items
      },
      metadata: {
        crmId: crmId,
        theme: boxTheme,
        recipientPhone: contactData.phone
      }
    };

    const auth = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64');
    
    const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Idempotence-Key': uuidv4(),
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({ confirmationUrl: response.data.confirmation.confirmation_url });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Error creating payment' });
  }
}