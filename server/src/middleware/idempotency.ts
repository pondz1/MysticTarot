import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

type CacheEntry = {
  status: 'pending' | 'done';
  createdAt: number;
  /** JSON body for completed non-stream (or completed stream replay) */
  body?: unknown;
  statusCode?: number;
};

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const store = new Map<string, CacheEntry>();

function prune(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.createdAt > TTL_MS) store.delete(key);
  }
}

function cacheKey(req: AuthRequest, rawKey: string): string {
  const userPart = req.user?.userId || req.ip || 'anon';
  return `${userPart}::${rawKey}`;
}

/**
 * Optional idempotency for POST /api/ai/completion via header:
 *   X-Idempotency-Key: <client-generated-id>
 *
 * - Same key while in-flight → 409
 * - Same key after success → replay cached JSON (stream requests become JSON replay)
 */
export function aiIdempotencyMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.method !== 'POST') {
    next();
    return;
  }

  const raw =
    (typeof req.headers['x-idempotency-key'] === 'string' && req.headers['x-idempotency-key'].trim()) ||
    '';
  if (!raw || raw.length > 128) {
    next();
    return;
  }

  prune();
  const key = cacheKey(req, raw);
  const existing = store.get(key);

  if (existing?.status === 'pending') {
    res.status(409).json({
      success: false,
      error: 'คำขอนี้กำลังประมวลผลอยู่ กรุณารอสักครู่',
      code: 'IDEMPOTENCY_IN_FLIGHT',
    });
    return;
  }

  if (existing?.status === 'done' && existing.body !== undefined) {
    res.status(existing.statusCode || 200).json(existing.body);
    return;
  }

  store.set(key, { status: 'pending', createdAt: Date.now() });

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    // Only cache successful completions
    if (res.statusCode >= 200 && res.statusCode < 300) {
      store.set(key, {
        status: 'done',
        createdAt: Date.now(),
        body,
        statusCode: res.statusCode,
      });
    } else {
      store.delete(key);
    }
    return originalJson(body);
  }) as typeof res.json;

  // If client disconnects mid-stream before json(), clear pending so they can retry
  req.on('close', () => {
    const cur = store.get(key);
    if (cur?.status === 'pending') {
      store.delete(key);
    }
  });

  next();
}

/** Test helper */
export function _clearIdempotencyStoreForTests(): void {
  store.clear();
}
