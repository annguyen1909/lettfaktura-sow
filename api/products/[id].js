// Individual product endpoint for editing - /api/products/[id].js
import pkg from 'pg';
const { Client } = pkg;

async function connectToDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  await client.connect();
  return client;
}

async function getProductById(client, id) {
  const query = 'SELECT * FROM products WHERE id = $1';
  const result = await client.query(query, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  
  // Convert snake_case to camelCase for frontend compatibility
  return {
    id: row.id,
    articleNo: row.article_no,
    product: row.product,
    inPrice: parseFloat(row.in_price || 0),
    price: parseFloat(row.price || 0),
    unit: row.unit,
    inStock: parseInt(row.in_stock || 0),
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function updateProduct(client, id, updateData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Map camelCase to snake_case for database columns
  const fieldMapping = {
    articleNo: 'article_no',
    product: 'product',
    inPrice: 'in_price',
    price: 'price',
    unit: 'unit',
    inStock: 'in_stock',
    description: 'description'
  };

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && fieldMapping[key]) {
      fields.push(`${fieldMapping[key]} = $${paramCount}`);
      values.push(updateData[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE products 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  values.push(id);
  const result = await client.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  const row = result.rows[0];
  
  // Convert snake_case to camelCase for frontend compatibility
  return {
    id: row.id,
    articleNo: row.article_no,
    product: row.product,
    inPrice: parseFloat(row.in_price || 0),
    price: parseFloat(row.price || 0),
    unit: row.unit,
    inStock: parseInt(row.in_stock || 0),
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: 'Database not configured',
      message: 'DATABASE_URL environment variable is missing'
    });
  }

  // Extract ID from query parameters
  const { id } = req.query;
  const productId = parseInt(id);

  if (!productId || isNaN(productId)) {
    return res.status(400).json({
      error: 'Invalid product ID'
    });
  }

  let client = null;

  try {
    client = await connectToDatabase();

    if (req.method === 'GET') {
      const product = await getProductById(client, productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(200).json({ product });

    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      const updatedProduct = await updateProduct(client, productId, req.body);
      res.status(200).json({ product: updatedProduct });

    } else if (req.method === 'DELETE') {
      const result = await client.query('DELETE FROM products WHERE id = $1', [productId]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(204).end();

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error('Error closing database connection:', e);
      }
    }
  }
}