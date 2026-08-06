import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usersDb, creditsDb } from '../db.js';
import { JWT_SECRET, AuthRequest, requireAuth } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const authRouter = Router();

// POST /api/auth/guest-login
authRouter.post('/guest-login', (req: AuthRequest, res: Response): void => {
  try {
    const { deviceId } = req.body;

    if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
      sendError(res, 'deviceId is required', 400);
      return;
    }

    const cleanDeviceId = deviceId.trim();
    const user = usersDb.findOrCreateByDeviceId(cleanDeviceId);
    const credits = creditsDb.getCredits(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        deviceId: user.device_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    sendSuccess(res, {
      token,
      user,
      credits,
    });
  } catch (error: any) {
    console.error('[Auth Router Error] /guest-login failed:', error);
    sendError(res, 'Failed to process guest login', 500);
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const user = usersDb.getById(req.user.userId);
    if (!user) {
      sendError(res, 'User not found', 404, 'NOT_FOUND');
      return;
    }

    const credits = creditsDb.getCredits(user.id);
    sendSuccess(res, {
      user,
      credits,
    });
  } catch (error: any) {
    console.error('[Auth Router Error] /me failed:', error);
    sendError(res, 'Failed to fetch user details', 500);
  }
});

