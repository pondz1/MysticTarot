import { paymentsDb, type PaymentOrder } from '../db.js';
import {
  isChargeFailed,
  isChargeSuccessful,
  retrieveCharge,
  type OmiseCharge,
} from './omise.js';

/**
 * Sync local order with Omise charge and fulfill credits if paid.
 * Always re-fetches charge from Omise when chargeId is present (webhook trust).
 */
export async function syncAndFulfillOrder(
  orderId: string,
  options?: { chargeHint?: OmiseCharge }
): Promise<{
  order: PaymentOrder;
  credits?: number;
  newlyFulfilled: boolean;
  charge?: OmiseCharge;
}> {
  const order = paymentsDb.getById(orderId);
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (order.status === 'fulfilled') {
    return {
      order,
      newlyFulfilled: false,
      credits: undefined,
    };
  }

  let charge = options?.chargeHint;
  if (order.omiseChargeId) {
    // Always verify with Omise API when possible
    try {
      charge = await retrieveCharge(order.omiseChargeId);
    } catch (e) {
      if (!charge) throw e;
      console.warn('[Omise] retrieveCharge failed, using hint:', e);
    }
  }

  if (!charge) {
    return { order, newlyFulfilled: false };
  }

  // Verify amount matches order (anti-tamper)
  if (charge.amount !== order.amountSatang) {
    console.error(
      `[Omise] Amount mismatch order=${order.id} expected=${order.amountSatang} got=${charge.amount}`
    );
    const failed = paymentsDb.update(order.id, {
      status: 'failed',
      failureMessage: 'ยอดชำระไม่ตรงกับคำสั่งซื้อ',
    });
    return { order: failed!, newlyFulfilled: false, charge };
  }

  if (isChargeSuccessful(charge)) {
    paymentsDb.update(order.id, { status: 'successful' });
    const result = paymentsDb.fulfillIfSuccessful(order.id, { forceStatus: 'successful' });
    return { ...result, charge };
  }

  if (isChargeFailed(charge)) {
    const failed = paymentsDb.update(order.id, {
      status: charge.status === 'expired' ? 'expired' : 'failed',
      failureMessage: charge.failure_message || `Charge ${charge.status}`,
    });
    return { order: failed!, newlyFulfilled: false, charge };
  }

  // still pending
  return { order, newlyFulfilled: false, charge };
}

export async function syncAndFulfillByChargeId(chargeId: string) {
  const order = paymentsDb.getByChargeId(chargeId);
  if (!order) {
    // Unknown charge — retrieve and ignore if no matching order
    return null;
  }
  return syncAndFulfillOrder(order.id);
}
