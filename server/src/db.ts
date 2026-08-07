import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { eq, desc, sql } from 'drizzle-orm';
import { users, readings, userCredits, type ReadingSelect } from './schema.js';
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
`);

// Safe migrations for existing SQLite databases
try { sqlite.exec("ALTER TABLE user_credits ADD COLUMN last_daily_refill TEXT;"); } catch {}
try { sqlite.exec("ALTER TABLE user_credits ADD COLUMN used_codes TEXT DEFAULT '[]';"); } catch {}

// Drizzle ORM Instance
export const db = drizzle(sqlite, { schema: { users, readings, userCredits } });

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
      db.insert(users).values({
        id: newId,
        deviceId: deviceId,
        role: 'guest',
      }).run();
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

export const creditsDb = {
  getCredits(userId: string = 'default_user'): number {
    const row = db.select({ credits: userCredits.credits }).from(userCredits).where(eq(userCredits.userId, userId)).get();
    if (!row) {
      db.insert(userCredits).values({ userId, credits: CREDIT_RATES.INITIAL_USER_CREDITS }).run();
      return CREDIT_RATES.INITIAL_USER_CREDITS;
    }
    // Heal legacy negative balances from older billing bugs
    if (typeof row.credits === 'number' && row.credits < 0) {
      db.update(userCredits)
        .set({ credits: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(userCredits.userId, userId))
        .run();
      return 0;
    }
    return Math.max(0, row.credits);
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
   */
  deductCredit(
    userId: string = 'default_user',
    amount: number = 1
  ): { success: boolean; remainingCredits: number; deducted: number } {
    const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
    const current = this.getCredits(userId);

    if (current <= 0 || safeAmount <= 0) {
      return { success: false, remainingCredits: Math.max(0, current), deducted: 0 };
    }

    const deducted = Math.min(safeAmount, current);
    const remainingCredits = current - deducted; // always >= 0

    db.update(userCredits)
      .set({ credits: remainingCredits, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userCredits.userId, userId))
      .run();

    return { success: true, remainingCredits, deducted };
  },

  refillCredits(userId: string = 'default_user', amount: number = CREDIT_RATES.INITIAL_USER_CREDITS): number {
    const current = this.getCredits(userId);
    const updated = current + amount;
    db.update(userCredits)
      .set({ credits: updated, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userCredits.userId, userId))
      .run();
    return updated;
  },

  resetCredits(userId: string = 'default_user', targetCredits: number = 0): number {
    db.update(userCredits)
      .set({ credits: targetCredits, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userCredits.userId, userId))
      .run();
    return targetCredits;
  },

  getDailyStatus(userId: string = 'default_user'): { canClaim: boolean; lastClaimedAt: string | null; nextAvailableMs: number } {
    const row = db.select({ lastDailyRefill: userCredits.lastDailyRefill }).from(userCredits).where(eq(userCredits.userId, userId)).get();
    if (!row || !row.lastDailyRefill) {
      return { canClaim: true, lastClaimedAt: null, nextAvailableMs: 0 };
    }

    const lastTime = new Date(row.lastDailyRefill).getTime();
    const now = Date.now();
    const diffMs = now - lastTime;
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

    if (diffMs >= cooldownMs) {
      return { canClaim: true, lastClaimedAt: row.lastDailyRefill, nextAvailableMs: 0 };
    }

    return {
      canClaim: false,
      lastClaimedAt: row.lastDailyRefill,
      nextAvailableMs: cooldownMs - diffMs,
    };
  },

  claimDailyBonus(userId: string = 'default_user', amount: number = 10): { success: boolean; credits: number; added: number; message: string } {
    const status = this.getDailyStatus(userId);
    if (!status.canClaim) {
      const current = this.getCredits(userId);
      const hours = Math.ceil(status.nextAvailableMs / (1000 * 60 * 60));
      return {
        success: false,
        credits: current,
        added: 0,
        message: `คุณได้รับสิทธิ์ของวันนี้ไปแล้ว สามารถรับโบนัสฟรีได้อีกครั้งในอีก ~${hours} ชั่วโมง`,
      };
    }

    const current = this.getCredits(userId);
    const updated = current + amount;
    db.update(userCredits)
      .set({
        credits: updated,
        lastDailyRefill: new Date().toISOString(),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(userCredits.userId, userId))
      .run();

    return {
      success: true,
      credits: updated,
      added: amount,
      message: `รับโบนัสฟรีประจำวัน +${amount} Credits สำเร็จ!`,
    };
  },

  redeemPromoCode(userId: string = 'default_user', rawCode: string): { success: boolean; credits: number; added: number; message: string } {
    const code = (rawCode || '').trim().toUpperCase();
    const promo = PROMO_CODES[code];

    if (!promo) {
      const current = this.getCredits(userId);
      return {
        success: false,
        credits: current,
        added: 0,
        message: 'โค้ดส่วนลดไม่ถูกต้อง หรือหมดอายุแล้ว',
      };
    }

    const row = db.select({ credits: userCredits.credits, usedCodes: userCredits.usedCodes }).from(userCredits).where(eq(userCredits.userId, userId)).get();
    let usedList: string[] = [];
    try {
      if (row?.usedCodes) {
        usedList = JSON.parse(row.usedCodes);
      }
    } catch {}

    if (usedList.includes(code)) {
      const current = row?.credits ?? this.getCredits(userId);
      return {
        success: false,
        credits: current,
        added: 0,
        message: `คุณเคยใช้งานโค้ด "${code}" นี้ไปแล้ว`,
      };
    }

    usedList.push(code);
    const current = row?.credits ?? this.getCredits(userId);
    const updated = current + promo.credits;

    db.update(userCredits)
      .set({
        credits: updated,
        usedCodes: JSON.stringify(usedList),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(userCredits.userId, userId))
      .run();

    return {
      success: true,
      credits: updated,
      added: promo.credits,
      message: `ใช้งานโค้ด "${code}" สำเร็จ! ได้รับ +${promo.credits} Credits (${promo.description})`,
    };
  },
};

