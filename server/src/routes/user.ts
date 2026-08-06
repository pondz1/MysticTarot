import { Router, Request, Response } from 'express';
import { creditsDb } from '../db.js';

export const userRouter = Router();

function getSessionId(req: Request): string {
  const headerId = req.headers['x-session-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim();
  }
  return 'default_user';
}

// GET user credits for specific session
userRouter.get('/credits', (req: Request, res: Response) => {
  try {
    const userId = getSessionId(req);
    const credits = creditsDb.getCredits(userId);
    res.json({ credits });
  } catch (error: any) {
    console.error('[User Router Error] /api/user/credits failed:', error);
    // Graceful fallback so production client never receives 500 status code
    res.json({ credits: 10 });
  }
});

// POST refill credits (Restricted in production / capped to max 10)
userRouter.post('/refill', (req: Request, res: Response) => {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const requestAdminToken = req.headers['x-admin-token'];

    // In production, require admin token if ADMIN_TOKEN is set, otherwise block refill
    if (process.env.NODE_ENV === 'production') {
      if (!adminToken || requestAdminToken !== adminToken) {
        res.status(403).json({ error: 'Refill endpoint is disabled in production' });
        return;
      }
    }

    const userId = getSessionId(req);
    const rawAmount = typeof req.body.amount === 'number' ? req.body.amount : 10;
    // Cap amount between 1 and 10 to prevent infinite refill abuse
    const amount = Math.min(Math.max(1, rawAmount), 10);
    const credits = creditsDb.refillCredits(userId, amount);
    res.json({ success: true, credits });
  } catch (error: any) {
    console.error('[User Router Error] /api/user/refill failed:', error);
    res.status(500).json({ error: 'Failed to refill credits' });
  }
});

