// Direct PostgreSQL connection for Vercel serverless
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

async function getProducts(client, filters = {}) {
  let query = 'SELECT * FROM products';
  const params = [];
  const conditions = [];

  if (filters.articleNo) {
    conditions.push(`"articleNo" ILIKE $${params.length + 1}`);
    params.push(`%${filters.articleNo}%`);
  }

  if (filters.product) {
    conditions.push(`product ILIKE $${params.length + 1}`);
    params.push(`%${filters.product}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id ASC';

  if (filters.limit) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(parseInt(filters.limit));
  }

  if (filters.offset) {
    query += ` OFFSET $${params.length + 1}`;
    params.push(parseInt(filters.offset));
  }

  const result = await client.query(query, params);
  return result.rows;
}

async function createProduct(client, productData) {
  const query = `
    INSERT INTO products ("articleNo", product, "inPrice", price, unit, "inStock", description)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [
    productData.articleNo,
    productData.product,
    productData.inPrice || 0,
    productData.price || 0,
    productData.unit || 'pcs',
    productData.inStock || 0,
    productData.description || null
  ];

  const result = await client.query(query, values);
  return result.rows[0];
}

async function updateProduct(client, id, updateData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`"${key}" = $${paramCount}`);
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
  
  return result.rows[0];
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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

  let client = null;

  try {
    client = await connectToDatabase();

    if (req.method === 'GET') {
      const { articleNo, product, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;
      
      const products = await getProducts(client, { 
        articleNo, 
        product, 
        limit, 
        offset 
      });
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM products';
      const countParams = [];
      const countConditions = [];

      if (articleNo) {
        countConditions.push(`"articleNo" ILIKE $${countParams.length + 1}`);
        countParams.push(`%${articleNo}%`);
      }

      if (product) {
        countConditions.push(`product ILIKE $${countParams.length + 1}`);
        countParams.push(`%${product}%`);
      }

      if (countConditions.length > 0) {
        countQuery += ' WHERE ' + countConditions.join(' AND ');
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.status(200).json({
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });

    } else if (req.method === 'POST') {
      const { articleNo, product, price, inStock, unit, inPrice, description } = req.body;
      
      if (!articleNo || !product) {
        return res.status(400).json({ 
          error: 'Article number and product name are required' 
        });
      }
      
      const newProduct = await createProduct(client, {
        articleNo,
        product,
        price,
        inStock,
        unit,
        inPrice,
        description
      });
      
      res.status(201).json({ product: newProduct });

    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Extract ID from URL
      const urlParts = req.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 1]);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const updatedProduct = await updateProduct(client, id, req.body);
      res.status(200).json({ product: updatedProduct });

    } else if (req.method === 'DELETE') {
      // Extract ID from URL
      const urlParts = req.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 1]);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
      
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
