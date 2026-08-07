/**
 * Configuration & Rates for Token-to-Credit calculation
 */
export const CREDIT_RATES = {
  // Base token unit (1,000 tokens)
  TOKENS_BASE_UNIT: 1000,

  // Weighted credit rates per 1,000 tokens (aligned with LLM API cost ratio)
  INPUT_TOKEN_RATE_PER_1K: 1,   // 1 Credit per 1,000 Prompt (Input) Tokens
  OUTPUT_TOKEN_RATE_PER_1K: 4,  // 4 Credits per 1,000 Completion (Output) Tokens

  // Minimum credits deducted per AI completion call
  MIN_CREDITS_PER_REQUEST: 1,

  /**
   * Soft gate before starting a request.
   * Actual cost is settled from tokens after completion and can be higher;
   * balance is clamped so it never goes negative.
   */
  MIN_CREDITS_TO_START: 1,

  /**
   * Credits held (deducted) before calling the provider.
   * After completion, difference is refunded or extra-deducted via planCreditSettlement.
   */
  RESERVE_CREDITS_PER_REQUEST: 2,

  // Initial free credits granted to new users
  INITIAL_USER_CREDITS: 10,
} as const;

/**
 * After a reserve hold of `reserved`, settle to `actualCost` (token-based).
 * - actual > reserved → need extra deduct
 * - actual < reserved → refund difference
 * - actual === reserved → no-op
 */
export function planCreditSettlement(
  reserved: number,
  actualCost: number
): { extraDeduct: number; refund: number; netCharged: number } {
  const hold = Math.max(0, Math.floor(reserved));
  const actual = Math.max(0, Math.floor(actualCost));
  if (actual >= hold) {
    return { extraDeduct: actual - hold, refund: 0, netCharged: actual };
  }
  return { extraDeduct: 0, refund: hold - actual, netCharged: actual };
}

export interface TokenUsageInfo {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

/**
 * Calculates credits used based on token usage.
 * Weighted rates for Prompt (Input) & Completion (Output), then floor to whole credits
 * so fractional remainder is not charged against the customer (min 1).
 */
export function calculateCreditsFromTokens(usage?: TokenUsageInfo): number {
  if (!usage) {
    return CREDIT_RATES.MIN_CREDITS_PER_REQUEST;
  }

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  // Weighted cost: input 1 cr/1k + output 4 cr/1k
  const promptCredits =
    (promptTokens / CREDIT_RATES.TOKENS_BASE_UNIT) * CREDIT_RATES.INPUT_TOKEN_RATE_PER_1K;
  const completionCredits =
    (completionTokens / CREDIT_RATES.TOKENS_BASE_UNIT) * CREDIT_RATES.OUTPUT_TOKEN_RATE_PER_1K;
  const totalCalculated = promptCredits + completionCredits;

  // Floor: do not charge partial credits upward (e.g. 9.13 → 9, not 10)
  const creditsUsed = Math.floor(totalCalculated);
  return Math.max(CREDIT_RATES.MIN_CREDITS_PER_REQUEST, creditsUsed);
}
