import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { event, object } = req.body;

    console.log('Webhook received:', event, object.id);

    if (event === 'payment.succeeded') {
      const crmId = object.metadata.crmId;

      if (crmId && process.env.RETAILCRM_URL && process.env.RETAILCRM_API_KEY) {
        console.log(`Payment success for CRM Order #${crmId}. Creating payment transaction...`);

        const paymentParams = new URLSearchParams();
        const now = new Date();
        const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

        const paymentData = {
          order: { id: crmId },
          amount: object.amount.value,
          type: 'bank-card',   
          status: 'paid',
          paidAt: formattedDate,
          comment: `Оплата через ЮKassa. Транзакция: ${object.id}`
        };

        paymentParams.append('payment', JSON.stringify(paymentData));
        paymentParams.append('apiKey', process.env.RETAILCRM_API_KEY);
        paymentParams.append('site', 'wowbox-site');

        try {
          const response = await axios.post(
            `${process.env.RETAILCRM_URL}/api/v5/orders/payments/create`,
            paymentParams
          );
          
          if (response.data.success) {
             console.log(`Payment created successfully for Order #${crmId}. Payment ID: ${response.data.id}`);
          } else {
             console.error('RetailCRM Error:', response.data);
          }
          
        } catch (crmError) {
          console.error('RetailCRM Request Failed:', crmError.response?.data || crmError.message);
        }
      } else {
        console.warn('Missing crmId in metadata');
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send('Error');
  }
}