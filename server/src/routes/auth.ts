import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usersDb, creditsDb } from '../db.js';
import { JWT_SECRET, AuthRequest, requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/guest-login
authRouter.post('/guest-login', (req: AuthRequest, res: Response): void => {
  try {
    const { deviceId } = req.body;

    if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
      res.status(400).json({ error: 'deviceId is required' });
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

    res.json({
      token,
      user,
      credits,
    });
  } catch (error: any) {
    console.error('[Auth Router Error] /guest-login failed:', error);
    res.status(500).json({ error: 'Failed to process guest login' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = usersDb.getById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const credits = creditsDb.getCredits(user.id);
    res.json({
      user,
      credits,
    });
  } catch (error: any) {
    console.error('[Auth Router Error] /me failed:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});
