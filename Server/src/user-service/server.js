import app from './src/app.js';
import { connectDB } from './src/config/dbConnection.js';

const PORT = process.env.PORT || 5003;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`User Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });