import type { TarotCard } from '../data/tarotCards';

export type SpreadMode = 'single' | 'three' | 'four' | 'five' | 'celtic';

export type SelectionMode = 'manual' | 'cut3' | 'orbit' | 'hold';

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

export interface ApiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface SavedReading {
  id: string;
  timestamp: number | string;
  question: string;
  spreadMode: SpreadMode;
  drawnCards: DrawnCard[];
  resultText: string;
}
