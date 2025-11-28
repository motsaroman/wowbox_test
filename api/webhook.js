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
        console.log(`Payment success for CRM Order #${crmId}. Marking as paid...`);

        const updateParams = new URLSearchParams();
        
        // ОБНОВЛЯЕМ ТОЛЬКО СТАТУС ОПЛАТЫ
        updateParams.append('order', JSON.stringify({
          paymentStatus: 'paid'
        }));
        
        updateParams.append('apiKey', process.env.RETAILCRM_API_KEY);
        updateParams.append('site', 'wowbox-market');

        try {
          await axios.post(
            `${process.env.RETAILCRM_URL}/api/v5/orders/${crmId}/edit`,
            updateParams
          );
          console.log(`CRM Order #${crmId} payment status updated to "paid".`);
        } catch (crmError) {
          console.error('RetailCRM Update Error:', crmError.response?.data || crmError.message);
        }
      } else {
        console.warn('Missing crmId or CRM credentials');
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send('Error');
  }
}