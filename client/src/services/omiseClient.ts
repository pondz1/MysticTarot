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
