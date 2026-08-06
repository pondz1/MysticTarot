import type { ApiSettings } from '../../types';
import { apiClient, ApiError } from '../apiClient';
import { authService } from '../authService';
import { DEFAULT_API_SETTINGS, PROVIDER_PRESETS } from '../../constants/aiSettings';
export { DEFAULT_API_SETTINGS, PROVIDER_PRESETS };

let lastCreditsDeducted: number = 1;

export function getLastCreditsDeducted(): number {
  return lastCreditsDeducted;
}

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
    defaultHeaders: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
}

export async function requestAiCompletion(
  systemPrompt: string,
  userPrompt: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const isStreamingEnabled = settings?.enableStreaming !== false;

  // If streaming is ON, accumulate text from streamAiCompletion (which sends stream: true to server)
  if (isStreamingEnabled) {
    let fullText = '';
    for await (const chunk of streamAiCompletion(systemPrompt, userPrompt, settings || DEFAULT_API_SETTINGS)) {
      fullText += chunk;
      if (onChunk) {
        onChunk(chunk);
      }
    }
    return cleanAiResponse(fullText);
  }

  // Mode 1: Custom API Key -> Direct Client Non-streaming Call
  if (settings && settings.mode === 'custom' && settings.apiKey) {
    lastCreditsDeducted = 0;
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
      stream: false,
    });

    const rawContent = completion.choices[0]?.message?.content || '';
    return cleanAiResponse(rawContent);
  }

  // Mode 2: Credit Mode -> Server Non-streaming Call (stream: false)
  try {
    const data = await apiClient.post<{ result?: string; remainingCredits?: number; creditsDeducted?: number }>('/api/ai/completion', {
      systemPrompt,
      userPrompt,
      settings,
      stream: false,
    });

    if (data.result) {
      if (typeof data.creditsDeducted === 'number') {
        lastCreditsDeducted = data.creditsDeducted;
      }
      if (typeof data.remainingCredits === 'number') {
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.remainingCredits }));
      }
      return cleanAiResponse(data.result);
    }
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (typeof err.response?.credits === 'number') {
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: err.response.credits }));
      }
      if (err.status === 402) {
        throw new Error(err.message || 'Credit ไม่เพียงพอ! กรุณาเติม Credit หรือเลือกใช้ Custom API Key');
      }
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
  // If user disabled streaming in settings, fallback to non-streaming request
  if (settings && settings.enableStreaming === false) {
    const fullResult = await requestAiCompletion(systemPrompt, userPrompt, settings);
    yield fullResult;
    return;
  }

  // Mode 1: Custom API Key -> Direct Client Streaming
  if (settings && settings.mode === 'custom' && settings.apiKey) {
    const client = await getOpenAIClient(settings);
    if (!client) {
      throw new Error('API Key ไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการตั้งค่า');
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
    return;
  }

  // Mode 2: Credit Mode -> Server SSE Streaming (/api/ai/completion with stream: true)
  const token = authService.getToken();
  const sessionId = getSessionId();
  const response = await fetch('/api/ai/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-session-id': sessionId,
    },
    body: JSON.stringify({
      systemPrompt,
      userPrompt,
      settings,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    if (typeof errJson?.credits === 'number') {
      window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: errJson.credits }));
    }
    if (response.status === 402) {
      throw new Error(errJson?.error || errJson?.message || 'Credit ไม่เพียงพอ! กรุณาเติม Credit หรือเลือกใช้ Custom API Key');
    }
    throw new Error(errJson?.error || errJson?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ไม่สามารถอ่านข้อมูลแบบ Stream จากเซิร์ฟเวอร์ได้');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const dataStr = trimmed.replace(/^data:\s*/, '');
      if (dataStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.content) {
          yield parsed.content;
        }
        if (typeof parsed.creditsDeducted === 'number') {
          lastCreditsDeducted = parsed.creditsDeducted;
        }
        if (typeof parsed.remainingCredits === 'number') {
          window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: parsed.remainingCredits }));
        }
      } catch {
        // Skip JSON parse error for incomplete SSE chunks
      }
    }
  }
}

