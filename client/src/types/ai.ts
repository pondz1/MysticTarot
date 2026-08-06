export type AiConnectionMode = 'credit' | 'custom';

export interface ApiSettings {
  mode?: AiConnectionMode;
  apiKey: string;
  baseUrl: string;
  model: string;
  enableStreaming?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}
