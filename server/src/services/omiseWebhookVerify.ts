import crypto from 'crypto';
import type { Request } from 'express';

/**
 * Omise webhook signature verification (HMAC-SHA256).
 * Docs: https://docs.omise.co/api-webhooks
 *
 * Headers:
 * - Omise-Signature: hex HMAC (comma-separated during secret rotation)
 * - Omise-Signature-Timestamp: unix seconds
 *
 * Signed payload: `${timestamp}.${rawBodyUtf8}`
 * Secret: Base64-decoded webhook secret from Dashboard
 */
export function verifyOmiseWebhookSignature(
  req: Request,
  secretBase64: string,
  options?: { maxSkewSeconds?: number }
): { ok: boolean; reason?: string } {
  const signatureHeader = req.headers['omise-signature'];
  const timestampHeader = req.headers['omise-signature-timestamp'];

  if (typeof signatureHeader !== 'string' || !signatureHeader.trim()) {
    return { ok: false, reason: 'missing Omise-Signature header' };
  }
  if (typeof timestampHeader !== 'string' || !timestampHeader.trim()) {
    return { ok: false, reason: 'missing Omise-Signature-Timestamp header' };
  }

  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody || rawBody.length === 0) {
    return { ok: false, reason: 'missing raw body for signature verification' };
  }

  const signedPayload = `${timestampHeader}.${rawBody.toString('utf8')}`;

  let secret: Buffer;
  try {
    secret = Buffer.from(secretBase64.trim(), 'base64');
    if (secret.length === 0) {
      return { ok: false, reason: 'webhook secret is empty after base64 decode' };
    }
  } catch {
    return { ok: false, reason: 'invalid webhook secret base64' };
  }

  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest();

  const signatures = signatureHeader
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let matched = false;
  for (const sig of signatures) {
    try {
      const sigBuffer = Buffer.from(sig, 'hex');
      if (
        sigBuffer.length === expected.length &&
        crypto.timingSafeEqual(sigBuffer, expected)
      ) {
        matched = true;
        break;
      }
    } catch {
      /* try next */
    }
  }

  if (!matched) {
    return { ok: false, reason: 'signature mismatch' };
  }

  // Optional replay protection
  const maxSkew = options?.maxSkewSeconds ?? 5 * 60;
  const ts = Number(timestampHeader);
  if (Number.isFinite(ts) && maxSkew > 0) {
    const skew = Math.abs(Date.now() / 1000 - ts);
    if (skew > maxSkew) {
      return { ok: false, reason: `timestamp skew too large (${Math.round(skew)}s)` };
    }
  }

  return { ok: true };
}
