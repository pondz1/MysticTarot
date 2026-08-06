import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'tarot.db');
export const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    question TEXT,
    spread_mode TEXT,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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
    const stmt = db.prepare('SELECT * FROM readings ORDER BY timestamp DESC');
    return stmt.all() as DBReading[];
  },

  getById(id: string): DBReading | undefined {
    const stmt = db.prepare('SELECT * FROM readings WHERE id = ?');
    return stmt.get(id) as DBReading | undefined;
  },

  save(id: string, timestamp: number, question: string, spreadMode: string, data: string): void {
    const stmt = db.prepare(`
      INSERT INTO readings (id, timestamp, question, spread_mode, data)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        timestamp = excluded.timestamp,
        question = excluded.question,
        spread_mode = excluded.spread_mode,
        data = excluded.data
    `);
    stmt.run(id, timestamp, question, spreadMode, data);
  },

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM readings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  clearAll(): void {
    const stmt = db.prepare('DELETE FROM readings');
    stmt.run();
  }
};
