/**
 * Minimal Omise REST client (no CJS SDK dependency).
 * Docs: https://docs.omise.co
 */

const OMISE_API = 'https://api.omise.co';

export type OmisePaymentMethod = 'promptpay' | 'card';

export interface OmiseCharge {
  object: string;
  id: string;
  status: 'pending' | 'successful' | 'failed' | 'expired' | 'reversed';
  amount: number;
  currency: string;
  paid: boolean;
  failure_code?: string | null;
  failure_message?: string | null;
  metadata?: Record<string, string> | null;
  source?: {
    type?: string;
    scannable_code?: {
      image?: {
        download_uri?: string;
      };
    };
  } | null;
  card?: {
    brand?: string;
    last_digits?: string;
  } | null;
  authorize_uri?: string | null;
}

export interface OmiseSource {
  object: string;
  id: string;
  type: string;
  amount: number;
  currency: string;
  scannable_code?: {
    image?: {
      download_uri?: string;
    };
  };
}

export interface OmiseEvent {
  object: string;
  id: string;
  key: string;
  data: OmiseCharge;
}

export function isOmiseConfigured(): boolean {
  return Boolean(process.env.OMISE_SECRET_KEY?.trim());
}

export function getOmisePublicKey(): string | null {
  const key = process.env.OMISE_PUBLIC_KEY?.trim();
  return key || null;
}

/** True when using skey_test_ / pkey_test_ (bank apps cannot complete PromptPay). */
export function isOmiseTestMode(): boolean {
  const secret = process.env.OMISE_SECRET_KEY?.trim() || '';
  const pub = process.env.OMISE_PUBLIC_KEY?.trim() || '';
  return secret.includes('_test_') || pub.includes('_test_') || secret.startsWith('skey_test');
}

function secretKey(): string {
  const key = process.env.OMISE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('OMISE_SECRET_KEY is not configured');
  }
  return key;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${secretKey()}:`).toString('base64')}`;
}

async function omiseRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, string | number | undefined>
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: authHeader(),
  };

  let url = `${OMISE_API}${path}`;
  let init: RequestInit = { method, headers };

  if (method === 'POST' && body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    }
    init.body = params.toString();
  }

  const res = await fetch(url, init);
  const json = (await res.json()) as T & { object?: string; message?: string; code?: string };

  if (!res.ok || (json as { object?: string }).object === 'error') {
    const msg =
      (json as { message?: string }).message ||
      `Omise API error ${res.status} on ${method} ${path}`;
    const err = new Error(msg) as Error & { status?: number; code?: string };
    err.status = res.status;
    err.code = (json as { code?: string }).code;
    throw err;
  }

  return json;
}

/** THB satang: 29 THB → 2900 */
export function thbToSatang(thb: number): number {
  return Math.round(thb * 100);
}

export async function createPromptPaySource(amountSatang: number): Promise<OmiseSource> {
  return omiseRequest<OmiseSource>('POST', '/sources', {
    type: 'promptpay',
    amount: amountSatang,
    currency: 'thb',
    // Prefer PNG — SVG from Omise can be very large and harder to scan on screen
    'qr_settings[image_type]': 'png',
  });
}

export async function createCharge(params: {
  amountSatang: number;
  sourceId?: string;
  cardToken?: string;
  description: string;
  metadata: Record<string, string>;
  returnUri?: string;
  /** When true, create source+charge in one call (recommended server-side PromptPay). */
  promptpayInline?: boolean;
}): Promise<OmiseCharge> {
  const body: Record<string, string | number | undefined> = {
    amount: params.amountSatang,
    currency: 'thb',
    description: params.description,
    'metadata[order_id]': params.metadata.order_id,
    'metadata[user_id]': params.metadata.user_id,
    'metadata[package_id]': params.metadata.package_id,
    'metadata[credits]': params.metadata.credits,
  };

  if (params.promptpayInline) {
    body['source[type]'] = 'promptpay';
    body['source[qr_settings][image_type]'] = 'png';
  } else if (params.sourceId) {
    body.source = params.sourceId;
  }
  if (params.cardToken) {
    body.card = params.cardToken;
  }
  if (params.returnUri) {
    body.return_uri = params.returnUri;
  }

  return omiseRequest<OmiseCharge>('POST', '/charges', body);
}

export async function retrieveCharge(chargeId: string): Promise<OmiseCharge> {
  return omiseRequest<OmiseCharge>('GET', `/charges/${encodeURIComponent(chargeId)}`);
}

export function extractQrImageUrl(charge: OmiseCharge): string | null {
  return charge.source?.scannable_code?.image?.download_uri || null;
}

/**
 * Fetch QR image bytes from Omise download_uri (may be svg/png).
 * download_uri is usually public; falls back to secret-key auth if needed.
 */
export async function fetchQrImage(
  downloadUri: string
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  let res = await fetch(downloadUri);
  if (!res.ok) {
    res = await fetch(downloadUri, {
      headers: { Authorization: authHeader() },
    });
  }
  if (!res.ok) {
    throw new Error(`Failed to download QR image (${res.status})`);
  }
  const contentType = res.headers.get('content-type') || 'image/png';
  const buffer = await res.arrayBuffer();
  return { buffer, contentType };
}

export function isChargeSuccessful(charge: OmiseCharge): boolean {
  return charge.status === 'successful' || charge.paid === true;
}

export function isChargeFailed(charge: OmiseCharge): boolean {
  return charge.status === 'failed' || charge.status === 'expired' || charge.status === 'reversed';
}
