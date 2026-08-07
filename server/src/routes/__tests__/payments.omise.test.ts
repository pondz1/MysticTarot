import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app.js';
import { JWT_SECRET } from '../../middleware/auth.js';
import { creditsDb, paymentsDb } from '../../db.js';

function signToken(userId: string) {
  return jwt.sign({ userId, deviceId: `dev_${userId}`, role: 'guest' }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

describe('Omise top-up payments', () => {
  const app = createApp();
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.OMISE_SECRET_KEY;
    delete process.env.OMISE_PUBLIC_KEY;
    delete process.env.OMISE_WEBHOOK_SECRET;
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    if (originalEnv.OMISE_SECRET_KEY) {
      process.env.OMISE_SECRET_KEY = originalEnv.OMISE_SECRET_KEY;
    } else {
      delete process.env.OMISE_SECRET_KEY;
    }
    if (originalEnv.OMISE_PUBLIC_KEY) {
      process.env.OMISE_PUBLIC_KEY = originalEnv.OMISE_PUBLIC_KEY;
    } else {
      delete process.env.OMISE_PUBLIC_KEY;
    }
    vi.unstubAllGlobals();
  });

  it('POST /api/user/topup/create returns 503 when Omise not configured', async () => {
    const token = signToken('pay_user_no_omise');
    const res = await request(app)
      .post('/api/user/topup/create')
      .set('Authorization', `Bearer ${token}`)
      .send({ packageId: 'pkg_starter', method: 'promptpay' });

    expect(res.status).toBe(503);
    expect(res.body.code).toBe('OMISE_NOT_CONFIGURED');
  });

  it('features.omisePayments is true when secret key set', async () => {
    process.env.OMISE_SECRET_KEY = 'skey_test_fake';
    process.env.OMISE_PUBLIC_KEY = 'pkey_test_fake';

    const res = await request(app).get('/api/user/features');
    expect(res.status).toBe(200);
    expect(res.body.features.omisePayments).toBe(true);
    expect(res.body.features.omisePublicKey).toBe('pkey_test_fake');
    expect(res.body.features.topupSimulator).toBe(false);
  });

  it('creates PromptPay charge via Omise API and returns QR', async () => {
    process.env.OMISE_SECRET_KEY = 'skey_test_fake';
    process.env.OMISE_PUBLIC_KEY = 'pkey_test_fake';

    // Starter Pack: ฿20 / 60 CR (PromptPay minimum)
    const chargeId = `chrg_test_pp_${Date.now()}`;
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith('/sources') && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            object: 'source',
            id: `src_test_pp_${Date.now()}`,
            type: 'promptpay',
            amount: 2000,
            currency: 'thb',
          }),
          { status: 200 }
        );
      }
      if (u.endsWith('/charges') && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            object: 'charge',
            id: chargeId,
            status: 'pending',
            amount: 2000,
            currency: 'thb',
            paid: false,
            source: {
              type: 'promptpay',
              scannable_code: {
                image: {
                  download_uri: `https://api.omise.co/charges/${chargeId}/documents/docx/downloads/qr.png`,
                },
              },
            },
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ object: 'error', message: `unexpected ${u}` }), {
        status: 500,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const userId = `omise_pp_${Date.now()}`;
    const token = signToken(userId);
    creditsDb.resetCredits(userId, 5);

    const res = await request(app)
      .post('/api/user/topup/create')
      .set('Authorization', `Bearer ${token}`)
      .send({ packageId: 'pkg_starter', method: 'promptpay' });

    expect(res.status).toBe(200);
    expect(res.body.orderId).toMatch(/^ord_/);
    expect(res.body.chargeId).toBe(chargeId);
    // Direct Omise download_uri for <img src>
    expect(res.body.qrImageUrl).toContain('qr.png');
    expect(res.body.status).toBe('pending');
    expect(res.body.credits).toBe(60);
    expect(creditsDb.getCredits(userId)).toBe(5); // not fulfilled yet
  });

  it('fulfills credits once when charge becomes successful (poll)', async () => {
    process.env.OMISE_SECRET_KEY = 'skey_test_fake';
    process.env.OMISE_PUBLIC_KEY = 'pkey_test_fake';

    const userId = `omise_ful_${Date.now()}`;
    const chargeId = `chrg_test_success_${Date.now()}`;
    const token = signToken(userId);
    creditsDb.resetCredits(userId, 10);

    const order = paymentsDb.create({
      id: `ord_test_${Date.now()}`,
      userId,
      packageId: 'pkg_starter',
      packageName: 'Starter Pack',
      credits: 60,
      amountSatang: 2000,
      method: 'promptpay',
      omiseChargeId: chargeId,
      status: 'pending',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            object: 'charge',
            id: chargeId,
            status: 'successful',
            amount: 2000,
            currency: 'thb',
            paid: true,
          }),
          { status: 200 }
        );
      })
    );

    const res1 = await request(app)
      .get(`/api/user/topup/${order.id}/status`)
      .set('Authorization', `Bearer ${token}`);

    expect(res1.status).toBe(200);
    expect(res1.body.status).toBe('fulfilled');
    expect(res1.body.newlyFulfilled).toBe(true);
    expect(res1.body.creditsBalance).toBe(70);
    expect(creditsDb.getCredits(userId)).toBe(70);

    // Second poll must not double-credit
    const res2 = await request(app)
      .get(`/api/user/topup/${order.id}/status`)
      .set('Authorization', `Bearer ${token}`);

    expect(res2.body.status).toBe('fulfilled');
    expect(res2.body.newlyFulfilled).toBe(false);
    expect(creditsDb.getCredits(userId)).toBe(70);
  });

  it('webhook charge.complete fulfills order (legacy ?secret=)', async () => {
    process.env.OMISE_SECRET_KEY = 'skey_test_fake';
    // plain string used only for legacy query fallback (not base64 Omise secret)
    process.env.OMISE_WEBHOOK_SECRET = 'legacy-custom-secret';

    const userId = `omise_wh_${Date.now()}`;
    const chargeId = `chrg_wh_${Date.now()}`;
    creditsDb.resetCredits(userId, 0);

    const order = paymentsDb.create({
      id: `ord_wh_${Date.now()}`,
      userId,
      packageId: 'pkg_popular',
      packageName: 'Popular Pack',
      credits: 130,
      amountSatang: 3900,
      method: 'promptpay',
      omiseChargeId: chargeId,
      status: 'pending',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            object: 'charge',
            id: chargeId,
            status: 'successful',
            amount: 3900,
            currency: 'thb',
            paid: true,
          }),
          { status: 200 }
        );
      })
    );

    const res = await request(app)
      .post('/api/webhooks/omise?secret=legacy-custom-secret')
      .send({
        object: 'event',
        id: 'evnt_1',
        key: 'charge.complete',
        data: { id: chargeId, object: 'charge', status: 'successful', amount: 3900 },
      });

    expect(res.status).toBe(200);
    expect(res.body.newlyFulfilled).toBe(true);
    expect(paymentsDb.getById(order.id)?.status).toBe('fulfilled');
    expect(creditsDb.getCredits(userId)).toBe(130);
  });

  it('webhook accepts Omise-Signature HMAC headers', async () => {
    process.env.OMISE_SECRET_KEY = 'skey_test_fake';
    const secretBytes = Buffer.from('omise-test-hmac-secret-key!!');
    const secretB64 = secretBytes.toString('base64');
    process.env.OMISE_WEBHOOK_SECRET = secretB64;

    const userId = `omise_sig_${Date.now()}`;
    const chargeId = `chrg_sig_${Date.now()}`;
    creditsDb.resetCredits(userId, 0);
    paymentsDb.create({
      id: `ord_sig_${Date.now()}`,
      userId,
      packageId: 'pkg_starter',
      packageName: 'Starter Pack',
      credits: 60,
      amountSatang: 2000,
      method: 'promptpay',
      omiseChargeId: chargeId,
      status: 'pending',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            object: 'charge',
            id: chargeId,
            status: 'successful',
            amount: 2000,
            currency: 'thb',
            paid: true,
          }),
          { status: 200 }
        );
      })
    );

    const body = {
      object: 'event',
      id: 'evnt_sig',
      key: 'charge.complete',
      data: { id: chargeId, object: 'charge', status: 'successful', amount: 2000 },
    };
    const raw = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const crypto = await import('crypto');
    const signature = crypto
      .createHmac('sha256', secretBytes)
      .update(`${timestamp}.${raw}`, 'utf8')
      .digest('hex');

    const res = await request(app)
      .post('/api/webhooks/omise')
      .set('Omise-Signature', signature)
      .set('Omise-Signature-Timestamp', timestamp)
      .set('Content-Type', 'application/json')
      .send(raw);

    expect(res.status).toBe(200);
    expect(res.body.newlyFulfilled).toBe(true);
  });

  it('rejects webhook with wrong secret', async () => {
    process.env.OMISE_SECRET_KEY = 'skey_test_fake';
    process.env.OMISE_WEBHOOK_SECRET = 'legacy-custom-secret';

    const res = await request(app)
      .post('/api/webhooks/omise?secret=wrong')
      .send({ object: 'event', key: 'charge.complete', data: { id: 'x' } });

    expect(res.status).toBe(401);
  });
});
