/**
 * Shared AI completion parameters (must stay aligned with client constants/aiCompletion.ts).
 *
 * Headroom is intentionally large:
 * - Thai multi-section readings are long
 * - Proxy may route to reasoning models whose "thinking" counts toward max_tokens
 *   (visible answer is only part of the completion budget)
 *
 * Override anytime via env (no code deploy needed for ops tuning):
 *   OPENAI_MAX_TOKENS=32000
 *   OPENAI_MAX_TOKENS_LONG=48000
 */
export const AI_COMPLETION = {
  temperature: 0.7,
  /**
   * Default completion budget (all modules).
   * 16k covers most non-reasoning models; still tight if thinking is heavy.
   */
  maxTokens: 16_000,
  /**
   * Long / thinking-friendly ceiling (tarot, deep charts, reasoning models).
   * Providers usually clamp to model max if this exceeds their limit.
   */
  maxTokensLong: 32_000,
  /** Combined system + user prompt character cap (abuse / cost guard) */
  maxPromptChars: 48_000,
  /** Soft estimate of prompt tokens when provider omits usage on stream */
  fallbackPromptTokensPerChar: 1 / 4,
  fallbackCompletionTokensPerChar: 1 / 3,
} as const;

/**
 * Modules that always get the long completion budget.
 * Everything else still gets a high default (maxTokens) for multi-model proxies.
 */
export const LONG_FORM_MODULES = new Set([
  'tarot',
  'tarot_followup',
  'thai_astrology',
  'numerology',
  'horoscope',
  'feng_shui',
]);

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Resolve max_tokens for a request.
 * Env OPENAI_MAX_TOKENS / OPENAI_MAX_TOKENS_LONG override built-in defaults.
 */
export function maxTokensForModule(moduleId?: string): number {
  const defaultBase = parsePositiveInt(
    process.env.OPENAI_MAX_TOKENS,
    AI_COMPLETION.maxTokens
  );
  const defaultLong = parsePositiveInt(
    process.env.OPENAI_MAX_TOKENS_LONG,
    AI_COMPLETION.maxTokensLong
  );

  // Prefer long budget when we know the module, or when module is unknown (freeform)
  if (!moduleId || LONG_FORM_MODULES.has(moduleId)) {
    return Math.max(defaultBase, defaultLong);
  }
  return defaultBase;
}

/**
 * Map provider errors to safe client-facing messages.
 */
export function sanitizeAiErrorMessage(error: unknown, isProduction: boolean): string {
  const raw =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: string }).message || '')
      : typeof error === 'string'
        ? error
        : '';

  const status =
    error && typeof error === 'object' && 'status' in error
      ? Number((error as { status?: number }).status)
      : undefined;

  if (status === 401 || /invalid.?api.?key|incorrect api key|authentication/i.test(raw)) {
    return 'คีย์ API ฝั่งเซิร์ฟเวอร์ไม่ถูกต้องหรือหมดอายุ กรุณาติดต่อผู้ดูแลระบบ';
  }
  if (status === 429 || /rate limit|too many requests|quota/i.test(raw)) {
    return 'ผู้ให้บริการ AI จำกัดอัตราการเรียกชั่วคราว กรุณาลองใหม่ในอีกสักครู่';
  }
  if (status === 400 || /context length|maximum context|too many tokens/i.test(raw)) {
    return 'คำขอมีข้อมูลยาวเกินไป กรุณาลดรายละเอียดแล้วลองใหม่';
  }
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|fetch failed|network/i.test(raw)) {
    return 'เชื่อมต่อผู้ให้บริการ AI ไม่ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง';
  }

  if (isProduction) {
    return 'ไม่สามารถประมวลผลคำขอ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
  }

  return raw || 'Failed to complete AI request';
}
