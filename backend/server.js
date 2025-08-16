import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { sequelize, Product } from './models/index.js';
import productRoutes from './routes/products.js';

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
  }
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
});

// Register API routes
await fastify.register(productRoutes, { prefix: '/api' });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    await sequelize.authenticate();
    return { status: 'OK', database: 'Connected', timestamp: new Date().toISOString() };
  } catch (error) {
    reply.status(500).send({ status: 'Error', database: 'Disconnected', error: error.message });
  }
});

// Database initialization and seeding
async function initializeDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync the database (create tables)
    await sequelize.sync({ force: false });
    console.log('Database tables have been created successfully.');

    // Check if we need to seed the database
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding database with initial data...');
      await seedDatabase();
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Seed database with initial data
async function seedDatabase() {
  const seedData = [
    { articleNo: '1234567890', product: 'This is a test product with fifty characters this!', price: 1500800, inStock: 1500800, unit: 'kilometers/hour' },
    { articleNo: '1234567890', product: 'This is a test product with fifty characters this!', price: 1500800, inStock: 1500800, unit: 'kilometers/hour' },
    { articleNo: '1234567892', product: 'Sony DSLR 12345', price: 15000, inStock: 15000, unit: 'pieces' },
    { articleNo: '1234567893', product: 'Random product', price: 1234, inStock: 1234, unit: 'items' },
    { articleNo: '1234567894', product: 'Professional Camera Lens 85mm f/1.4', price: 2500, inStock: 50, unit: 'pieces' },
    { articleNo: '1234567895', product: 'Wireless Bluetooth Headphones', price: 299, inStock: 200, unit: 'pieces' },
    { articleNo: '1234567896', product: 'Gaming Mechanical Keyboard RGB', price: 189, inStock: 75, unit: 'pieces' },
    { articleNo: '1234567897', product: 'Smartphone 128GB Storage Black', price: 899, inStock: 150, unit: 'pieces' },
    { articleNo: '1234567898', product: 'Laptop 15.6 inch i7 16GB RAM 512GB SSD', price: 1299, inStock: 25, unit: 'pieces' },
    { articleNo: '1234567899', product: 'Wireless Mouse Ergonomic Design', price: 45, inStock: 300, unit: 'pieces' },
    { articleNo: '1234567900', product: 'External Hard Drive 2TB USB 3.0', price: 125, inStock: 100, unit: 'pieces' },
    { articleNo: '1234567901', product: 'Monitor 27 inch 4K Ultra HD', price: 599, inStock: 40, unit: 'pieces' },
    { articleNo: '1234567902', product: 'Graphics Card RTX 4080 16GB', price: 1199, inStock: 15, unit: 'pieces' },
    { articleNo: '1234567903', product: 'Desk Chair Ergonomic Office', price: 399, inStock: 80, unit: 'pieces' },
    { articleNo: '1234567904', product: 'Standing Desk Adjustable Height', price: 699, inStock: 35, unit: 'pieces' },
    { articleNo: '1234567905', product: 'Webcam 1080p HD Auto Focus', price: 89, inStock: 120, unit: 'pieces' },
    { articleNo: '1234567906', product: 'USB Hub 7 Port with Power Adapter', price: 35, inStock: 250, unit: 'pieces' },
    { articleNo: '1234567907', product: 'Tablet 10.1 inch Android 64GB', price: 329, inStock: 60, unit: 'pieces' },
    { articleNo: '1234567908', product: 'Smartwatch Fitness Tracker GPS', price: 249, inStock: 90, unit: 'pieces' },
    { articleNo: '1234567909', product: 'Wireless Charger 15W Fast Charging', price: 39, inStock: 180, unit: 'pieces' },
    { articleNo: '1234567910', product: 'Power Bank 20000mAh USB-C PD', price: 55, inStock: 140, unit: 'pieces' },
    { articleNo: '1234567911', product: 'Bluetooth Speaker Waterproof', price: 79, inStock: 110, unit: 'pieces' }
  ];

  try {
    await Product.bulkCreate(seedData);
    console.log('Database seeded successfully with', seedData.length, 'products.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Start the server
const start = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the server
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Health check: http://${host}:${port}/health`);
    console.log(`API endpoints: http://${host}:${port}/api/products`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  await sequelize.close();
  process.exit(0);
});

start();
