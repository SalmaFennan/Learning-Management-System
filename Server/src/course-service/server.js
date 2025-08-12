import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/dbConnection.js';
import cloudinary from 'cloudinary';
import { initializeRedis } from './utils/cache.js';

const PORT = process.env.PORT || 5002;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.USE_REDIS === 'true') {
      await initializeRedis();
    }
    app.listen(PORT, () => {
      console.log(`Course Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();