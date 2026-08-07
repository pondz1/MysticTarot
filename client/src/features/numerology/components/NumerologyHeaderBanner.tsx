import React from 'react';
import { Hash } from 'lucide-react';
import type { PhoneAnalysisResult } from '../types/numerology';

interface NumerologyHeaderBannerProps {
  result: PhoneAnalysisResult;
  subtleGradientStyle: string;
  borderGlowStyle: string;
}

export const NumerologyHeaderBanner: React.FC<NumerologyHeaderBannerProps> = ({
  result,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
      <div className="space-y-1 text-center sm:text-left min-w-0">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
          <Hash className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span className="truncate">ผลวิเคราะห์: {result.cleanDigits}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{result.sumMeaning.title}</h2>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-slate-700 shrink-0 w-full sm:w-auto">
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block font-medium">ผลรวม</span>
          <span className="text-2xl font-black text-cyan-300 font-mono tabular-nums">
            {result.sumValue}
          </span>
        </div>
        <div className="h-8 w-px bg-slate-800" aria-hidden="true" />
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block font-medium">เกรดมงคล</span>
          <span className="text-3xl font-black text-teal-400 tabular-nums">{result.overallGrade}</span>
        </div>
      </div>
    </div>
  );
};
