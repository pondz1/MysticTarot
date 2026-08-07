import { describe, it, expect } from 'vitest';
import { parseUsageMeta } from '../usageMeta.js';

describe('parseUsageMeta', () => {
  it('parses OpenAI-style usage with reasoning_tokens', () => {
    const meta = parseUsageMeta({
      prompt_tokens: 4486,
      completion_tokens: 3706,
      total_tokens: 8192,
      completion_tokens_details: { reasoning_tokens: 2100 },
      prompt_tokens_details: { cached_tokens: 512 },
    });
    expect(meta.promptTokens).toBe(4486);
    expect(meta.completionTokens).toBe(3706);
    expect(meta.reasoningTokens).toBe(2100);
    expect(meta.visibleTokens).toBe(1606);
    expect(meta.cachedPromptTokens).toBe(512);
    expect(meta.estimated).toBe(false);
  });

  it('falls back to estimate when usage missing', () => {
    const meta = parseUsageMeta(undefined, { prompt_tokens: 100, completion_tokens: 200 });
    expect(meta.promptTokens).toBe(100);
    expect(meta.completionTokens).toBe(200);
    expect(meta.reasoningTokens).toBe(0);
    expect(meta.estimated).toBe(true);
  });

  it('accepts Responses-style aliases', () => {
    const meta = parseUsageMeta({
      input_tokens: 10,
      output_tokens: 50,
      output_tokens_details: { reasoning_tokens: 30 },
    });
    expect(meta.promptTokens).toBe(10);
    expect(meta.completionTokens).toBe(50);
    expect(meta.reasoningTokens).toBe(30);
    expect(meta.visibleTokens).toBe(20);
  });
});
