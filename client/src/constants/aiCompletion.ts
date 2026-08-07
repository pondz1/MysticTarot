/**
 * Shared AI completion parameters (must stay aligned with server constants/aiCompletion.ts).
 */
export const AI_COMPLETION = {
  temperature: 0.7,
  maxTokens: 5000,
  defaultModel: 'gpt-4o-mini',
} as const;
