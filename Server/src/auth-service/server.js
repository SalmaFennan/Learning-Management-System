import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';
import app from './src/app.js';
import connectDB from './src/config/dbConnection.js';
import { initializeRedis } from './src/utils/cache.js';

console.log('Starting server.js'); // Debug log

const configureServices = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  return { razorpay };
};

const startServer = async () => {
  const PORT = process.env.PORT || 5001;
  try {
    await connectDB();
    const { razorpay } = configureServices();
    app.locals.razorpay = razorpay;

    if (process.env.USE_REDIS === 'true') {
      await initializeRedis();
    }

    const server = app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  } catch (err) {
    console.error('Failed to start service:', err);
    process.exit(1);
  }
};

startServer();