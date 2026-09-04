/**
 * DevilCart - Full-Stack Express Server Entry Point (Cloud & Production Ready)
 * Serves REST APIs and statically hosts the frontend application.
 * Supports cloud hosting (Render, Railway, Heroku) with 0.0.0.0 binding and dynamic CORS.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

// Global Unhandled Error Prevention
process.on('uncaughtException', (err) => {
  console.error('⚠ Uncaught Exception caught gracefully:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠ Unhandled Rejection caught gracefully:', reason);
});

// Configure CORS for production (Vercel) & local development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://your-vercel-domain.vercel.app',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000',
  'http://localhost:8080'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server) or same-origin
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or matches FRONTEND_URL pattern
    if (
      process.env.FRONTEND_URL === '*' ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.some(allowed => origin.startsWith(allowed)) ||
      origin.includes('vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Default permissive in development/fallback
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] \x1b[35m${req.method}\x1b[0m ${req.url}`);
  next();
});

// Serve Static Frontend Files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Member Authentication / Profile Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }
    // Demo Member session generator
    const memberName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Occult Member';
    res.json({
      success: true,
      message: 'Welcome to DevilCart Coven',
      user: {
        id: Math.floor(100 + Math.random() * 900),
        name: memberName.charAt(0).toUpperCase() + memberName.slice(1),
        email: email.trim(),
        role: email.includes('admin') ? 'Archdemon Admin' : 'Vault Member',
        token: 'dcart_' + Math.random().toString(36).substring(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
});

// Admin Statistics Overview
app.get('/api/admin/stats', async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products');
    const orders = await db.query('SELECT * FROM orders');
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        databaseStatus: db.getIsConnected() ? `MySQL (${process.env.DB_NAME || 'ecommerce_db'})` : 'Offline / Memory Fallback'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats' });
  }
});

// Healthcheck Route (Production & Monitoring ready)
app.get('/api/health', (req, res) => {
  const isDbConnected = db.getIsConnected();
  const dbName = process.env.DB_NAME || 'ecommerce_db';
  res.json({
    status: 'online',
    brand: 'DevilCart',
    tagline: 'Shop Beyond the Ordinary.',
    port: PORT,
    database: isDbConnected ? `MySQL (${dbName})` : 'Offline / Memory Fallback',
    databaseStatus: isDbConnected ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Fallback for HTML5 Multi-Page Navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found in DevilCart Vault' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal DevilCart Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server with Graceful Port Conflict Handling and 0.0.0.0 Host Binding
async function startServer(portToTry) {
  console.log('----------------------------------------------------');
  console.log('   🔥 DEVILCART - SHOP BEYOND THE ORDINARY 🔥   ');
  console.log('----------------------------------------------------');

  // Attempt database connection test and safe auto-initialization
  const isConnected = await db.testConnection();
  if (isConnected) {
    try {
      await db.initDatabase();
    } catch (initErr) {
      console.warn(`[Auto-Init Info] ${initErr.message}`);
    }
  }

  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\x1b[33m⚠ Port ${portToTry} is already in use by another process.\x1b[0m`);
      const nextPort = portToTry + 1;
      console.log(`\x1b[36m⚡ Attempting fallback to port ${nextPort}...\x1b[0m`);
      startServer(nextPort);
    } else {
      console.error('Fatal server socket error:', err);
    }
  });

  server.listen(portToTry, HOST, () => {
    console.log(`\x1b[32m✔ DevilCart Server is running on ${HOST}:${portToTry}\x1b[0m`);
    console.log(`\x1b[36m✔ Local access: http://localhost:${portToTry}\x1b[0m`);
    console.log(`\x1b[35m✔ Health check: http://localhost:${portToTry}/api/health\x1b[0m`);
    console.log(`\x1b[35m✔ API Endpoints: http://localhost:${portToTry}/api/products\x1b[0m`);
    console.log('----------------------------------------------------');
  });
}

startServer(PORT);
