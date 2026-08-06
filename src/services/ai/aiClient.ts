import OpenAI from 'openai';
import type { ApiSettings } from '../../features/tarot/types/tarot';

export const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: 'sk-dce7f4d0918d74dd-ocq0dk-310c8c1d',
  baseUrl: 'https://9router.jsd.my.id/v1',
  model: 'tarot-cards',
};

// Preset providers for quick configuration
export const PROVIDER_PRESETS: { name: string; baseUrl: string; model: string; apiKey?: string }[] = [
  {
    name: '9Router (Tarot Special)',
    baseUrl: 'https://9router.jsd.my.id/v1',
    model: 'tarot-cards',
    apiKey: 'sk-dce7f4d0918d74dd-ocq0dk-310c8c1d'
  },
  { name: 'OpenAI (Default)', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' },
  { name: 'Local Ollama', baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
];

export function getOpenAIClient(settings?: ApiSettings): OpenAI | null {
  if (!settings) return null;
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return null;
  }
  const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
  return new OpenAI({
    apiKey: settings.apiKey || 'ollama',
    baseURL: cleanBaseUrl,
    dangerouslyAllowBrowser: true,
  });
}

// Sanitizer function to clean up AI thinking / prompt leakage
export function cleanAiResponse(rawContent: string): string {
  if (!rawContent) return '';

  // 1. Remove <think>...</think> tags (common in DeepSeek / Reasoning models)
  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Extract content starting from the first Markdown heading (e.g., # 🔮 or ## 🔮 or ## 🃏)
  const headingMatch = cleaned.match(/(#+\s*🔮?[\s\S]*)/i);
  if (headingMatch && headingMatch[1]) {
    cleaned = headingMatch[1].trim();
  } else {
    // Fallback: If no heading found, strip common English prompt reflection lines
    cleaned = cleaned
      .replace(/^(We need to|Constraints:|Let's craft|Pattern:|Structure:|Must keep|The instruction says)[\s\S]*?(?=\n\n|$)/gi, '')
      .trim();
  }

  return cleaned || rawContent.trim();
}

/**
 * Async generator for streaming response completion (for future AI streaming UI)
 */
export async function* streamAiCompletion(
  systemPrompt: string,
  userPrompt: string,
  settings: ApiSettings
): AsyncIterable<string> {
  const client = getOpenAIClient(settings);
  if (!client) {
    throw new Error('API key or endpoint configuration is invalid');
  }

  const stream = await client.chat.completions.create({
    model: settings.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 5000,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}
