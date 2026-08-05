export interface PairNumberAnalysis {
  pair: string; // e.g. "36"
  meaning: string;
  category: 'wealth' | 'love' | 'work' | 'charm' | 'caution' | 'karma';
  score: number; // 1 - 10
}

export interface NumerologySumMeaning {
  sum: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
  auspiciousFor: string[];
}

export interface PhoneAnalysisResult {
  inputNumber: string;
  cleanDigits: string;
  sumValue: number;
  sumMeaning: NumerologySumMeaning;
  pairAnalyses: PairNumberAnalysis[];
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  summaryText: string;
}
