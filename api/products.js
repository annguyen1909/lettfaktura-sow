import { sequelize, Product } from '../backend/models/index.js';
import { Op } from 'sequelize';

// Initialize database connection
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: false });
      dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await initializeDatabase();

    const { method, query, body } = req;
    const { limit = 50, offset = 0, search } = query;

    switch (method) {
      case 'GET':
        try {
          const whereClause = {};
          
          if (search) {
            whereClause[Op.or] = [
              { product: { [Op.iLike]: `%${search}%` } },
              { articleNo: { [Op.iLike]: `%${search}%` } }
            ];
          }

          const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'ASC']]
          });

          res.status(200).json({
            products: rows,
            pagination: {
              total: count,
              limit: parseInt(limit),
              offset: parseInt(offset),
              pages: Math.ceil(count / limit)
            }
          });
        } catch (error) {
          console.error('GET products error:', error);
          res.status(500).json({ error: 'Failed to fetch products' });
        }
        break;

      case 'POST':
        try {
          const product = await Product.create(body);
          res.status(201).json(product);
        } catch (error) {
          console.error('POST product error:', error);
          res.status(400).json({ error: 'Failed to create product' });
        }
        break;

      case 'PUT':
        try {
          const { id } = query;
          const [updatedRowsCount] = await Product.update(body, {
            where: { id },
            returning: true
          });
          
          if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
          }
          
          const updatedProduct = await Product.findByPk(id);
          res.status(200).json(updatedProduct);
        } catch (error) {
          console.error('PUT product error:', error);
          res.status(400).json({ error: 'Failed to update product' });
        }
        break;

      case 'DELETE':
        try {
          const { id } = query;
          const deletedRowsCount = await Product.destroy({
            where: { id }
          });
          
          if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
          }
          
          res.status(204).end();
        } catch (error) {
          console.error('DELETE product error:', error);
          res.status(400).json({ error: 'Failed to delete product' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
