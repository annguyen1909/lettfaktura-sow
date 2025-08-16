import sequelize from '../config/database.js';
import Product from './Product.js';

// Initialize all models
const models = {
  Product
};

// Define associations here if needed
// Example: Product.hasMany(Category);

export { sequelize, Product };
export default models;
