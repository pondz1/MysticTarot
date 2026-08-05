export interface DailyLuckyColors {
  dayNameTh: string;
  luckyWork: string[];
  luckyWealth: string[];
  luckyLove: string[];
  unluckyForbidden: string[];
}

export interface AuspiciousDirection {
  directionTh: string;
  directionEn: string;
  angle: string;
  energyType: string;
  benefit: string;
}

export interface FengShuiTip {
  category: 'home' | 'workplace' | 'bedroom' | 'wallet';
  title: string;
  description: string;
  iconName: string;
}
