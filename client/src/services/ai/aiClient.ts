import OpenAI from 'openai';
import type { ApiSettings } from '../../features/tarot/types/tarot';

export const DEFAULT_API_SETTINGS: ApiSettings = {
  mode: 'credit',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
};

// Preset providers for quick configuration (Custom Mode)
export const PROVIDER_PRESETS: { name: string; baseUrl: string; model: string; apiKey?: string }[] = [
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

/**
 * Execute AI completion:
 * - Mode 'credit': Sends request to our Server (/api/ai/completion) to deduct 1 credit & use server key.
 * - Mode 'custom': Connects directly from browser to the AI Provider (OpenAI / DeepSeek / etc.).
 */
export async function requestAiCompletion(
  systemPrompt: string,
  userPrompt: string,
  settings: ApiSettings
): Promise<string> {
  const isCustomMode = settings.mode === 'custom';

  // -------------------------------------------------------------
  // Mode 1: Custom Mode -> Connect directly to provider from browser
  // -------------------------------------------------------------
  if (isCustomMode) {
    const client = getOpenAIClient(settings);
    if (!client) {
      throw new Error('API Key หรือ Endpoint Configuration ไม่ถูกต้อง กรุณาตรวจสอบในหน้าตั้งค่า');
    }

    const completion = await client.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    });

    const rawContent = completion.choices[0]?.message?.content || '';
    return cleanAiResponse(rawContent);
  }

  // -------------------------------------------------------------
  // Mode 2: Credit Mode -> Route through our Server (/api/ai/completion)
  // -------------------------------------------------------------
  const res = await fetch('/api/ai/completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt, settings }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.result) {
      if (typeof data.remainingCredits === 'number') {
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.remainingCredits }));
      }
      return cleanAiResponse(data.result);
    }
  } else if (res.status === 402) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Credit ไม่เพียงพอ! กรุณาเติม Credit หรือเลือกใช้ Custom API Key');
  }

  throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้');
}

// Sanitizer function to clean up AI thinking / prompt leakage
export function cleanAiResponse(rawContent: string): string {
  if (!rawContent) return '';

  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const headingMatch = cleaned.match(/(#+\s*🔮?[\s\S]*)/i);
  if (headingMatch && headingMatch[1]) {
    cleaned = headingMatch[1].trim();
  } else {
    cleaned = cleaned
      .replace(/^(We need to|Constraints:|Let's craft|Pattern:|Structure:|Must keep|The instruction says)[\s\S]*?(?=\n\n|$)/gi, '')
      .trim();
  }

  return cleaned || rawContent.trim();
}

/**
 * Async generator for streaming response completion
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
