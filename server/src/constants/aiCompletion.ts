/**
 * Shared AI completion parameters (must stay aligned with client constants/aiCompletion.ts).
 */
export const AI_COMPLETION = {
  temperature: 0.7,
  maxTokens: 5000,
  /** Combined system + user prompt character cap (abuse / cost guard) */
  maxPromptChars: 48_000,
  /** Soft estimate of prompt tokens when provider omits usage on stream */
  fallbackPromptTokensPerChar: 1 / 4,
  fallbackCompletionTokensPerChar: 1 / 3,
} as const;

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
