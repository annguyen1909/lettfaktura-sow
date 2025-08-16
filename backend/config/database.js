import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
let sequelize;

if (process.env.USE_SQLITE === 'true') {
  // Use SQLite for development/testing
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'development.db'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });
} else {
  // Use PostgreSQL for production
  sequelize = new Sequelize(
    process.env.DATABASE_URL || {
      database: process.env.DB_NAME || 'lettfaktura',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
  );
}

export default sequelize;
