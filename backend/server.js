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

    // Sync the database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('Database tables have been synchronized successfully.');

    // Note: Not seeding database - using existing Supabase data

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
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
