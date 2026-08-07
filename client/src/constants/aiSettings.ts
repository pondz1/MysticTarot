import type { ApiSettings } from '../types';
import { AI_COMPLETION } from './aiCompletion';

export const DEFAULT_API_SETTINGS: ApiSettings = {
  mode: 'credit',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: AI_COMPLETION.defaultModel,
  enableStreaming: true,
};

// Preset providers for quick configuration (Custom Mode)
export const PROVIDER_PRESETS: { name: string; baseUrl: string; model: string; apiKey?: string }[] = [
  { name: 'OpenAI (Default)', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' },
  { name: 'Local Ollama', baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
];
