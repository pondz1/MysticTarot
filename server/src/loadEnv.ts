import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Load .env from common locations so OMISE_* works whether the process
 * is started from repo root, server/, or Docker WORKDIR.
 * Does not override variables already set in the process environment (Coolify/K8s).
 */
export function loadEnv(): string[] {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server/.env'),
    // src/ or dist/server/src/
    path.resolve(here, '../.env'),
    path.resolve(here, '../../.env'),
    path.resolve(here, '../../../.env'),
    path.resolve(here, '../../../../.env'),
  ];

  const loaded: string[] = [];
  const seen = new Set<string>();

  for (const envPath of candidates) {
    const resolved = path.resolve(envPath);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    if (!fs.existsSync(resolved)) continue;
    dotenv.config({ path: resolved, override: false });
    loaded.push(resolved);
  }

  // Also default dotenv (cwd) in case none matched
  if (loaded.length === 0) {
    dotenv.config({ override: false });
  }

  return loaded;
}

export function logPaymentEnvStatus(): void {
  const secret = process.env.OMISE_SECRET_KEY?.trim();
  const pub = process.env.OMISE_PUBLIC_KEY?.trim();
  const sim = process.env.ENABLE_TOPUP_SIMULATOR;

  if (secret) {
    const masked =
      secret.length > 12
        ? `${secret.slice(0, 10)}…${secret.slice(-4)}`
        : '(set)';
    console.log(
      `[Payments] Omise enabled · secret=${masked} · public=${pub ? 'set' : 'MISSING (card pay needs OMISE_PUBLIC_KEY)'}`
    );
  } else {
    console.log(
      `[Payments] Omise NOT configured (no OMISE_SECRET_KEY) · topupSimulator default=${sim ?? 'auto'}`
    );
  }
}
