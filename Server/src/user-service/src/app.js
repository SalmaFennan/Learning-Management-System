import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import userRoutes from './routes/users.js';
import errorMiddleware from './middlewares/error.middleware.js'; // Assuming you have this

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Routes
app.use('/api/users', userRoutes);

// Global error handler
app.use(errorMiddleware);

export default app;