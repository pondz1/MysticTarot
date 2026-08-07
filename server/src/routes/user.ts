import { Router, Response } from 'express';
import { creditsDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { CREDIT_RATES } from '../constants/creditRates.js';
import { TOPUP_PACKAGES } from '../constants/topupPackages.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  getCreditFeatureFlags,
  isAdminOrDevAllowed,
  isTopupSimulatorEnabled,
} from '../utils/creditAccess.js';

export const userRouter = Router();

function getSessionId(req: AuthRequest): string {
  if (req.user?.userId) {
    return req.user.userId;
  }
  const headerId = req.headers['x-session-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    // Bound length to limit abuse of arbitrary session keys
    return headerId.trim().slice(0, 128);
  }
  return 'default_user';
}

// GET user credits for specific session
userRouter.get('/credits', (req: AuthRequest, res: Response) => {
  try {
    const userId = getSessionId(req);
    const credits = creditsDb.getCredits(userId);
    sendSuccess(res, { credits, features: getCreditFeatureFlags() });
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/credits failed:', error);
    // Graceful fallback so production client never receives 500 status code
    sendSuccess(res, {
      credits: CREDIT_RATES.INITIAL_USER_CREDITS,
      features: getCreditFeatureFlags(),
    });
  }
});

// GET feature flags for credit center UI
userRouter.get('/features', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, { features: getCreditFeatureFlags() });
});

// GET top-up packages list
userRouter.get('/packages', (_req: AuthRequest, res: Response) => {
  try {
    sendSuccess(res, {
      packages: TOPUP_PACKAGES,
      features: getCreditFeatureFlags(),
    });
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/packages failed:', error);
    sendError(res, 'Failed to fetch topup packages', 500);
  }
});

// POST refill credits (dev / admin only in production; capped)
userRouter.post('/refill', (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminOrDevAllowed(req)) {
      sendError(res, 'Refill endpoint is disabled in production', 403, 'FORBIDDEN');
      return;
    }

    const userId = getSessionId(req);
    const rawAmount =
      typeof req.body?.amount === 'number' ? req.body.amount : CREDIT_RATES.INITIAL_USER_CREDITS;
    // Cap amount between 1 and INITIAL_USER_CREDITS to prevent infinite refill abuse
    const amount = Math.min(
      Math.max(1, Math.floor(rawAmount)),
      CREDIT_RATES.INITIAL_USER_CREDITS
    );
    const credits = creditsDb.refillCredits(userId, amount, 'refill', { source: 'fast_refill' });
    sendSuccess(res, { credits, added: amount });
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/refill failed:', error);
    sendError(res, 'Failed to refill credits', 500);
  }
});

// GET daily refill status
userRouter.get('/daily-status', (req: AuthRequest, res: Response) => {
  try {
    const userId = getSessionId(req);
    const status = creditsDb.getDailyStatus(userId);
    sendSuccess(res, status);
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/daily-status failed:', error);
    sendError(res, 'Failed to fetch daily status', 500);
  }
});

// POST claim daily free bonus
userRouter.post('/claim-daily', (req: AuthRequest, res: Response) => {
  try {
    const userId = getSessionId(req);
    const result = creditsDb.claimDailyBonus(userId, CREDIT_RATES.INITIAL_USER_CREDITS);

    if (!result.success) {
      sendError(res, result.message, 400, 'DAILY_COOLDOWN', { credits: result.credits });
      return;
    }

    sendSuccess(res, result);
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/claim-daily failed:', error);
    sendError(res, 'Failed to claim daily bonus', 500);
  }
});

// POST redeem promo code
userRouter.post('/redeem-code', (req: AuthRequest, res: Response) => {
  try {
    const userId = getSessionId(req);
    const { code } = req.body ?? {};

    if (!code || typeof code !== 'string') {
      sendError(res, 'กรุณาระบุโค้ดส่วนลด', 400);
      return;
    }

    if (code.length > 64) {
      sendError(res, 'โค้ดส่วนลดไม่ถูกต้อง', 400, 'INVALID_PROMO_CODE');
      return;
    }

    const result = creditsDb.redeemPromoCode(userId, code);

    if (!result.success) {
      sendError(res, result.message, 400, 'INVALID_PROMO_CODE', { credits: result.credits });
      return;
    }

    sendSuccess(res, result);
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/redeem-code failed:', error);
    sendError(res, 'Failed to redeem promo code', 500);
  }
});

// POST /api/user/topup-simulate — demo only; disabled in production unless ENABLE_TOPUP_SIMULATOR=true
userRouter.post('/topup-simulate', (req: AuthRequest, res: Response) => {
  try {
    if (!isTopupSimulatorEnabled()) {
      sendError(
        res,
        'การเติมเครดิตจำลองปิดใช้งานใน production — รอระบบชำระเงินจริง',
        403,
        'TOPUP_SIMULATOR_DISABLED'
      );
      return;
    }

    const userId = getSessionId(req);
    const { packageId } = req.body ?? {};

    // Only trust server-side package catalog (ignore client-sent amount)
    if (!packageId || typeof packageId !== 'string') {
      sendError(res, 'กรุณาเลือกแพ็กเกจที่ถูกต้อง', 400, 'INVALID_PACKAGE');
      return;
    }

    const foundPkg = TOPUP_PACKAGES.find((p) => p.id === packageId);
    if (!foundPkg) {
      sendError(res, 'ไม่พบแพ็กเกจที่เลือก', 400, 'INVALID_PACKAGE');
      return;
    }

    const refillAmount = foundPkg.baseCredits + foundPkg.bonusCredits;
    const credits = creditsDb.refillCredits(userId, refillAmount, 'topup_simulate', {
      packageId: foundPkg.id,
      packageName: foundPkg.name,
      priceThb: foundPkg.priceThb,
      simulated: true,
    });

    sendSuccess(res, {
      credits,
      added: refillAmount,
      packageName: foundPkg.name,
      simulated: true,
      message: `[จำลอง] เติม ${refillAmount} Credit สำเร็จ (ไม่มีการชำระเงินจริง)`,
    });
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/topup-simulate failed:', error);
    sendError(res, 'Failed to process topup simulation', 500);
  }
});

// POST /api/user/reset-credits — dev / admin only
userRouter.post('/reset-credits', (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminOrDevAllowed(req)) {
      sendError(res, 'Reset credits is disabled in production', 403, 'FORBIDDEN');
      return;
    }

    const userId = getSessionId(req);
    const raw = req.body?.amount;
    const amount = Math.max(0, Math.min(10000, Math.floor(Number(raw) || 0)));
    const credits = creditsDb.resetCredits(userId, amount, { source: 'admin_reset' });
    sendSuccess(res, { credits, message: `รีเซ็ต Credit เป็น ${credits} CR สำเร็จ` });
  } catch (error: unknown) {
    console.error('[User Router Error] /api/user/reset-credits failed:', error);
    sendError(res, 'Failed to reset credits', 500);
  }
});
