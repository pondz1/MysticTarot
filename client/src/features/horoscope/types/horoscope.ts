export type ZodiacSignId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type ElementType = 'fire' | 'earth' | 'air' | 'water';

export interface ZodiacSign {
  id: ZodiacSignId;
  nameTh: string;
  nameEn: string;
  symbol: string;
  dateRange: string;
  element: ElementType;
  elementTh: string;
  rulingPlanet: string;
  traits: string[];
  luckyNumber: number[];
  luckyColor: string[];
  description: string;
  image?: string;
}

export interface HoroscopePrediction {
  signId: ZodiacSignId;
  overall: string;
  love: string;
  work: string;
  finance: string;
  health: string;
  luckyTip: string;
  score: {
    love: number;
    work: number;
    finance: number;
    health: number;
  };
}
