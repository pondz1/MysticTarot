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

export const creditLedger = sqliteTable('credit_ledger', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  delta: integer('delta').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  reason: text('reason').notNull(),
  meta: text('meta'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const promoRedemptions = sqliteTable('promo_redemptions', {
  code: text('code').notNull(),
  userId: text('user_id').notNull(),
  redeemedAt: text('redeemed_at').default(sql`CURRENT_TIMESTAMP`),
});

export const paymentOrders = sqliteTable('payment_orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  packageId: text('package_id').notNull(),
  packageName: text('package_name').notNull(),
  credits: integer('credits').notNull(),
  amountSatang: integer('amount_satang').notNull(),
  currency: text('currency').notNull().default('thb'),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  omiseChargeId: text('omise_charge_id'),
  omiseSourceId: text('omise_source_id'),
  qrImageUrl: text('qr_image_url'),
  failureMessage: text('failure_message'),
  fulfilledAt: text('fulfilled_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type ReadingSelect = typeof readings.$inferSelect;
export type ReadingInsert = typeof readings.$inferInsert;
export type UserCreditsSelect = typeof userCredits.$inferSelect;
export type UserCreditsInsert = typeof userCredits.$inferInsert;
