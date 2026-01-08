import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import storeRoutes from './routes/store.routes.js';
import userRoutes from './routes/user.routes.js';
import ratingsRoutes from './routes/ratings.routes.js';

dotenv.config();

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const corsOptions = {
  origin: allowedOrigins.length > 0
    ? allowedOrigins
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://store-rating-five.vercel.app',
      ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ratings', ratingsRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
