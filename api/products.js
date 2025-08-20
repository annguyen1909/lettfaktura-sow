// Mock data for testing - will replace with real database later
const mockProducts = [
  {
    id: 1,
    articleNo: 'ART001',
    product: 'Widget A',
    inPrice: 10.00,
    price: 15.00,
    unit: 'pcs',
    inStock: 100,
    description: 'High quality widget'
  },
  {
    id: 2,
    articleNo: 'ART002',
    product: 'Widget B',
    inPrice: 20.00,
    price: 30.00,
    unit: 'pcs',
    inStock: 50,
    description: 'Premium widget'
  },
  {
    id: 3,
    articleNo: 'ART003',
    product: 'Widget C',
    inPrice: 5.00,
    price: 8.00,
    unit: 'pcs',
    inStock: 200,
    description: 'Basic widget'
  }
];

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Handle GET requests
      res.status(200).json({
        success: true,
        products: mockProducts,
        pagination: {
          total: mockProducts.length,
          page: 1,
          limit: 50,
          pages: 1
        }
      });
    } else if (req.method === 'POST') {
      // Handle POST requests
      const newProduct = {
        id: mockProducts.length + 1,
        ...req.body
      };
      mockProducts.push(newProduct);
      res.status(201).json({
        success: true,
        product: newProduct
      });
    } else if (req.method === 'PUT') {
      // Handle PUT requests (update)
      const id = parseInt(req.url.split('/').pop());
      const productIndex = mockProducts.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }
      
      mockProducts[productIndex] = { ...mockProducts[productIndex], ...req.body };
      res.status(200).json({
        success: true,
        product: mockProducts[productIndex]
      });
    } else {
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
