// src/config/dbConnection.js
import mongoose from 'mongoose';
import AppError from '../utils/error.util.js';

// Optimized MongoDB configuration
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // Disable buffering
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production'); // Indexing in dev only

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      maxPoolSize: 10, // Max number of connections
      socketTimeoutMS: 45000, // Auto-close inactive connections
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Event handlers
    conn.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    conn.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      connectDB(); // Attempt reconnection
    });

    return conn;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw new AppError('Database connection failed', 503);
  }
};

export default connectDB;