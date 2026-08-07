import { Router, Response, Request } from 'express';
import { creditsDb, paymentsDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { TOPUP_PACKAGES } from '../constants/topupPackages.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  createCharge,
  extractQrImageUrl,
  fetchQrImage,
  getOmisePublicKey,
  isChargeSuccessful,
  isOmiseConfigured,
  isOmiseTestMode,
  thbToSatang,
  type OmiseEvent,
  type OmisePaymentMethod,
} from '../services/omise.js';
import { syncAndFulfillByChargeId, syncAndFulfillOrder } from '../services/topupFulfillment.js';

export const paymentsRouter = Router();

function getSessionId(req: AuthRequest): string {
  if (req.user?.userId) {
    return req.user.userId;
  }
  const headerId = req.headers['x-session-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim().slice(0, 128);
  }
  return 'default_user';
}

function newOrderId(): string {
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Build 3DS return URL with order id always present.
 * Client may pass a base URL; we merge ?topup=return&order=...
 */
function buildCardReturnUri(
  req: AuthRequest,
  orderId: string,
  clientReturn?: unknown
): string | undefined {
  const publicBase =
    process.env.PUBLIC_APP_URL?.replace(/\/+$/, '') ||
    (typeof req.headers.origin === 'string' ? req.headers.origin.trim() : '') ||
    '';

  const fallbackOrigin = publicBase || 'http://localhost:5173';

  try {
    const raw =
      typeof clientReturn === 'string' && clientReturn.trim()
        ? clientReturn.trim()
        : `${fallbackOrigin}/`;
    const url = new URL(raw, fallbackOrigin);
    url.searchParams.set('topup', 'return');
    url.searchParams.set('order', orderId);
    return url.toString();
  } catch {
    if (!publicBase) return undefined;
    return `${publicBase}/?topup=return&order=${encodeURIComponent(orderId)}`;
  }
}

/**
 * POST /api/user/topup/create
 * Body: { packageId, method: 'promptpay' | 'card', omiseToken?: string (card), returnUri?: string }
 */
paymentsRouter.post('/topup/create', async (req: AuthRequest, res: Response) => {
  try {
    if (!isOmiseConfigured()) {
      sendError(
        res,
        'ระบบชำระเงิน Omise ยังไม่ได้ตั้งค่า (OMISE_SECRET_KEY)',
        503,
        'OMISE_NOT_CONFIGURED'
      );
      return;
    }

    const userId = getSessionId(req);
    const { packageId, method, omiseToken, returnUri } = req.body ?? {};

    if (!packageId || typeof packageId !== 'string') {
      sendError(res, 'กรุณาเลือกแพ็กเกจ', 400, 'INVALID_PACKAGE');
      return;
    }

    const pkg = TOPUP_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      sendError(res, 'ไม่พบแพ็กเกจที่เลือก', 400, 'INVALID_PACKAGE');
      return;
    }

    const payMethod = (method === 'card' ? 'card' : 'promptpay') as OmisePaymentMethod;
    if (payMethod === 'card' && (!omiseToken || typeof omiseToken !== 'string')) {
      sendError(res, 'กรุณากรอกข้อมูลบัตรให้ครบ', 400, 'CARD_TOKEN_REQUIRED');
      return;
    }

    const credits = pkg.baseCredits + pkg.bonusCredits;
    const amountSatang = thbToSatang(pkg.priceThb);

    // Omise PromptPay minimum is THB 20
    if (payMethod === 'promptpay' && amountSatang < 2000) {
      sendError(res, 'ยอด PromptPay ขั้นต่ำ ฿20', 400, 'AMOUNT_too_small');
      return;
    }

    const orderId = newOrderId();
    let qrImageUrl: string | null = null;

    // Always attach order id so 3DS return can resume the correct payment
    const cardReturnUri =
      payMethod === 'card' ? buildCardReturnUri(req, orderId, returnUri) : undefined;

    // PromptPay: single-shot source+charge (Omise recommended for server-side)
    const charge = await createCharge({
      amountSatang,
      promptpayInline: payMethod === 'promptpay',
      cardToken: payMethod === 'card' ? omiseToken : undefined,
      description: `MysticVerse ${pkg.name} (+${credits} CR)`,
      metadata: {
        order_id: orderId,
        user_id: userId,
        package_id: pkg.id,
        credits: String(credits),
      },
      returnUri: cardReturnUri,
    });

    qrImageUrl = extractQrImageUrl(charge);
    // If QR missing (race), re-fetch charge once
    if (payMethod === 'promptpay' && !qrImageUrl) {
      try {
        const { retrieveCharge } = await import('../services/omise.js');
        const again = await retrieveCharge(charge.id);
        qrImageUrl = extractQrImageUrl(again);
      } catch {
        /* ignore */
      }
    }

    const testMode = isOmiseTestMode();
    // Omise download_uri is publicly fetchable (no auth) — use it directly in <img>.
    // Proxy path requires Authorization headers which <img> cannot send.

    const order = paymentsDb.create({
      id: orderId,
      userId,
      packageId: pkg.id,
      packageName: pkg.name,
      credits,
      amountSatang,
      method: payMethod,
      omiseChargeId: charge.id,
      omiseSourceId: charge.source && 'id' in (charge.source as object)
        ? ((charge.source as { id?: string }).id ?? null)
        : null,
      qrImageUrl,
      status: isChargeSuccessful(charge) ? 'successful' : 'pending',
    });

    // Card may succeed immediately
    if (isChargeSuccessful(charge)) {
      const fulfilled = await syncAndFulfillOrder(order.id, { chargeHint: charge });
      sendSuccess(res, {
        orderId: order.id,
        chargeId: charge.id,
        status: fulfilled.order.status,
        method: payMethod,
        amountSatang,
        priceThb: pkg.priceThb,
        credits,
        packageName: pkg.name,
        qrImageUrl: null,
        authorizeUri: charge.authorize_uri || null,
        creditsBalance: fulfilled.credits ?? creditsDb.getCredits(userId),
        newlyFulfilled: fulfilled.newlyFulfilled,
        publicKey: getOmisePublicKey(),
        livemode: !testMode,
        testMode,
      });
      return;
    }

    sendSuccess(res, {
      orderId: order.id,
      chargeId: charge.id,
      status: order.status,
      method: payMethod,
      amountSatang,
      priceThb: pkg.priceThb,
      credits,
      packageName: pkg.name,
      // Direct Omise URL for <img src> (works without cookies/JWT)
      qrImageUrl,
      authorizeUri: charge.authorize_uri || null,
      publicKey: getOmisePublicKey(),
      livemode: !testMode,
      testMode,
      dashboardChargeUrl: testMode
        ? `https://dashboard.omise.co/test/charges/${charge.id}`
        : `https://dashboard.omise.co/charges/${charge.id}`,
    });
  } catch (error: unknown) {
    console.error('[Payments] /topup/create failed:', error);
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถสร้างรายการชำระเงินได้';
    sendError(res, message, 502, 'OMISE_CREATE_FAILED');
  }
});

/**
 * GET /api/user/topup/:orderId/qr
 * Proxy Omise QR image (PNG/SVG) for reliable <img> display.
 */
paymentsRouter.get('/topup/:orderId/qr', async (req: AuthRequest, res: Response) => {
  try {
    const userId = getSessionId(req);
    const orderId = String(req.params.orderId || '');
    const order = paymentsDb.getById(orderId);
    if (!order || order.userId !== userId) {
      sendError(res, 'Not found', 404, 'ORDER_NOT_FOUND');
      return;
    }
    if (!order.qrImageUrl) {
      sendError(res, 'QR not available', 404, 'QR_NOT_FOUND');
      return;
    }

    const { buffer, contentType } = await fetchQrImage(order.qrImageUrl);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=120');
    res.send(Buffer.from(buffer));
  } catch (error: unknown) {
    console.error('[Payments] QR proxy failed:', error);
    sendError(res, 'Failed to load QR', 502);
  }
});

/**
 * GET /api/user/topup/:orderId/status
 * Poll payment + auto-fulfill when Omise reports successful.
 */
paymentsRouter.get('/topup/:orderId/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!isOmiseConfigured()) {
      sendError(res, 'Omise is not configured', 503, 'OMISE_NOT_CONFIGURED');
      return;
    }

    const userId = getSessionId(req);
    const orderId = String(req.params.orderId || '');
    if (!orderId) {
      sendError(res, 'ไม่พบรายการชำระเงิน', 404, 'ORDER_NOT_FOUND');
      return;
    }
    const order = paymentsDb.getById(orderId);

    if (!order) {
      sendError(res, 'ไม่พบรายการชำระเงิน', 404, 'ORDER_NOT_FOUND');
      return;
    }

    // Only owner can poll (or same session)
    if (order.userId !== userId) {
      sendError(res, 'Forbidden', 403, 'FORBIDDEN');
      return;
    }

    const result = await syncAndFulfillOrder(order.id);
    const balance = creditsDb.getCredits(userId);

    sendSuccess(res, {
      orderId: result.order.id,
      chargeId: result.order.omiseChargeId,
      status: result.order.status,
      method: result.order.method,
      credits: result.order.credits,
      packageName: result.order.packageName,
      amountSatang: result.order.amountSatang,
      priceThb: result.order.amountSatang / 100,
      qrImageUrl: result.order.qrImageUrl,
      failureMessage: result.order.failureMessage,
      newlyFulfilled: result.newlyFulfilled,
      creditsBalance: balance,
    });
  } catch (error: unknown) {
    console.error('[Payments] /topup/status failed:', error);
    sendError(res, 'Failed to check payment status', 500);
  }
});

/**
 * POST /api/webhooks/omise
 * Omise event webhook — verify by re-fetching charge, then fulfill.
 */
export async function omiseWebhookHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!isOmiseConfigured()) {
      res.status(503).json({ error: 'Omise not configured' });
      return;
    }

    // Optional shared secret path segment or header
    const expected = process.env.OMISE_WEBHOOK_SECRET?.trim();
    if (expected) {
      const provided =
        (req.headers['x-omise-webhook-secret'] as string) ||
        (req.query.secret as string) ||
        '';
      if (provided !== expected) {
        res.status(401).json({ error: 'Invalid webhook secret' });
        return;
      }
    }

    const event = req.body as OmiseEvent;
    if (!event || event.object !== 'event') {
      res.status(400).json({ error: 'Invalid event payload' });
      return;
    }

    // Relevant keys: charge.complete, charge.create, charge.capture
    const key = event.key || '';
    if (!key.startsWith('charge.')) {
      res.status(200).json({ received: true, ignored: true });
      return;
    }

    const chargeData = event.data;
    const chargeId = chargeData?.id;
    if (!chargeId) {
      res.status(400).json({ error: 'Missing charge id' });
      return;
    }

    const result = await syncAndFulfillByChargeId(chargeId);
    if (!result) {
      // Order may not exist yet (race) or foreign charge
      console.warn('[Omise webhook] No local order for charge', chargeId);
      res.status(200).json({ received: true, order: null });
      return;
    }

    console.log(
      `[Omise webhook] ${key} charge=${chargeId} order=${result.order.id} status=${result.order.status} fulfilled=${result.newlyFulfilled}`
    );

    res.status(200).json({
      received: true,
      orderId: result.order.id,
      status: result.order.status,
      newlyFulfilled: result.newlyFulfilled,
    });
  } catch (error: unknown) {
    console.error('[Omise webhook] error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
