# Lettfaktura SOW - Pricelist Management App

A mini full-stack application built as part of a Statement of Work (SOW) assignment. This app provides a responsive pricelist interface with real-time editing capabilities.

## 🛠️ Technology Stack

### Frontend
- **Vite.js** - Modern build tool and development server
- **Vanilla JavaScript** - Pure JavaScript without frameworks
- **Vanilla CSS** - Custom responsive styling
- **HTML5** - Semantic markup

### Backend
- **Fastify** - Fast and efficient web framework for Node.js
- **Sequelize ORM** - Object-relational mapping for database operations
- **Node.js** - JavaScript runtime environment

### Database
- **PostgreSQL** (via Supabase) - Cloud-hosted relational database
- **Supabase** - Backend-as-a-Service platform

## 📁 Project Structure

```
lettfaktura-sow/
├── README.md                 # This documentation file
├── package.json             # Frontend dependencies and scripts
├── index.html              # Main HTML entry point
├── vite.config.js          # Vite configuration
│
├── src/                    # Frontend source code
│   ├── main.js            # Main application logic
│   ├── style.css          # Global styles and responsive design
│   └── api.js             # API communication layer
│
├── backend/               # Backend server code
│   ├── package.json      # Backend dependencies
│   ├── server.js         # Main server file (Fastify app)
│   ├── .env              # Environment variables (DATABASE_URL, etc.)
│   │
│   ├── config/           # Configuration files
│   │   └── database.js   # Database connection setup
│   │
│   ├── models/           # Database models
│   │   ├── index.js      # Model exports
│   │   └── Product.js    # Product model definition
│   │
│   └── routes/           # API routes
│       └── products.js   # Product CRUD operations
│
└── public/               # Static assets (if any)
```

## 🎯 Features

### Frontend Features
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Editing** - Click any field to edit inline
- **Auto-save** - Changes save automatically without refresh
- **Search Functionality** - Filter products by any field
- **Loading States** - User feedback during API calls
- **Error Handling** - Graceful error messages

### Backend Features
- **RESTful API** - Standard HTTP methods for CRUD operations
- **CORS Support** - Cross-origin requests enabled
- **Database ORM** - Sequelize for type-safe database operations
- **Environment Configuration** - Flexible database connections
- **Error Handling** - Comprehensive error responses

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lettfaktura-sow
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**
   Create `.env` file in the `backend/` directory:
   ```env
   # Database Configuration
   USE_SQLITE=false
   DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-REGION.pooler.supabase.com:6543/postgres
   DB_HOST=aws-REGION.pooler.supabase.com
   DB_PORT=6543
   DB_NAME=postgres
   DB_USER=postgres.PROJECT_REF
   DB_PASSWORD=YOUR_PASSWORD

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   node server.js
   ```
   Server runs on: http://localhost:3001

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

## 📡 API Endpoints

### Products API
- `GET /api/products` - Fetch all products
- `GET /api/products/:id` - Fetch single product
- `PUT /api/products/:id` - Update product
- `POST /api/products` - Create new product
- `DELETE /api/products/:id` - Delete product

### Health Check
- `GET /health` - Server health status

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  articleNo VARCHAR(255) NOT NULL,
  product TEXT NOT NULL,
  price INTEGER NOT NULL,
  inStock INTEGER NOT NULL,
  unit VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI Components

### Main Components
- **Product Table** (`src/main.js`) - Main data grid with inline editing
- **Search Bar** (`src/main.js`) - Real-time product filtering
- **API Layer** (`src/api.js`) - Centralized API communication

### Styling
- **Responsive Grid** - CSS Grid for table layout
- **Mobile-first Design** - Optimized for all screen sizes
- **Custom CSS Variables** - Consistent color scheme
- **Hover Effects** - Interactive feedback

## 🔧 Configuration Files

### Frontend Configuration
- **vite.config.js** - Vite build tool configuration
- **package.json** - Dependencies and scripts

### Backend Configuration
- **.env** - Environment variables (database, server settings)
- **config/database.js** - Sequelize database connection
- **package.json** - Backend dependencies and scripts

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Complete PostgreSQL connection string | `postgresql://...` |
| `DB_HOST` | Database hostname | `aws-1-ap-southeast-1.pooler.supabase.com` |
| `DB_PORT` | Database port | `6543` (Transaction Pooler) |
| `DB_USER` | Database username | `postgres.PROJECT_REF` |
| `DB_PASSWORD` | Database password | `your_password` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 📝 Development Notes

### Key Design Decisions
1. **Vite.js over Create React App** - Faster development experience
2. **Vanilla JavaScript over Framework** - Lightweight and educational
3. **Fastify over Express** - Better performance and TypeScript support
4. **Supabase over Local DB** - Cloud hosting and real-time capabilities
5. **Transaction Pooler** - Better connection management for concurrent requests

### File Organization
- Frontend code in `/src` for clear separation
- Backend follows MVC pattern with models, routes, and config
- Environment variables kept secure in `.env` file
- Responsive CSS using modern grid and flexbox

## 🔍 Troubleshooting

### Common Issues
1. **Port already in use** - Kill existing processes: `pkill -f "node server.js"`
2. **Database connection errors** - Check Supabase credentials and network
3. **CORS errors** - Verify `FRONTEND_URL` in backend `.env`
4. **Module not found** - Ensure you're in correct directory when running commands

### Database Connection
- Use Transaction Pooler (port 6543) for better performance
- URL-encode special characters in passwords (@ becomes %40)
- Check Supabase project status if connection fails

## 📄 License

This project is created for educational purposes as part of a Statement of Work assignment.

---

**Built with ❤️ using modern web technologies**
