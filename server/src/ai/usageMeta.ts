/**
 * Normalize OpenAI-compatible usage into a stable breakdown for billing/UI.
 * Reasoning/thinking models expose completion_tokens_details.reasoning_tokens.
 */

export type TokenUsageMeta = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Thinking/reasoning portion of completion (0 if not reported) */
  reasoningTokens: number;
  /** Approximate visible answer tokens = completion − reasoning (floored at 0) */
  visibleTokens: number;
  /** Prompt tokens served from cache (if reported) */
  cachedPromptTokens: number;
  /** true when numbers came from provider usage; false if estimated */
  estimated: boolean;
};

type LooseUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  completion_tokens_details?: {
    reasoning_tokens?: number | null;
    audio_tokens?: number | null;
  } | null;
  prompt_tokens_details?: {
    cached_tokens?: number | null;
    audio_tokens?: number | null;
  } | null;
  // Some proxies / Responses-style aliases
  input_tokens?: number;
  output_tokens?: number;
  output_tokens_details?: { reasoning_tokens?: number | null } | null;
  input_tokens_details?: { cached_tokens?: number | null } | null;
};

export function parseUsageMeta(
  usage: LooseUsage | null | undefined,
  fallback?: { prompt_tokens?: number; completion_tokens?: number }
): TokenUsageMeta {
  const promptTokens = Math.max(
    0,
    Math.floor(
      usage?.prompt_tokens ??
        usage?.input_tokens ??
        fallback?.prompt_tokens ??
        0
    )
  );
  const completionTokens = Math.max(
    0,
    Math.floor(
      usage?.completion_tokens ??
        usage?.output_tokens ??
        fallback?.completion_tokens ??
        0
    )
  );
  const reasoningTokens = Math.max(
    0,
    Math.floor(
      usage?.completion_tokens_details?.reasoning_tokens ??
        usage?.output_tokens_details?.reasoning_tokens ??
        0
    )
  );
  const cachedPromptTokens = Math.max(
    0,
    Math.floor(
      usage?.prompt_tokens_details?.cached_tokens ??
        usage?.input_tokens_details?.cached_tokens ??
        0
    )
  );
  const totalTokens = Math.max(
    0,
    Math.floor(usage?.total_tokens ?? promptTokens + completionTokens)
  );
  const estimated = !usage || (promptTokens === 0 && completionTokens === 0 && !fallback);

  return {
    promptTokens,
    completionTokens,
    totalTokens: totalTokens || promptTokens + completionTokens,
    reasoningTokens,
    visibleTokens: Math.max(0, completionTokens - reasoningTokens),
    cachedPromptTokens,
    estimated: Boolean(
      estimated ||
        (!usage?.prompt_tokens &&
          !usage?.completion_tokens &&
          !usage?.input_tokens &&
          !usage?.output_tokens &&
          fallback)
    ),
  };
}

export function usageMetaToLogLine(meta: TokenUsageMeta): string {
  const parts = [
    `in=${meta.promptTokens}`,
    `out=${meta.completionTokens}`,
    meta.reasoningTokens > 0 ? `think=${meta.reasoningTokens}` : null,
    meta.reasoningTokens > 0 ? `visible=${meta.visibleTokens}` : null,
    meta.cachedPromptTokens > 0 ? `cached_in=${meta.cachedPromptTokens}` : null,
    meta.estimated ? 'est' : 'api',
  ].filter(Boolean);
  return parts.join(' ');
}
