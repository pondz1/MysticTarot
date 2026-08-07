export const AI_MODULE_IDS = [
  'tarot',
  'tarot_followup',
  'horoscope',
  'numerology',
  'feng_shui',
  'thai_astrology',
] as const;

export type AiModuleId = (typeof AI_MODULE_IDS)[number];

export function isAiModuleId(value: unknown): value is AiModuleId {
  return typeof value === 'string' && (AI_MODULE_IDS as readonly string[]).includes(value);
}

export type BuiltPrompts = {
  systemPrompt: string;
  userPrompt: string;
};

export type TarotCardPayload = {
  position: string;
  isReversed: boolean;
  card: {
    nameTh: string;
    nameEn: string;
    keywords: string[];
    uprightMeaning: string;
    reversedMeaning: string;
    element: string;
    arcana?: string;
    suit?: string;
  };
};

export type TarotPayload = {
  question?: string;
  drawnCards: TarotCardPayload[];
  spreadMode?: string;
  deckFilter?: 'all' | 'major' | 'minor';
};

export type TarotFollowUpPayload = TarotPayload & {
  initialResult: string;
  chatHistory?: Array<{ role: string; content: string }>;
  newQuestion: string;
};

export type HoroscopePayload = {
  signNameTh: string;
  elementTh: string;
  timeframe: 'daily' | 'monthly';
};

export type NumerologyPayload = {
  digitsStr: string;
  sumValue: number;
  sumTitle: string;
  pairsSummary?: string;
};

export type FengShuiPayload = {
  dayNameTh: string;
  luckyWork: string;
  luckyWealth: string;
  luckyLove: string;
  unluckyForbidden: string;
  selectedSpace: string;
};

export type ThaiAstrologyPayload = {
  birthDate: string;
  dayOfWeekTh: string;
  elementTh: string;
  peakAgeRange: string;
  summaryGuidance: string;
};
