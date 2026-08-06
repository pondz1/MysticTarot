import { Router, Response } from 'express';
import { creditsDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { CREDIT_RATES } from '../constants/creditRates.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const userRouter = Router();

function getSessionId(req: AuthRequest): string {
  if (req.user?.userId) {
    return req.user.userId;
  }
  const headerId = req.headers['x-session-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim();
  }
  return 'default_user';
}

// GET user credits for specific session
userRouter.get('/credits', (req: AuthRequest, res: Response) => {
  try {
    const userId = getSessionId(req);
    const credits = creditsDb.getCredits(userId);
    sendSuccess(res, { credits });
  } catch (error: any) {
    console.error('[User Router Error] /api/user/credits failed:', error);
    // Graceful fallback so production client never receives 500 status code
    sendSuccess(res, { credits: CREDIT_RATES.INITIAL_USER_CREDITS });
  }
});

// POST refill credits (Restricted in production / capped to max INITIAL_USER_CREDITS)
userRouter.post('/refill', (req: AuthRequest, res: Response) => {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const requestAdminToken = req.headers['x-admin-token'];

    // In production, require admin token if ADMIN_TOKEN is set, otherwise block refill
    if (process.env.NODE_ENV === 'production') {
      if (!adminToken || requestAdminToken !== adminToken) {
        sendError(res, 'Refill endpoint is disabled in production', 403, 'FORBIDDEN');
        return;
      }
    }

    const userId = getSessionId(req);
    const rawAmount = typeof req.body.amount === 'number' ? req.body.amount : CREDIT_RATES.INITIAL_USER_CREDITS;
    // Cap amount between 1 and INITIAL_USER_CREDITS to prevent infinite refill abuse
    const amount = Math.min(Math.max(1, rawAmount), CREDIT_RATES.INITIAL_USER_CREDITS);
    const credits = creditsDb.refillCredits(userId, amount);
    sendSuccess(res, { credits });
  } catch (error: any) {
    console.error('[User Router Error] /api/user/refill failed:', error);
    sendError(res, 'Failed to refill credits', 500);
  }
});



