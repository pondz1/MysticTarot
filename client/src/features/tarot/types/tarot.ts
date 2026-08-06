import type { TarotCard } from '../data/tarotCards';

export type SpreadMode = 'single' | 'three' | 'four' | 'five' | 'celtic';

export type SelectionMode = 'manual' | 'cut3' | 'orbit' | 'hold' | 'jump' | 'compass';

export interface TarotSpread {
  id: SpreadMode;
  cardCount: number;
  titleTh: string;
  titleEn: string;
  badge: string;
  description: string;
  iconName: string;
  positions: string[];
  aiGuideline?: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: string;
}

export type AiConnectionMode = 'credit' | 'custom';

export interface ApiSettings {
  mode?: AiConnectionMode;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface SavedReading {
  id: string;
  timestamp: number | string;
  question: string;
  spreadMode: SpreadMode;
  drawnCards: DrawnCard[];
  resultText: string;
  chatHistory?: ChatMessage[];
}

