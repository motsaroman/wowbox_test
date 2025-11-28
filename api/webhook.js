export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { event, object } = req.body;

    if (event === 'payment.succeeded') {
      const metadata = object.metadata;
      console.log(`Заказ оплачен. Phone: ${metadata.customerPhone}`);
    }
    res.status(200).send('OK');
  } else {
    res.status(405).end();
  }
}