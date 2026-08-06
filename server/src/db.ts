import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { eq, desc, sql } from 'drizzle-orm';
import { users, readings, userCredits, type ReadingSelect } from './schema.js';

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

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
      db.insert(userCredits).values({ userId, credits: 10 }).run();
      return 10;
    }
    return row.credits;
  },

  deductCredit(userId: string = 'default_user'): { success: boolean; remainingCredits: number } {
    const current = this.getCredits(userId);
    if (current <= 0) {
      return { success: false, remainingCredits: 0 };
    }
    const remainingCredits = current - 1;
    db.update(userCredits)
      .set({ credits: remainingCredits, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userCredits.userId, userId))
      .run();
    return { success: true, remainingCredits };
  },

  refillCredits(userId: string = 'default_user', amount: number = 10): number {
    const current = this.getCredits(userId);
    const updated = current + amount;
    db.update(userCredits)
      .set({ credits: updated, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userCredits.userId, userId))
      .run();
    return updated;
  },
};
