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
        const apiKey = process.env.RETAILCRM_API_KEY;
        const site = 'wowbox';
        const apiUrl = process.env.RETAILCRM_URL;

        console.log(`Processing success for Order #${crmId}. Fetching existing payments...`);

        try {
          const orderResponse = await axios.get(`${apiUrl}/api/v5/orders/${crmId}`, {
            params: { apiKey, site, by: 'id' }
          });

          const order = orderResponse.data.order;
          let targetPayment = null;
          if (order.payments && order.payments.length > 0) {
            // Берем первый платеж из списка
            targetPayment = order.payments[0];
          }

          if (targetPayment) {
            console.log(`Found Payment #${targetPayment.id}. Updating status to 'paid'...`);
            
            const updateParams = new URLSearchParams();
            const paymentData = {
              status: 'paid', // Ставим статус "Оплачен"
              amount: object.amount.value,
              paidAt: new Date().toISOString(),
              comment: `Оплата ЮKassa: ${object.id}`
            };

            updateParams.append('payment', JSON.stringify(paymentData));
            updateParams.append('apiKey', apiKey);
            updateParams.append('site', site);

            await axios.post(
              `${apiUrl}/api/v5/orders/payments/${targetPayment.id}/edit`,
              updateParams
            );
            console.log(`Payment #${targetPayment.id} updated successfully.`);

          } else {
            console.log(`No payments found in Order #${crmId}. Creating new payment...`);
            
            const createParams = new URLSearchParams();
            createParams.append('payment', JSON.stringify({
              order: { id: crmId },
              amount: object.amount.value,
              status: 'paid',
              type: 'bank-card',
              paidAt: new Date().toISOString()
            }));
            createParams.append('apiKey', apiKey);
            createParams.append('site', site);

            await axios.post(`${apiUrl}/api/v5/orders/payments/create`, createParams);
          }

        } catch (crmError) {
          console.error('RetailCRM Error:', crmError.response?.data || crmError.message);
        }
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send('Error');
  }
}