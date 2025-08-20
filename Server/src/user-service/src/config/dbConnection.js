// src/config/dbConnection.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};