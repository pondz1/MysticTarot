import type { ChatMessage } from './ai';
import type { SpreadMode } from '../features/tarot/types/tarot';

export type HistoryCategory = 'tarot' | 'horoscope' | 'numerology' | 'thai-astrology' | 'feng-shui';

export interface SavedReading {
  id: string;
  timestamp: number | string;
  category?: HistoryCategory;
  title?: string;
  subtitle?: string;
  question?: string;
  spreadMode?: SpreadMode;
  drawnCards?: any[];
  resultText?: string;
  chatHistory?: ChatMessage[];
  meta?: Record<string, any>;
  creditsUsed?: number;
}
