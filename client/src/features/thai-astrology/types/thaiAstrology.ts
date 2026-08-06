export interface LifeStagePoint {
  ageRange: string; // e.g. "1-10 ปี", "11-20 ปี"
  stageName: string;
  score: number; // 10 - 100
  careerStatus: string;
  wealthStatus: string;
  loveStatus: string;
  advice: string;
}

export interface ThaiLifeChartResult {
  birthDate: string;
  dayOfWeekTh: string;
  elementTh: string;
  lifeGraphPoints: LifeStagePoint[];
  peakAgeRange: string;
  dominantAspect: string;
  summaryGuidance: string;
}
