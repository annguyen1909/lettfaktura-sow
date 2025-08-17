import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  articleNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'article_no'
  },
  product: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  inStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'in_stock'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pieces'
  },
  inPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'in_price'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Product;
