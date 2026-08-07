/**
 * Shared AI completion parameters (must stay aligned with server constants/aiCompletion.ts).
 *
 * Custom (browser / own key via proxy) uses maxTokensLong so reasoning models
 * that bill thinking against max_tokens still have room for the visible answer.
 */
export const AI_COMPLETION = {
  temperature: 0.7,
  /** Default completion budget */
  maxTokens: 16_000,
  /**
   * Used for all custom-mode completions (proxy may route to thinking models).
   * Providers typically clamp if the model supports less.
   */
  maxTokensLong: 32_000,
  defaultModel: 'gpt-4o-mini',
} as const;
