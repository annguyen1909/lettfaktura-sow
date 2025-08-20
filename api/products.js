// Import your existing backend logic
import { Sequelize, DataTypes, Op } from 'sequelize';

// Use the same database configuration as your backend
const sequelize = new Sequelize(
  process.env.DATABASE_URL || {
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres', 
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false
  }
);

// Use the same Product model as your backend
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  articleNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'pcs'
  },
  inStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

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

  try {
    // Ensure database connection
    await sequelize.authenticate();

    if (req.method === 'GET') {
      // Use the same logic as your backend
      const { articleNo, product, page = 1, limit = 50 } = req.query;
      
      const whereClause = {};
      
      if (articleNo) {
        whereClause.articleNo = {
          [Op.iLike]: `%${articleNo}%`
        };
      }
      
      if (product) {
        whereClause.product = {
          [Op.iLike]: `%${product}%`
        };
      }
      
      const offset = (page - 1) * limit;
      
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
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });

    } else if (req.method === 'POST') {
      // Create new product using same logic
      const { articleNo, product, price, inStock, unit, inPrice, description } = req.body;
      
      if (!articleNo || !product) {
        return res.status(400).json({ error: 'Article number and product name are required' });
      }
      
      const newProduct = await Product.create({
        articleNo,
        product,
        price: price || 0,
        inStock: inStock || 0,
        unit: unit || 'pcs',
        inPrice: inPrice || 0,
        description: description || null
      });
      
      res.status(201).json({ product: newProduct });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
