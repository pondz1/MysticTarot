import type { AuthRequest } from '../middleware/auth.js';
import { getOmisePublicKey, isOmiseConfigured, isOmiseTestMode } from '../services/omise.js';

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Dev-only tools (fast refill) or production with matching ADMIN_TOKEN.
 */
export function isAdminOrDevAllowed(req: AuthRequest): boolean {
  if (!isProduction()) return true;
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;
  return req.headers['x-admin-token'] === adminToken;
}

/**
 * Simulated top-up: enabled in non-production by default.
 * In production only when ENABLE_TOPUP_SIMULATOR=true (still not real payment).
 * When Omise is configured, simulator is off unless explicitly enabled.
 */
export function isTopupSimulatorEnabled(): boolean {
  if (process.env.ENABLE_TOPUP_SIMULATOR === 'true') return true;
  if (process.env.ENABLE_TOPUP_SIMULATOR === 'false') return false;
  // Prefer real payments when Omise keys are present
  if (isOmiseConfigured()) return false;
  return !isProduction();
}

export function isOmisePaymentsEnabled(): boolean {
  return isOmiseConfigured();
}

export function getCreditFeatureFlags() {
  const omise = isOmisePaymentsEnabled();
  const testMode = omise && isOmiseTestMode();
  return {
    topupSimulator: isTopupSimulatorEnabled(),
    omisePayments: omise,
    /** Public key for Omise.js card tokenization (safe to expose). */
    omisePublicKey: omise ? getOmisePublicKey() : null,
    /** skey_test_ — real bank apps will not complete PromptPay. */
    omiseTestMode: testMode,
    /** Show paid top-up UI when Omise is live, or simulator when enabled. */
    paidTopup: omise || isTopupSimulatorEnabled(),
    fastRefill: !isProduction() || Boolean(process.env.ADMIN_TOKEN),
    isProduction: isProduction(),
  };
}
