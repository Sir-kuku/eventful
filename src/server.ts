import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import paymentRoutes from './routes/payment.routes';
import qrRoutes from './routes/qr.routes';
import analyticsRoutes from './routes/analytics.routes';
import reminderRoutes from './routes/reminder.routes';
import './cron';
import ApiError from './utils/ApiError';
import { redis } from './config/redis';
import { authLimiter, paymentLimiter, generalLimiter } from './middleware/rateLimit.middleware';
import { cacheMiddleware } from './middleware/cache.middleware';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(generalLimiter);

app.get('/', (req, res) => {
  res.send('Eventful API is running!');
});

app.use('/api/v1/auth', authLimiter, authRoutes);

// Apply cache middleware separately: list (5 min), single (10 min)
app.use('/api/v1/events', cacheMiddleware(300), eventRoutes); // 5 minutes for list
app.use('/api/v1/events/:id', cacheMiddleware(600), eventRoutes); // 10 minutes for single

app.use('/api/v1/payments', paymentLimiter, paymentRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reminders', reminderRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const startServer = async () => {
  await connectDB();
  if (redis) {
    console.log('? Redis ready');
  }
  app.listen(PORT, () => {
    console.log(`?? Server listening on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}
