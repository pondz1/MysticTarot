import type { ApiSettings } from '../../features/tarot/types/tarot';
import { apiClient, ApiError } from '../apiClient';
export { DEFAULT_API_SETTINGS, PROVIDER_PRESETS } from '../../constants/aiSettings';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'default_user';
  let sessionId = localStorage.getItem('mystic_session_id');
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('mystic_session_id', sessionId);
  }
  return sessionId;
}

export async function getOpenAIClient(settings?: ApiSettings) {
  if (!settings) return null;
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return null;
  }
  const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
  const { default: OpenAI } = await import('openai');
  return new OpenAI({
    apiKey: settings.apiKey || 'ollama',
    baseURL: cleanBaseUrl,
    dangerouslyAllowBrowser: true,
  });
}

export async function requestAiCompletion(
  systemPrompt: string,
  userPrompt: string,
  settings?: ApiSettings
): Promise<string> {
  // Mode 1: Custom API Key -> Direct Client API Call
  if (settings && settings.mode === 'custom' && settings.apiKey) {
    const client = await getOpenAIClient(settings);
    if (!client) {
      throw new Error('API Key ไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการตั้งค่า');
    }

    const completion = await client.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawContent = completion.choices[0]?.message?.content || '';
    return cleanAiResponse(rawContent);
  }

  // -------------------------------------------------------------
  // Mode 2: Credit Mode -> Route through our Server (/api/ai/completion)
  // -------------------------------------------------------------
  try {
    const data = await apiClient.post<{ result?: string; remainingCredits?: number }>('/api/ai/completion', {
      systemPrompt,
      userPrompt,
      settings,
    });

    if (data.result) {
      if (typeof data.remainingCredits === 'number') {
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.remainingCredits }));
      }
      return cleanAiResponse(data.result);
    }
  } catch (err: any) {
    if (err instanceof ApiError && err.status === 402) {
      throw new Error(err.message || 'Credit ไม่เพียงพอ! กรุณาเติม Credit หรือเลือกใช้ Custom API Key');
    }
    throw new Error(err?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้');
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
  const client = await getOpenAIClient(settings);
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

