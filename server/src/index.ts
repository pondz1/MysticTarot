import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { aiRouter } from './routes/ai.js';
import { readingsRouter } from './routes/readings.js';
import { userRouter } from './routes/user.js';
import { authRouter } from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin static requests)
      if (!origin) return callback(null, true);
      if (!allowedOrigins || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

// Reduced body limit (100kb)
app.use(express.json({ limit: '100kb' }));

// Global authentication middleware to parse JWT tokens on incoming requests
app.use(authMiddleware);

// Rate limiter for AI routes to prevent API abuse
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP/client to 30 completion requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'ขออภัย คุณใช้งาน AI ครบโควต้าชั่วคราวแล้ว กรุณาลองใหม่อีกครั้งใน 15 นาที' },
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRateLimiter, aiRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/user', userRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'mystic-verse-backend',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred on the server'
    : err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
});

// Serve compiled static frontend assets from 'public' directory
const publicDir = path.resolve(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  // SPA fallback for non-API routes
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🔮 MysticVerse Backend server running on http://localhost:${PORT}`);
});

