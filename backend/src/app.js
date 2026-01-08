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

// Ensure env vars are loaded even if server imported this before calling dotenv.config()
dotenv.config();

const app = express();

// Security & utils
app.use(helmet());
// Allow explicit origins via CORS_ORIGIN (comma-separated). Fallback to permissive in dev.
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
      ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Basic rate limit to protect auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ratings', ratingsRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

// Error handler
// Keep simple, don't leak internals
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
