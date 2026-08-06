import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  role: text('role').notNull().default('guest'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const readings = sqliteTable('readings', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp').notNull(),
  question: text('question'),
  spreadMode: text('spread_mode'),
  data: text('data').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const userCredits = sqliteTable('user_credits', {
  userId: text('user_id').primaryKey(),
  credits: integer('credits').notNull().default(10),
  lastDailyRefill: text('last_daily_refill'),
  usedCodes: text('used_codes').default('[]'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type ReadingSelect = typeof readings.$inferSelect;
export type ReadingInsert = typeof readings.$inferInsert;
export type UserCreditsSelect = typeof userCredits.$inferSelect;
export type UserCreditsInsert = typeof userCredits.$inferInsert;
