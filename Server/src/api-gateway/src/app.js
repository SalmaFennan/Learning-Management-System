import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { validateToken } from './middlewares/auth.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import coursesRoutes from './routes/courses.js';
import paymentsRoutes from './routes/payments.js';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/users', validateToken, usersRoutes);
app.use('/api/courses', validateToken, coursesRoutes);
app.use('/api/payments', validateToken, paymentsRoutes);

export default app;