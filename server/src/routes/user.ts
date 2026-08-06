import { Router, Request, Response } from 'express';
import { creditsDb } from '../db.js';

export const userRouter = Router();

// GET user credits
userRouter.get('/credits', (_req: Request, res: Response) => {
  try {
    const credits = creditsDb.getCredits();
    res.json({ credits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST refill mockup credits
userRouter.post('/refill', (req: Request, res: Response) => {
  try {
    const amount = typeof req.body.amount === 'number' ? req.body.amount : 10;
    const credits = creditsDb.refillCredits('default_user', amount);
    res.json({ success: true, credits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
