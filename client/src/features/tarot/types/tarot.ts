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

// Re-export common platform types for backward compatibility
export type {
  AiConnectionMode,
  ApiSettings,
  ChatMessage,
  HistoryCategory,
  SavedReading,
} from '../../../types';
