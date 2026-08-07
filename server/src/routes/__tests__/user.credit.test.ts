import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app.js';
import { JWT_SECRET } from '../../middleware/auth.js';
import { creditsDb } from '../../db.js';

function signToken(userId: string) {
  return jwt.sign({ userId, deviceId: `dev_${userId}`, role: 'guest' }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

describe('Credit top-up routes', () => {
  const app = createApp();
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.ENABLE_TOPUP_SIMULATOR;
    delete process.env.ADMIN_TOKEN;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    if (originalEnv.ENABLE_TOPUP_SIMULATOR === undefined) {
      delete process.env.ENABLE_TOPUP_SIMULATOR;
    } else {
      process.env.ENABLE_TOPUP_SIMULATOR = originalEnv.ENABLE_TOPUP_SIMULATOR;
    }
    if (originalEnv.ADMIN_TOKEN === undefined) {
      delete process.env.ADMIN_TOKEN;
    } else {
      process.env.ADMIN_TOKEN = originalEnv.ADMIN_TOKEN;
    }
  });

  it('GET /api/user/features returns simulator enabled outside production', async () => {
    const res = await request(app).get('/api/user/features');
    expect(res.status).toBe(200);
    expect(res.body.features.topupSimulator).toBe(true);
    expect(res.body.features.isProduction).toBe(false);
  });

  it('POST /api/user/topup-simulate requires packageId and credits from server catalog', async () => {
    const token = signToken('topup_user_1');
    creditsDb.resetCredits('topup_user_1', 10);

    const bad = await request(app)
      .post('/api/user/topup-simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 999 });
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe('INVALID_PACKAGE');

    const res = await request(app)
      .post('/api/user/topup-simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ packageId: 'pkg_starter', amount: 9999 });

    expect(res.status).toBe(200);
    expect(res.body.added).toBe(20); // not 9999
    expect(res.body.simulated).toBe(true);
    expect(res.body.credits).toBe(30);
  });

  it('POST /api/user/topup-simulate is disabled in production without ENABLE_TOPUP_SIMULATOR', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_TOPUP_SIMULATOR;
    const token = signToken('topup_user_prod');

    const res = await request(app)
      .post('/api/user/topup-simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ packageId: 'pkg_starter' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('TOPUP_SIMULATOR_DISABLED');
  });

  it('POST /api/user/reset-credits blocked in production without admin token', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_TOKEN;
    const token = signToken('reset_user');

    const res = await request(app)
      .post('/api/user/reset-credits')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 9999 });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('POST /api/user/reset-credits allows admin token in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_TOKEN = 'secret-admin';
    const token = signToken('reset_admin_user');
    creditsDb.resetCredits('reset_admin_user', 5);

    // Temporarily allow admin path: resetCredits itself needs admin when called via HTTP
    // First set balance via direct db (already 5)
    const res = await request(app)
      .post('/api/user/reset-credits')
      .set('Authorization', `Bearer ${token}`)
      .set('x-admin-token', 'secret-admin')
      .send({ amount: 42 });

    expect(res.status).toBe(200);
    expect(res.body.credits).toBe(42);
  });

  it('POST /api/user/refill blocked in production without admin', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_TOKEN;
    const token = signToken('refill_user');

    const res = await request(app)
      .post('/api/user/refill')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10 });

    expect(res.status).toBe(403);
  });

  it('POST /api/user/claim-daily grants once then cools down', async () => {
    const userId = `daily_${Date.now()}`;
    const token = signToken(userId);
    creditsDb.resetCredits(userId, 0);

    const first = await request(app)
      .post('/api/user/claim-daily')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(first.status).toBe(200);
    expect(first.body.added).toBe(10);
    expect(first.body.credits).toBe(10);

    const second = await request(app)
      .post('/api/user/claim-daily')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(second.status).toBe(400);
    expect(second.body.code).toBe('DAILY_COOLDOWN');
    expect(second.body.credits).toBe(10);
  });

  it('POST /api/user/redeem-code is one-time per user', async () => {
    const userId = `promo_${Date.now()}`;
    const token = signToken(userId);
    creditsDb.resetCredits(userId, 0);

    const first = await request(app)
      .post('/api/user/redeem-code')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'WELCOME10' });

    expect(first.status).toBe(200);
    expect(first.body.added).toBe(10);
    expect(first.body.credits).toBe(10);

    const second = await request(app)
      .post('/api/user/redeem-code')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'welcome10' });

    expect(second.status).toBe(400);
    expect(second.body.credits).toBe(10);
  });

  it('GET /api/user/daily-status reflects claim state', async () => {
    const userId = `status_${Date.now()}`;
    const token = signToken(userId);
    creditsDb.resetCredits(userId, 0);

    const before = await request(app)
      .get('/api/user/daily-status')
      .set('Authorization', `Bearer ${token}`);
    expect(before.body.canClaim).toBe(true);

    await request(app)
      .post('/api/user/claim-daily')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    const after = await request(app)
      .get('/api/user/daily-status')
      .set('Authorization', `Bearer ${token}`);
    expect(after.body.canClaim).toBe(false);
    expect(after.body.nextAvailableMs).toBeGreaterThan(0);
  });
});
