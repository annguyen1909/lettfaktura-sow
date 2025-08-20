const products = [
  { id: 1, articleNo: 'ART001', product: 'Widget A', price: 15.00 },
  { id: 2, articleNo: 'ART002', product: 'Widget B', price: 30.00 },
  { id: 3, articleNo: 'ART003', product: 'Widget C', price: 8.00 }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ success: true, products });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
