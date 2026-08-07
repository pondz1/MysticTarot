/**
 * Omise.js loader + card tokenization helpers (browser only).
 * Script: https://cdn.omise.co/omise.js
 */

export interface OmiseCardFields {
  name: string;
  number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
}

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'jcb'
  | 'discover'
  | 'unionpay'
  | 'unknown';

export interface CardBrandInfo {
  id: CardBrand;
  /** Thai / short label for UI */
  label: string;
  /** Typical lengths for this brand */
  lengths: number[];
  cvcLength: number;
}

/**
 * Detect brand from PAN prefix (IIN). Safe to call on every keystroke.
 * Order matters for overlapping ranges.
 */
export function detectCardBrand(number: string): CardBrandInfo {
  const d = number.replace(/\D/g, '');
  if (!d) {
    return { id: 'unknown', label: 'บัตร', lengths: [16], cvcLength: 3 };
  }

  // American Express: 34, 37
  if (/^3[47]/.test(d)) {
    return { id: 'amex', label: 'American Express', lengths: [15], cvcLength: 4 };
  }
  // JCB: 35
  if (/^35/.test(d)) {
    return { id: 'jcb', label: 'JCB', lengths: [16], cvcLength: 3 };
  }
  // Visa: 4
  if (/^4/.test(d)) {
    return { id: 'visa', label: 'Visa', lengths: [13, 16, 19], cvcLength: 3 };
  }
  // Mastercard: 51–55 or 2221–2720 (also 2 while typing)
  if (/^5[1-5]/.test(d) || /^2/.test(d)) {
    return { id: 'mastercard', label: 'Mastercard', lengths: [16], cvcLength: 3 };
  }
  // UnionPay: 62
  if (/^62/.test(d)) {
    return { id: 'unionpay', label: 'UnionPay', lengths: [16, 17, 18, 19], cvcLength: 3 };
  }
  // Discover: 6011, 65, 644–649
  if (/^6011/.test(d) || /^65/.test(d) || /^64[4-9]/.test(d)) {
    return { id: 'discover', label: 'Discover', lengths: [16, 19], cvcLength: 3 };
  }

  return { id: 'unknown', label: 'บัตร', lengths: [16], cvcLength: 3 };
}

/** Digits only, groups of 4 (Amex often 4-6-5 — keep simple 4-groups for UX). */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  const brand = detectCardBrand(digits);
  if (brand.id === 'amex') {
    // 4-6-5
    const a = digits.slice(0, 4);
    const b = digits.slice(4, 10);
    const c = digits.slice(10, 15);
    return [a, b, c].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** Auto-insert slash → MM/YY */
export function formatCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvc(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 4);
}

export function parseCardExpiry(exp: string): { month: number; year: number } | null {
  const cleaned = exp.replace(/\s/g, '');
  const m = cleaned.match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  let year = Number(m[2]);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return null;
  // Reject clearly expired (year in past, or same year past month)
  const now = new Date();
  if (year < now.getFullYear()) return null;
  if (year === now.getFullYear() && month < now.getMonth() + 1) return null;
  return { month, year };
}

export function validateCardFields(input: {
  name: string;
  number: string;
  exp: string;
  cvc: string;
}): string | null {
  if (!input.name.trim() || input.name.trim().length < 2) {
    return 'กรุณากรอกชื่อบนบัตร';
  }
  const digits = input.number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return 'หมายเลขบัตรไม่ถูกต้อง (13–19 หลัก)';
  }
  const exp = parseCardExpiry(input.exp);
  if (!exp) {
    return 'วันหมดอายุไม่ถูกต้อง (ใช้รูปแบบ MM/YY)';
  }
  const brand = detectCardBrand(digits);
  const cvcLen = input.cvc.replace(/\D/g, '').length;
  if (cvcLen < brand.cvcLength) {
    return brand.id === 'amex'
      ? 'กรุณากรอก CID 4 หลัก'
      : `กรุณากรอก CVC ${brand.cvcLength} หลัก`;
  }
  return null;
}

interface OmiseTokenResponse {
  id?: string;
  object?: string;
  message?: string;
  code?: string;
}

interface OmiseGlobal {
  setPublicKey: (key: string) => void;
  createToken: (
    type: 'card',
    card: OmiseCardFields,
    callback: (statusCode: number, response: OmiseTokenResponse) => void
  ) => void;
}

declare global {
  interface Window {
    Omise?: OmiseGlobal;
  }
}

let loadPromise: Promise<void> | null = null;

export function loadOmiseJs(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Omise.js requires a browser'));
  }
  if (window.Omise) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-omise-js]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Omise.js')));
      if (window.Omise) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.omise.co/omise.js';
    script.async = true;
    script.dataset.omiseJs = '1';
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Omise.js'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function createOmiseCardToken(
  publicKey: string,
  card: OmiseCardFields
): Promise<string> {
  await loadOmiseJs();
  if (!window.Omise) {
    throw new Error('Omise.js not available');
  }

  window.Omise.setPublicKey(publicKey);

  return new Promise((resolve, reject) => {
    window.Omise!.createToken('card', card, (statusCode, response) => {
      if (statusCode === 200 && response.id) {
        resolve(response.id);
        return;
      }
      reject(new Error(response.message || 'ไม่สามารถสร้างโทเคนบัตรได้'));
    });
  });
}
