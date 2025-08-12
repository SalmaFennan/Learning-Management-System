import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import AppError from './utils/error.util.js'; // Importe la classe AppError

const app = express();

// Middlewares  
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

/**
 * Health Check Endpoint for Kubernetes
 * @route GET /health
 * @description Returns service health status
 * @access Public
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Endpoint de test de connectivité à la base de données
app.get('/health/db', async (req, res) => {
  try {
    // Test de connexion MongoDB
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 1) {
      res.status(200).json({
        status: 'healthy',
        database: 'connected',
        service: 'auth-service'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy', 
        database: 'disconnected',
        service: 'auth-service'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      service: 'auth-service',
      error: error.message
    });
  }
});

export default app;
