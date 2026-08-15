import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ➕ ADD THIS IMPORT
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import ApiError from './utils/ApiError';
import { redis } from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // ➕ ADD THIS LINE (Must be placed before your routes)
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Eventful API is running!');
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  if (redis) {
    console.log('✅ Redis ready');
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

startServer();