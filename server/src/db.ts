import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { eq, desc, sql } from 'drizzle-orm';
import {
  users,
  readings,
  userCredits,
  creditLedger,
  promoRedemptions,
  type ReadingSelect,
} from './schema.js';
import { CREDIT_RATES } from './constants/creditRates.js';
import { PROMO_CODES } from './constants/promoCodes.js';

// Standard DB directory configuration (defaults to ./data in working directory)
const dbDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'tarot.db');
export const sqlite = new Database(dbPath);

// Enable WAL mode for high performance & concurrency
sqlite.pragma('journal_mode = WAL');

// Initialize database schema tables if not exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    question TEXT,
    spread_mode TEXT,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_credits (
    user_id TEXT PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 10,
    last_daily_refill TEXT,
    used_codes TEXT DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS credit_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    delta INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    meta TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS promo_redemptions (
    code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    redeemed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (code, user_id)
  );

  CREATE TABLE IF NOT EXISTS payment_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    amount_satang INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'thb',
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    omise_charge_id TEXT,
    omise_source_id TEXT,
    qr_image_url TEXT,
    failure_message TEXT,
    fulfilled_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger(user_id);
  CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON promo_redemptions(code);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_orders_charge ON payment_orders(omise_charge_id)
    WHERE omise_charge_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
`);

// Safe migrations for existing SQLite databases
try {
  sqlite.exec('ALTER TABLE user_credits ADD COLUMN last_daily_refill TEXT;');
} catch {
  /* column exists */
}
try {
  sqlite.exec("ALTER TABLE user_credits ADD COLUMN used_codes TEXT DEFAULT '[]';");
} catch {
  /* column exists */
}

// Drizzle ORM Instance
export const db = drizzle(sqlite, {
  schema: { users, readings, userCredits, creditLedger, promoRedemptions },
});

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_SINGLE_REFILL = 1000;

function newLedgerId(): string {
  return `led_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeCreditAmount(amount: unknown, fallback = 0): number {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
}

function ensureUserRow(userId: string): number {
  const row = db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .get();
  if (!row) {
    db.insert(userCredits)
      .values({ userId, credits: CREDIT_RATES.INITIAL_USER_CREDITS })
      .run();
    return CREDIT_RATES.INITIAL_USER_CREDITS;
  }
  if (typeof row.credits === 'number' && row.credits < 0) {
    db.update(userCredits)
      .set({ credits: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userCredits.userId, userId))
      .run();
    return 0;
  }
  return Math.max(0, row.credits);
}

function appendLedger(
  userId: string,
  delta: number,
  balanceAfter: number,
  reason: string,
  meta?: Record<string, unknown>
): void {
  try {
    db.insert(creditLedger)
      .values({
        id: newLedgerId(),
        userId,
        delta,
        balanceAfter,
        reason,
        meta: meta ? JSON.stringify(meta) : null,
      })
      .run();
  } catch (e) {
    console.warn('[Credits] Failed to write ledger entry:', e);
  }
}

export interface DBUser {
  id: string;
  device_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export const usersDb = {
  getById(id: string): DBUser | undefined {
    const result = db.select().from(users).where(eq(users.id, id)).get();
    if (!result) return undefined;
    return {
      id: result.id,
      device_id: result.deviceId,
      role: result.role,
      created_at: result.createdAt || undefined,
      updated_at: result.updatedAt || undefined,
    };
  },

  getByDeviceId(deviceId: string): DBUser | undefined {
    const result = db.select().from(users).where(eq(users.deviceId, deviceId)).get();
    if (!result) return undefined;
    return {
      id: result.id,
      device_id: result.deviceId,
      role: result.role,
      created_at: result.createdAt || undefined,
      updated_at: result.updatedAt || undefined,
    };
  },

  findOrCreateByDeviceId(deviceId: string): DBUser {
    const existing = this.getByDeviceId(deviceId);
    if (existing) {
      return existing;
    }

    const newId = `usr_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    try {
      db.insert(users)
        .values({
          id: newId,
          deviceId: deviceId,
          role: 'guest',
        })
        .run();
    } catch {
      const recheck = this.getByDeviceId(deviceId);
      if (recheck) return recheck;
    }

    // Initialize default credits (10) for new user
    creditsDb.getCredits(newId);

    return {
      id: newId,
      device_id: deviceId,
      role: 'guest',
    };
  },
};

export interface DBReading {
  id: string;
  timestamp: number;
  question: string;
  spread_mode: string;
  data: string;
  created_at?: string;
}

export const readingsDb = {
  getAll(): DBReading[] {
    const rows = db.select().from(readings).orderBy(desc(readings.timestamp)).all();
    return rows.map((r: ReadingSelect) => ({
      id: r.id,
      timestamp: r.timestamp,
      question: r.question || '',
      spread_mode: r.spreadMode || 'three',
      data: r.data,
      created_at: r.createdAt || undefined,
    }));
  },

  getById(id: string): DBReading | undefined {
    const r = db.select().from(readings).where(eq(readings.id, id)).get();
    if (!r) return undefined;
    return {
      id: r.id,
      timestamp: r.timestamp,
      question: r.question || '',
      spread_mode: r.spreadMode || 'three',
      data: r.data,
      created_at: r.createdAt || undefined,
    };
  },

  save(id: string, timestamp: number, question: string, spreadMode: string, data: string): void {
    db.insert(readings)
      .values({
        id,
        timestamp,
        question,
        spreadMode,
        data,
      })
      .onConflictDoUpdate({
        target: readings.id,
        set: {
          timestamp,
          question,
          spreadMode,
          data,
        },
      })
      .run();
  },

  delete(id: string): boolean {
    const result = db.delete(readings).where(eq(readings.id, id)).run();
    return result.changes > 0;
  },

  clearAll(): void {
    db.delete(readings).run();
  },
};

export type CreditMutationReason =
  | 'initial'
  | 'refill'
  | 'topup_simulate'
  | 'topup_omise'
  | 'daily_bonus'
  | 'promo'
  | 'deduct'
  | 'refund'
  | 'reset'
  | 'settle_extra'
  | 'settle_refund';

export type PaymentOrderStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'expired'
  | 'fulfilled';

export interface PaymentOrder {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  credits: number;
  amountSatang: number;
  currency: string;
  method: string;
  status: PaymentOrderStatus;
  omiseChargeId: string | null;
  omiseSourceId: string | null;
  qrImageUrl: string | null;
  failureMessage: string | null;
  fulfilledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function mapPaymentOrder(row: {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  credits: number;
  amount_satang: number;
  currency: string;
  method: string;
  status: string;
  omise_charge_id: string | null;
  omise_source_id: string | null;
  qr_image_url: string | null;
  failure_message: string | null;
  fulfilled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}): PaymentOrder {
  return {
    id: row.id,
    userId: row.user_id,
    packageId: row.package_id,
    packageName: row.package_name,
    credits: row.credits,
    amountSatang: row.amount_satang,
    currency: row.currency,
    method: row.method,
    status: row.status as PaymentOrderStatus,
    omiseChargeId: row.omise_charge_id,
    omiseSourceId: row.omise_source_id,
    qrImageUrl: row.qr_image_url,
    failureMessage: row.failure_message,
    fulfilledAt: row.fulfilled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const paymentsDb = {
  create(order: {
    id: string;
    userId: string;
    packageId: string;
    packageName: string;
    credits: number;
    amountSatang: number;
    method: string;
    omiseChargeId?: string | null;
    omiseSourceId?: string | null;
    qrImageUrl?: string | null;
    status?: PaymentOrderStatus;
  }): PaymentOrder {
    sqlite
      .prepare(
        `INSERT INTO payment_orders (
          id, user_id, package_id, package_name, credits, amount_satang, currency,
          method, status, omise_charge_id, omise_source_id, qr_image_url
        ) VALUES (?, ?, ?, ?, ?, ?, 'thb', ?, ?, ?, ?, ?)`
      )
      .run(
        order.id,
        order.userId,
        order.packageId,
        order.packageName,
        order.credits,
        order.amountSatang,
        order.method,
        order.status || 'pending',
        order.omiseChargeId || null,
        order.omiseSourceId || null,
        order.qrImageUrl || null
      );
    return this.getById(order.id)!;
  },

  getById(id: string): PaymentOrder | undefined {
    const row = sqlite.prepare('SELECT * FROM payment_orders WHERE id = ?').get(id) as
      | Parameters<typeof mapPaymentOrder>[0]
      | undefined;
    return row ? mapPaymentOrder(row) : undefined;
  },

  getByChargeId(chargeId: string): PaymentOrder | undefined {
    const row = sqlite
      .prepare('SELECT * FROM payment_orders WHERE omise_charge_id = ?')
      .get(chargeId) as Parameters<typeof mapPaymentOrder>[0] | undefined;
    return row ? mapPaymentOrder(row) : undefined;
  },

  update(
    id: string,
    patch: {
      status?: PaymentOrderStatus;
      omiseChargeId?: string | null;
      omiseSourceId?: string | null;
      qrImageUrl?: string | null;
      failureMessage?: string | null;
      fulfilledAt?: string | null;
    }
  ): PaymentOrder | undefined {
    const current = this.getById(id);
    if (!current) return undefined;

    sqlite
      .prepare(
        `UPDATE payment_orders SET
          status = ?,
          omise_charge_id = ?,
          omise_source_id = ?,
          qr_image_url = ?,
          failure_message = ?,
          fulfilled_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        patch.status ?? current.status,
        patch.omiseChargeId !== undefined ? patch.omiseChargeId : current.omiseChargeId,
        patch.omiseSourceId !== undefined ? patch.omiseSourceId : current.omiseSourceId,
        patch.qrImageUrl !== undefined ? patch.qrImageUrl : current.qrImageUrl,
        patch.failureMessage !== undefined ? patch.failureMessage : current.failureMessage,
        patch.fulfilledAt !== undefined ? patch.fulfilledAt : current.fulfilledAt,
        id
      );

    return this.getById(id);
  },

  /**
   * Idempotent fulfill: grant credits once when Omise charge is successful.
   * Uses a single transaction + status guard so concurrent webhooks cannot double-credit.
   */
  fulfillIfSuccessful(
    orderId: string,
    opts?: { forceStatus?: PaymentOrderStatus; failureMessage?: string | null }
  ): { order: PaymentOrder; credits?: number; newlyFulfilled: boolean } {
    return sqlite.transaction(() => {
      const row = sqlite
        .prepare('SELECT * FROM payment_orders WHERE id = ?')
        .get(orderId) as Parameters<typeof mapPaymentOrder>[0] | undefined;

      if (!row) {
        throw new Error('Payment order not found');
      }

      const order = mapPaymentOrder(row);

      if (order.status === 'fulfilled') {
        return {
          order,
          credits: creditsDb.getCredits(order.userId),
          newlyFulfilled: false,
        };
      }

      if (opts?.forceStatus === 'failed' || opts?.forceStatus === 'expired') {
        sqlite
          .prepare(
            `UPDATE payment_orders SET status = ?, failure_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'fulfilled'`
          )
          .run(opts.forceStatus, opts.failureMessage || null, orderId);
        return { order: this.getById(orderId)!, newlyFulfilled: false };
      }

      // Only fulfill when explicitly successful path
      if (opts?.forceStatus !== 'successful' && order.status !== 'successful') {
        return { order, newlyFulfilled: false };
      }

      const now = new Date().toISOString();
      // Claim fulfill lock first — only one winner
      const claim = sqlite
        .prepare(
          `UPDATE payment_orders SET
            status = 'fulfilled',
            fulfilled_at = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status != 'fulfilled'
          RETURNING id`
        )
        .get(now, orderId) as { id: string } | undefined;

      if (!claim) {
        const latest = this.getById(orderId)!;
        return {
          order: latest,
          credits: creditsDb.getCredits(latest.userId),
          newlyFulfilled: false,
        };
      }

      const balance = creditsDb.refillCredits(order.userId, order.credits, 'topup_omise', {
        orderId: order.id,
        chargeId: order.omiseChargeId,
        packageId: order.packageId,
        amountSatang: order.amountSatang,
      });

      return {
        order: this.getById(orderId)!,
        credits: balance,
        newlyFulfilled: true,
      };
    })();
  },
};

export const creditsDb = {
  getCredits(userId: string = 'default_user'): number {
    return ensureUserRow(userId);
  },

  /** One-shot cleanup for any rows still negative (safe to call at boot). */
  clampAllNegativeCredits(): number {
    const rows = db
      .select({ userId: userCredits.userId, credits: userCredits.credits })
      .from(userCredits)
      .all();
    let fixed = 0;
    for (const row of rows) {
      if (typeof row.credits === 'number' && row.credits < 0) {
        db.update(userCredits)
          .set({ credits: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(userCredits.userId, row.userId))
          .run();
        fixed += 1;
      }
    }
    return fixed;
  },

  /**
   * Deduct credits without allowing a negative balance.
   * If `amount` exceeds balance, deducts remaining balance only.
   * Uses a better-sqlite3 transaction for atomic read-modify-write.
   */
  deductCredit(
    userId: string = 'default_user',
    amount: number = 1,
    reason: CreditMutationReason = 'deduct',
    meta?: Record<string, unknown>
  ): { success: boolean; remainingCredits: number; deducted: number } {
    const safeAmount = Math.max(0, sanitizeCreditAmount(amount, 0));
    ensureUserRow(userId);

    if (safeAmount <= 0) {
      return { success: false, remainingCredits: this.getCredits(userId), deducted: 0 };
    }

    const outcome = sqlite.transaction(() => {
      const row = sqlite
        .prepare('SELECT credits FROM user_credits WHERE user_id = ?')
        .get(userId) as { credits: number } | undefined;

      const current = Math.max(0, row?.credits ?? 0);
      if (current <= 0) {
        return { success: false as const, remainingCredits: 0, deducted: 0 };
      }

      const deducted = Math.min(safeAmount, current);
      const remainingCredits = current - deducted;

      sqlite
        .prepare(
          `UPDATE user_credits
           SET credits = ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`
        )
        .run(remainingCredits, userId);

      appendLedger(userId, -deducted, remainingCredits, reason, meta);
      return { success: true as const, remainingCredits, deducted };
    })();

    return outcome;
  },

  /**
   * Add credits (validated). Uses atomic SQL increment.
   */
  refillCredits(
    userId: string = 'default_user',
    amount: number = CREDIT_RATES.INITIAL_USER_CREDITS,
    reason: CreditMutationReason = 'refill',
    meta?: Record<string, unknown>
  ): number {
    ensureUserRow(userId);
    const safeAmount = sanitizeCreditAmount(amount, 0);
    if (safeAmount <= 0) {
      return this.getCredits(userId);
    }
    if (safeAmount > MAX_SINGLE_REFILL) {
      throw new Error(`Refill amount exceeds max ${MAX_SINGLE_REFILL}`);
    }

    const result = sqlite
      .prepare(
        `UPDATE user_credits
         SET credits = credits + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?
         RETURNING credits`
      )
      .get(safeAmount, userId) as { credits: number };

    const updated = Math.max(0, result.credits);
    appendLedger(userId, safeAmount, updated, reason, meta);
    return updated;
  },

  resetCredits(
    userId: string = 'default_user',
    targetCredits: number = 0,
    meta?: Record<string, unknown>
  ): number {
    ensureUserRow(userId);
    const safeTarget = Math.max(0, sanitizeCreditAmount(targetCredits, 0));
    const previous = this.getCredits(userId);

    sqlite
      .prepare(
        `UPDATE user_credits
         SET credits = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`
      )
      .run(safeTarget, userId);

    appendLedger(userId, safeTarget - previous, safeTarget, 'reset', meta);
    return safeTarget;
  },

  getDailyStatus(userId: string = 'default_user'): {
    canClaim: boolean;
    lastClaimedAt: string | null;
    nextAvailableMs: number;
  } {
    ensureUserRow(userId);
    const row = db
      .select({ lastDailyRefill: userCredits.lastDailyRefill })
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .get();

    if (!row || !row.lastDailyRefill) {
      return { canClaim: true, lastClaimedAt: null, nextAvailableMs: 0 };
    }

    const lastTime = new Date(row.lastDailyRefill).getTime();
    if (!Number.isFinite(lastTime)) {
      return { canClaim: true, lastClaimedAt: null, nextAvailableMs: 0 };
    }

    const now = Date.now();
    const diffMs = now - lastTime;

    if (diffMs >= DAILY_COOLDOWN_MS) {
      return { canClaim: true, lastClaimedAt: row.lastDailyRefill, nextAvailableMs: 0 };
    }

    return {
      canClaim: false,
      lastClaimedAt: row.lastDailyRefill,
      nextAvailableMs: DAILY_COOLDOWN_MS - diffMs,
    };
  },

  /**
   * Atomic daily claim: only succeeds if cooldown expired (or never claimed).
   */
  claimDailyBonus(
    userId: string = 'default_user',
    amount: number = 10
  ): { success: boolean; credits: number; added: number; message: string } {
    ensureUserRow(userId);
    const safeAmount = Math.max(0, sanitizeCreditAmount(amount, 10));
    if (safeAmount <= 0) {
      return {
        success: false,
        credits: this.getCredits(userId),
        added: 0,
        message: 'จำนวนโบนัสไม่ถูกต้อง',
      };
    }

    const nowIso = new Date().toISOString();
    const cutoffIso = new Date(Date.now() - DAILY_COOLDOWN_MS).toISOString();

    const result = sqlite
      .prepare(
        `UPDATE user_credits
         SET credits = credits + ?,
             last_daily_refill = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?
           AND (last_daily_refill IS NULL OR last_daily_refill < ?)
         RETURNING credits`
      )
      .get(safeAmount, nowIso, userId, cutoffIso) as { credits: number } | undefined;

    if (!result) {
      const status = this.getDailyStatus(userId);
      const current = this.getCredits(userId);
      const hours = Math.max(1, Math.ceil(status.nextAvailableMs / (1000 * 60 * 60)));
      return {
        success: false,
        credits: current,
        added: 0,
        message: `คุณได้รับสิทธิ์ของวันนี้ไปแล้ว สามารถรับโบนัสฟรีได้อีกครั้งในอีก ~${hours} ชั่วโมง`,
      };
    }

    const updated = Math.max(0, result.credits);
    appendLedger(userId, safeAmount, updated, 'daily_bonus', { amount: safeAmount });

    return {
      success: true,
      credits: updated,
      added: safeAmount,
      message: `รับโบนัสฟรีประจำวัน +${safeAmount} Credits สำเร็จ!`,
    };
  },

  /**
   * Atomic promo redeem: per-user once + optional global cap via promo_redemptions table.
   */
  redeemPromoCode(
    userId: string = 'default_user',
    rawCode: string
  ): { success: boolean; credits: number; added: number; message: string } {
    ensureUserRow(userId);
    const code = (rawCode || '').trim().toUpperCase();
    const promo = PROMO_CODES[code];

    if (!promo) {
      return {
        success: false,
        credits: this.getCredits(userId),
        added: 0,
        message: 'โค้ดส่วนลดไม่ถูกต้อง หรือหมดอายุแล้ว',
      };
    }

    const redeemTxn = sqlite.transaction(() => {
      // Already redeemed by this user?
      const existing = sqlite
        .prepare('SELECT 1 AS ok FROM promo_redemptions WHERE code = ? AND user_id = ?')
        .get(code, userId) as { ok: number } | undefined;

      if (existing) {
        return {
          success: false as const,
          credits: this.getCredits(userId),
          added: 0,
          message: `คุณเคยใช้งานโค้ด "${code}" นี้ไปแล้ว`,
        };
      }

      // Also check legacy used_codes JSON for backward compatibility
      const row = db
        .select({ credits: userCredits.credits, usedCodes: userCredits.usedCodes })
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .get();

      let usedList: string[] = [];
      try {
        if (row?.usedCodes) {
          usedList = JSON.parse(row.usedCodes);
        }
      } catch {
        usedList = [];
      }

      if (usedList.includes(code)) {
        // Backfill promo_redemptions so next check is fast
        try {
          sqlite
            .prepare(
              'INSERT OR IGNORE INTO promo_redemptions (code, user_id, redeemed_at) VALUES (?, ?, ?)'
            )
            .run(code, userId, new Date().toISOString());
        } catch {
          /* ignore */
        }
        return {
          success: false as const,
          credits: row?.credits ?? this.getCredits(userId),
          added: 0,
          message: `คุณเคยใช้งานโค้ด "${code}" นี้ไปแล้ว`,
        };
      }

      if (typeof promo.maxGlobalRedemptions === 'number' && promo.maxGlobalRedemptions > 0) {
        const countRow = sqlite
          .prepare('SELECT COUNT(*) AS cnt FROM promo_redemptions WHERE code = ?')
          .get(code) as { cnt: number };
        if (countRow.cnt >= promo.maxGlobalRedemptions) {
          return {
            success: false as const,
            credits: this.getCredits(userId),
            added: 0,
            message: `โค้ด "${code}" ถูกใช้ครบโควต้าแล้ว`,
          };
        }
      }

      usedList.push(code);
      const updateResult = sqlite
        .prepare(
          `UPDATE user_credits
           SET credits = credits + ?,
               used_codes = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?
           RETURNING credits`
        )
        .get(promo.credits, JSON.stringify(usedList), userId) as { credits: number };

      sqlite
        .prepare(
          'INSERT INTO promo_redemptions (code, user_id, redeemed_at) VALUES (?, ?, ?)'
        )
        .run(code, userId, new Date().toISOString());

      const updated = Math.max(0, updateResult.credits);
      appendLedger(userId, promo.credits, updated, 'promo', {
        code,
        credits: promo.credits,
      });

      return {
        success: true as const,
        credits: updated,
        added: promo.credits,
        message: `ใช้งานโค้ด "${code}" สำเร็จ! ได้รับ +${promo.credits} Credits (${promo.description})`,
      };
    });

    return redeemTxn();
  },

  getRecentLedger(userId: string, limit = 20) {
    return db
      .select()
      .from(creditLedger)
      .where(eq(creditLedger.userId, userId))
      .orderBy(desc(creditLedger.createdAt))
      .limit(limit)
      .all();
  },
};
