import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { aiRouter } from './routes/ai.js';
import { readingsRouter } from './routes/readings.js';
import { userRouter } from './routes/user.js';
import { paymentsRouter, omiseWebhookHandler } from './routes/payments.js';
import { authRouter } from './routes/auth.js';
import { authMiddleware, type AuthRequest } from './middleware/auth.js';
import { aiIdempotencyMiddleware } from './middleware/idempotency.js';
import { creditsDb } from './db.js';

/**
 * Build Express app (no listen). Used by index.ts and integration tests.
 */
export function createApp() {
  // Heal legacy negative credit balances once per process
  try {
    const fixed = creditsDb.clampAllNegativeCredits();
    if (fixed > 0) {
      console.log(`[Credits] Clamped ${fixed} negative balance row(s) to 0`);
    }
  } catch (e) {
    console.warn('[Credits] Failed to clamp negative balances:', e);
  }

  const app = express();

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : null;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          !allowedOrigins ||
          allowedOrigins.includes(origin) ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
    })
  );

  // Capture raw body for Omise webhook HMAC verification (needs exact bytes)
  app.use(
    express.json({
      limit: '100kb',
      verify: (req, _res, buf) => {
        const url = req.url || '';
        if (url.startsWith('/api/webhooks/omise')) {
          (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
        }
      },
    })
  );
  // Omise webhooks: no JWT — verify Omise-Signature when OMISE_WEBHOOK_SECRET is set
  app.post('/api/webhooks/omise', omiseWebhookHandler);
  app.use(authMiddleware);

  const rateLimitKey = (req: Request) => {
    const authReq = req as AuthRequest;
    if (authReq.user?.userId) return `user:${authReq.user.userId}`;
    return `ip:${ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown')}`;
  };

  // Rate limit AI by authenticated user when possible, else IP
  const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimitKey,
    message: {
      success: false,
      error: 'ขออภัย คุณใช้งาน AI ครบโควต้าชั่วคราวแล้ว กรุณาลองใหม่อีกครั้งใน 15 นาที',
      code: 'RATE_LIMITED',
    },
  });

  // Rate limit credit mutations (claim / promo / simulate / refill) to slow farming
  const creditMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimitKey,
    message: {
      success: false,
      error: 'คำขอเติมเครดิตบ่อยเกินไป กรุณาลองใหม่ในอีกสักครู่',
      code: 'RATE_LIMITED',
    },
  });

  // Stricter limiter for promo + daily claim (identity-farming vectors)
  const creditBonusLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimitKey,
    message: {
      success: false,
      error: 'ใช้สิทธิ์โบนัส/โค้ดบ่อยเกินไป กรุณาลองใหม่ภายหลัง',
      code: 'RATE_LIMITED',
    },
  });

  app.use('/api/auth', authRouter);
  app.use('/api/ai', aiRateLimiter, aiIdempotencyMiddleware, aiRouter);
  app.use('/api/readings', readingsRouter);

  // Apply mutation limiters before user router handlers
  app.use('/api/user/claim-daily', creditBonusLimiter);
  app.use('/api/user/redeem-code', creditBonusLimiter);
  app.use('/api/user/topup-simulate', creditMutationLimiter);
  app.use('/api/user/topup/create', creditMutationLimiter);
  app.use('/api/user/refill', creditMutationLimiter);
  app.use('/api/user/reset-credits', creditMutationLimiter);
  app.use('/api/user', paymentsRouter);
  app.use('/api/user', userRouter);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'mystic-verse-backend',
      timestamp: new Date().toISOString(),
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    const status = err.status || err.statusCode || 500;
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred on the server'
        : err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

  const publicDir = path.resolve(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    // Serve static files with proper caching headers
    app.use(
      express.static(publicDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            // Never cache index.html so browsers always fetch updated JS chunk URLs
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.includes('/assets/')) {
            // Cache immutable hashed assets for 1 year
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) return next();

      // Return 404 for missing static assets instead of falling back to index.html
      const isAssetRequest =
        req.path.startsWith('/assets/') ||
        /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json)$/i.test(req.path);

      if (isAssetRequest) {
        res.status(404).type('text/plain').send('Asset not found');
        return;
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  return app;
}
