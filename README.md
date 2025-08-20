# Lettfaktura SOW - Pricelist Management System

A modern, responsive full-stack web application for managing product pricelists, built as part of a Statement of Work (SOW) assignment.

## 🚀 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Data Table**: Real-time editing with inline fields and auto-save functionality
- **Smart Row Focus**: Visual indicators with arrows that adapt to different screen sizes
- **Modern UI/UX**: Clean interface with FontAwesome icons and smooth animations
- **Mobile-First Approach**: Progressive column hiding based on screen size for optimal mobile experience
- **Real-time Updates**: Instant data synchronization with the backend database

## 🛠️ Technology Stack

### Frontend
- **Framework**: Vanilla JavaScript (ES6+) with Vite build tool
- **JavaScript Version**: ES2022 (ECMAScript 2022)
- **Build Tool**: Vite v7.1.2
- **CSS**: Pure CSS3 with CSS Variables and Flexbox/Grid
- **Icons**: FontAwesome 6.4.0 (CDN)
- **Module System**: ES Modules

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Fastify v5.5.0 (High-performance web framework)
- **Database ORM**: Sequelize v6.37.7
- **Database**: PostgreSQL (via Supabase)
- **CORS**: @fastify/cors v10.1.0
- **Environment Variables**: dotenv v16.6.1

### Database
- **Provider**: Supabase (PostgreSQL)
- **Database Drivers**: 
  - pg v8.16.3 (PostgreSQL driver)
  - pg-hstore v2.3.4 (JSON support)
  - sqlite3 v5.1.7 (development fallback)

### Development Tools
- **Development Server**: Vite dev server with HMR (Hot Module Replacement)
- **Node.js Watch Mode**: --watch flag for backend auto-restart
- **Package Manager**: npm

### Deployment
- **Platform**: Vercel
- **Frontend**: Static build with Vite
- **Backend**: Serverless functions with @vercel/node
- **Database**: Supabase PostgreSQL (cloud-hosted)

## 📱 Responsive Breakpoints

- **Desktop (769px+)**: Full 7-column layout
- **Tablet (768px and below)**: Hides In Price and Description columns
- **Mobile Landscape (600px and below)**: Also hides Article No. and In Stock columns
- **Mobile Portrait (480px and below)**: Also hides Unit column, showing only essential data

## 🔧 Local Development

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables** in `backend/.env`
4. **Start backend**: `cd backend && npm run dev`
5. **Start frontend**: `npm run dev`


