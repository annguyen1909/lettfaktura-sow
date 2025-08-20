import sequelize from '../config/database.js';
import Product from './Product.js';

// Initialize all models
const models = {
  Product
};

export { sequelize, Product };
export default models;
