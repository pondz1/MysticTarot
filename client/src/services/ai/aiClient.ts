import type { ApiSettings, SavedReading } from '../../types';
import { apiClient, ApiError, getClientSessionId } from '../apiClient';
import { authService } from '../authService';
import { DEFAULT_API_SETTINGS, PROVIDER_PRESETS } from '../../constants/aiSettings';
import { AI_COMPLETION } from '../../constants/aiCompletion';

export { DEFAULT_API_SETTINGS, PROVIDER_PRESETS };

/** Modules with server-owned prompts (credit mode). Must match server/src/ai/types.ts */
export type AiModuleId =
  | 'tarot'
  | 'tarot_followup'
  | 'horoscope'
  | 'numerology'
  | 'feng_shui'
  | 'thai_astrology';

export type AiCompletionOptions = {
  onChunk?: (chunk: string) => void;
  historyEntry?: Partial<SavedReading>;
  signal?: AbortSignal;
};

let lastCreditsDeducted: number = 1;

export function getLastCreditsDeducted(): number {
  return lastCreditsDeducted;
}

/** @deprecated Prefer getClientSessionId from apiClient */
export function getSessionId(): string {
  return getClientSessionId();
}

export function isCustomKeyMode(settings?: ApiSettings): boolean {
  return !!(settings && settings.mode === 'custom' && settings.apiKey);
}

function buildChatMessages(systemPrompt: string, userPrompt: string) {
  return [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const err = new Error('ยกเลิกคำขอ AI แล้ว');
    err.name = 'AbortError';
    throw err;
  }
}

function applyCreditMeta(meta: { creditsDeducted?: number; remainingCredits?: number }): void {
  if (typeof meta.creditsDeducted === 'number') {
    lastCreditsDeducted = meta.creditsDeducted;
  }
  if (typeof meta.remainingCredits === 'number' && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: meta.remainingCredits }));
  }
}

export async function getOpenAIClient(settings?: ApiSettings) {
  if (!settings) return null;
  const isLocalHost =
    settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
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
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
}

/** Custom key: browser non-stream */
async function customNonStream(
  systemPrompt: string,
  userPrompt: string,
  settings: ApiSettings,
  signal?: AbortSignal
): Promise<string> {
  lastCreditsDeducted = 0;
  const client = await getOpenAIClient(settings);
  if (!client) {
    throw new Error('API Key ไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการตั้งค่า');
  }
  const completion = await client.chat.completions.create(
    {
      model: settings.model || AI_COMPLETION.defaultModel,
      messages: buildChatMessages(systemPrompt, userPrompt),
      temperature: AI_COMPLETION.temperature,
      max_tokens: AI_COMPLETION.maxTokens,
      stream: false,
    },
    signal ? { signal } : undefined
  );
  throwIfAborted(signal);
  return cleanAiResponse(completion.choices[0]?.message?.content || '');
}

/** Custom key: browser stream */
async function* customStream(
  systemPrompt: string,
  userPrompt: string,
  settings: ApiSettings,
  signal?: AbortSignal
): AsyncIterable<string> {
  lastCreditsDeducted = 0;
  const client = await getOpenAIClient(settings);
  if (!client) {
    throw new Error('API Key ไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการตั้งค่า');
  }
  const stream = await client.chat.completions.create(
    {
      model: settings.model || AI_COMPLETION.defaultModel,
      messages: buildChatMessages(systemPrompt, userPrompt),
      temperature: AI_COMPLETION.temperature,
      max_tokens: AI_COMPLETION.maxTokens,
      stream: true,
    },
    signal ? { signal } : undefined
  );
  for await (const chunk of stream) {
    throwIfAborted(signal);
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) yield content;
  }
}

type CreditBody = {
  module: AiModuleId;
  payload: unknown;
  settings?: ApiSettings;
  stream: boolean;
  historyEntry?: Partial<SavedReading>;
};

async function creditNonStream(body: CreditBody, signal?: AbortSignal): Promise<string> {
  try {
    const data = await apiClient.post<{
      result?: string;
      remainingCredits?: number;
      creditsDeducted?: number;
    }>(
      '/api/ai/completion',
      {
        module: body.module,
        payload: body.payload,
        settings: { mode: 'credit' },
        stream: false,
        historyEntry: body.historyEntry,
      },
      signal ? { signal } : undefined
    );

    if (data.result) {
      applyCreditMeta({
        creditsDeducted: data.creditsDeducted,
        remainingCredits: data.remainingCredits,
      });
      return cleanAiResponse(data.result);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    if (err instanceof ApiError) {
      if (typeof err.response?.credits === 'number') {
        applyCreditMeta({ remainingCredits: err.response.credits as number });
      }
      if (err.status === 401) {
        throw new Error(
          err.message || 'กรุณาเข้าสู่ระบบก่อนใช้ Credit หรือใช้ API Key ของคุณเอง'
        );
      }
      if (err.status === 402) {
        throw new Error(err.message || 'Credit ไม่เพียงพอ! กรุณาเติม Credit หรือเลือกใช้ Custom API Key');
      }
      throw new Error(err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้');
    }
    const message =
      err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้';
    throw new Error(message);
  }
  throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้');
}

async function* creditStream(body: CreditBody, signal?: AbortSignal): AsyncIterable<string> {
  const token = authService.getToken();
  if (!token) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนใช้ Credit (รีเฟรชหน้า) หรือใช้ API Key ของคุณเอง');
  }

  const response = await fetch('/api/ai/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Session-ID': getClientSessionId(),
    },
    body: JSON.stringify({
      module: body.module,
      payload: body.payload,
      settings: { mode: 'credit' },
      stream: true,
      historyEntry: body.historyEntry,
    }),
    signal,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({} as Record<string, unknown>));
    if (typeof errJson?.credits === 'number') {
      applyCreditMeta({ remainingCredits: errJson.credits as number });
    }
    if (response.status === 401) {
      throw new Error(
        (errJson?.error as string) ||
          'กรุณาเข้าสู่ระบบก่อนใช้ Credit (รีเฟรชหน้า) หรือใช้ API Key ของคุณเอง'
      );
    }
    if (response.status === 402) {
      throw new Error(
        (errJson?.error as string) ||
          (errJson?.message as string) ||
          'Credit ไม่เพียงพอ! กรุณาเติม Credit หรือเลือกใช้ Custom API Key'
      );
    }
    throw new Error(
      (errJson?.error as string) ||
        (errJson?.message as string) ||
        'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Credit ได้ในขณะนี้'
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ไม่สามารถอ่านข้อมูลแบบ Stream จากเซิร์ฟเวอร์ได้');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let isFinished = false;

  try {
    while (!isFinished) {
      throwIfAborted(signal);
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          isFinished = true;
          break;
        }
        try {
          const parsed = JSON.parse(dataStr) as {
            content?: string;
            creditsDeducted?: number;
            remainingCredits?: number;
            error?: string;
          };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.content) yield parsed.content;
          applyCreditMeta({
            creditsDeducted: parsed.creditsDeducted,
            remainingCredits: parsed.remainingCredits,
          });
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message && !/JSON/i.test(parseErr.message)) {
            throw parseErr;
          }
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

/**
 * Credit mode: module + payload only (server builds prompts).
 * Custom mode: pass systemPrompt + userPrompt (built on client).
 */
export async function requestModuleAiCompletion(
  module: AiModuleId,
  payload: unknown,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal,
  /** Required when settings.mode === 'custom' — local prompts for BYOK */
  localPrompts?: { systemPrompt: string; userPrompt: string }
): Promise<string> {
  const active = settings || DEFAULT_API_SETTINGS;
  const streaming = active.enableStreaming !== false;

  // Custom API key → browser SDK with client-built prompts
  if (isCustomKeyMode(active)) {
    if (!localPrompts?.systemPrompt || !localPrompts?.userPrompt) {
      throw new Error('Custom mode ต้องมี systemPrompt และ userPrompt');
    }
    if (streaming) {
      let full = '';
      for await (const chunk of customStream(
        localPrompts.systemPrompt,
        localPrompts.userPrompt,
        active,
        signal
      )) {
        full += chunk;
        onChunk?.(chunk);
      }
      return cleanAiResponse(full);
    }
    return customNonStream(localPrompts.systemPrompt, localPrompts.userPrompt, active, signal);
  }

  // Credit mode → server-owned prompts
  const body: CreditBody = {
    module,
    payload,
    settings: active,
    stream: streaming,
    historyEntry,
  };

  if (streaming) {
    let full = '';
    for await (const chunk of creditStream(body, signal)) {
      full += chunk;
      onChunk?.(chunk);
    }
    return cleanAiResponse(full);
  }
  return creditNonStream(body, signal);
}

/**
 * @deprecated Prefer requestModuleAiCompletion.
 * Kept for any free-form callers; routes to custom browser or rejects credit without module.
 */
export async function requestAiCompletion(
  systemPrompt: string,
  userPrompt: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const active = settings || DEFAULT_API_SETTINGS;
  if (isCustomKeyMode(active)) {
    return requestModuleAiCompletion(
      'tarot', // unused for custom
      {},
      active,
      onChunk,
      historyEntry,
      signal,
      { systemPrompt, userPrompt }
    );
  }
  // Credit free-form is no longer allowed
  throw new Error(
    'โหมด Credit ต้องเรียกผ่าน module ที่รองรับ — ใช้ requestModuleAiCompletion แทน'
  );
}

export function cleanAiResponse(rawContent: string): string {
  if (!rawContent) return '';

  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const headingMatch = cleaned.match(/(#{1,6}\s+[^\n][\s\S]*)/);
  if (headingMatch?.[1]) {
    cleaned = headingMatch[1].trim();
  } else {
    cleaned = cleaned
      .replace(
        /^(We need to|Constraints:|Let's craft|Pattern:|Structure:|Must keep|The instruction says)[\s\S]*?(?=\n\n|$)/gi,
        ''
      )
      .trim();
  }

  return cleaned || rawContent.trim();
}

/** @deprecated Use requestModuleAiCompletion streaming path */
export async function* streamAiCompletion(
  systemPrompt: string,
  userPrompt: string,
  settings: ApiSettings,
  _historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): AsyncIterable<string> {
  if (!isCustomKeyMode(settings)) {
    throw new Error('streamAiCompletion ใช้ได้เฉพาะ Custom API Key — credit ใช้ requestModuleAiCompletion');
  }
  if (settings.enableStreaming === false) {
    yield await customNonStream(systemPrompt, userPrompt, settings, signal);
    return;
  }
  yield* customStream(systemPrompt, userPrompt, settings, signal);
}
