import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

export type IdempotentCompletionBody = {
  success?: boolean;
  result?: string;
  remainingCredits?: number;
  creditsDeducted?: number;
  truncated?: boolean;
  finishReason?: string;
  cached?: boolean;
  [key: string]: unknown;
};

type CacheEntry = {
  status: 'pending' | 'done';
  createdAt: number;
  body?: IdempotentCompletionBody;
  statusCode?: number;
};

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const store = new Map<string, CacheEntry>();

// Stash resolved cache key on the request for route handlers
export type IdempotentRequest = AuthRequest & { idempotencyCacheKey?: string };

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

function writeSseReplay(res: Response, body: IdempotentCompletionBody): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (body.result) {
    res.write(`data: ${JSON.stringify({ content: body.result })}\n\n`);
  }
  res.write(
    `data: ${JSON.stringify({
      remainingCredits: body.remainingCredits,
      creditsDeducted: body.creditsDeducted ?? 0,
      truncated: body.truncated,
      finishReason: body.finishReason,
      cached: true,
    })}\n\n`
  );
  res.write('data: [DONE]\n\n');
  res.end();
}

/**
 * Optional idempotency for POST /api/ai/completion via header:
 *   X-Idempotency-Key: <client-generated-id>
 *
 * - Same key while in-flight → 409
 * - Same key after success → replay (JSON or SSE matching stream flag)
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
  (req as IdempotentRequest).idempotencyCacheKey = key;
  const existing = store.get(key);

  if (existing?.status === 'pending') {
    res.status(409).json({
      success: false,
      error: 'คำขอนี้กำลังประมวลผลอยู่ กรุณาลองใหม่อีกครั้งในสักครู่',
      code: 'IDEMPOTENCY_IN_FLIGHT',
    });
    return;
  }

  if (existing?.status === 'done' && existing.body) {
    const wantsStream = Boolean(req.body?.stream);
    const replayBody = { ...existing.body, cached: true };
    if (wantsStream) {
      writeSseReplay(res, replayBody);
      return;
    }
    res.status(existing.statusCode || 200).json(replayBody);
    return;
  }

  store.set(key, { status: 'pending', createdAt: Date.now() });

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode >= 200 && res.statusCode < 300 && body && typeof body === 'object') {
      const b = body as IdempotentCompletionBody;
      // Normalize to include result for stream replay compatibility
      store.set(key, {
        status: 'done',
        createdAt: Date.now(),
        body: {
          success: true,
          result: b.result,
          remainingCredits: b.remainingCredits,
          creditsDeducted: b.creditsDeducted,
          truncated: b.truncated,
          finishReason: b.finishReason,
          ...b,
        },
        statusCode: res.statusCode,
      });
    } else {
      store.delete(key);
    }
    return originalJson(body);
  }) as typeof res.json;

  // Client disconnect mid-flight → allow retry (do not keep pending forever)
  req.on('close', () => {
    const cur = store.get(key);
    if (cur?.status === 'pending') {
      store.delete(key);
    }
  });

  next();
}

/** Mark stream completion as cacheable (call after fullText is ready). */
export function completeIdempotency(
  req: AuthRequest,
  body: IdempotentCompletionBody
): void {
  const key = (req as IdempotentRequest).idempotencyCacheKey;
  if (!key) return;
  store.set(key, {
    status: 'done',
    createdAt: Date.now(),
    body: { success: true, ...body },
    statusCode: 200,
  });
}

/** Drop pending key on hard failure after middleware accepted the request. */
export function failIdempotency(req: AuthRequest): void {
  const key = (req as IdempotentRequest).idempotencyCacheKey;
  if (!key) return;
  const cur = store.get(key);
  if (cur?.status === 'pending') store.delete(key);
}

/** Test helper */
export function _clearIdempotencyStoreForTests(): void {
  store.clear();
}
