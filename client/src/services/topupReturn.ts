/**
 * 3-D Secure / OTP return handling.
 * Before redirecting to Omise authorize_uri we stash the order id;
 * on return we resolve status and surface it in Credit Center.
 */

import { apiClient } from './apiClient';
import { publishCredits } from './creditEvents';

const STORAGE_KEY = 'mystic_topup_pending';
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export type PendingTopupSession = {
  orderId: string;
  packageName?: string;
  credits?: number;
  chargeId?: string | null;
  at: number;
};

export type TopupReturnResult = {
  orderId: string;
  status: 'checking' | 'fulfilled' | 'pending' | 'failed' | 'expired' | 'error';
  message: string;
  creditsBalance?: number;
  creditsAdded?: number;
  packageName?: string;
};

export function savePendingTopup(session: Omit<PendingTopupSession, 'at'>): void {
  try {
    const payload: PendingTopupSession = { ...session, at: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota */
  }
}

export function loadPendingTopup(): PendingTopupSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingTopupSession;
    if (!data?.orderId || typeof data.at !== 'number') return null;
    if (Date.now() - data.at > MAX_AGE_MS) {
      clearPendingTopup();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPendingTopup(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Read ?topup=return&order= from URL (or fallback to session). */
export function resolveReturnOrderId(search: string): string | null {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    if (params.get('topup') !== 'return') {
      // Still allow session-only recovery if user lands without query
      return null;
    }
    const fromUrl = params.get('order')?.trim();
    if (fromUrl) return fromUrl;
    return loadPendingTopup()?.orderId ?? null;
  } catch {
    return loadPendingTopup()?.orderId ?? null;
  }
}

export function isTopupReturnSearch(search: string): boolean {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    return params.get('topup') === 'return';
  } catch {
    return false;
  }
}

/**
 * Poll order status a few times after 3DS return.
 * Webhook may already have fulfilled; we only need to read DB / sync once.
 */
export async function resolveTopupReturnStatus(orderId: string): Promise<TopupReturnResult> {
  const pending = loadPendingTopup();
  const packageName = pending?.orderId === orderId ? pending.packageName : undefined;
  const expectedCredits = pending?.orderId === orderId ? pending.credits : undefined;

  const attempts = 8;
  const delayMs = 1500;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await apiClient.get<{
        status: string;
        creditsBalance?: number;
        credits?: number;
        failureMessage?: string | null;
        newlyFulfilled?: boolean;
        packageName?: string;
      }>(`/api/user/topup/${encodeURIComponent(orderId)}/status`);

      if (res.status === 'fulfilled' || res.status === 'successful') {
        if (typeof res.creditsBalance === 'number') {
          publishCredits(res.creditsBalance);
        }
        clearPendingTopup();
        const added = res.credits ?? expectedCredits;
        return {
          orderId,
          status: 'fulfilled',
          message:
            typeof added === 'number'
              ? `ชำระเงินสำเร็จ เพิ่ม ${added} เครดิตแล้ว`
              : 'ชำระเงินสำเร็จ เครดิตเข้าบัญชีแล้ว',
          creditsBalance: res.creditsBalance,
          creditsAdded: typeof added === 'number' ? added : undefined,
          packageName: res.packageName || packageName,
        };
      }

      if (res.status === 'failed' || res.status === 'expired') {
        clearPendingTopup();
        return {
          orderId,
          status: res.status === 'expired' ? 'expired' : 'failed',
          message: res.failureMessage || 'การชำระเงินไม่สำเร็จหรือหมดเวลา',
          packageName,
        };
      }

      // still pending — wait and retry (3DS just finished, webhook may lag)
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    } catch {
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  return {
    orderId,
    status: 'pending',
    message:
      'ยังยืนยันการชำระไม่ครบ — เครดิตอาจเข้าในไม่ช้า ลองเปิดศูนย์เครดิตอีกครั้งหรือรอสักครู่',
    packageName,
  };
}
