import React from 'react';
import { Sparkles } from 'lucide-react';
import type { LifeStagePoint } from '../types/thaiAstrology';

interface LifeStageBreakdownProps {
  lifeGraphPoints: LifeStagePoint[];
  secondaryIconColor: string;
}

export const LifeStageBreakdown: React.FC<LifeStageBreakdownProps> = ({
  lifeGraphPoints,
  secondaryIconColor,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
        <Sparkles className={`w-5 h-5 ${secondaryIconColor}`} />
        <span>เจาะลึกรายละเอียดแต่ละช่วงชีวิต</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lifeGraphPoints.map((stage, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/40 transition-all space-y-2 shadow-xs"
          >
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-800 pb-2">
              <span className="font-bold text-rose-300 text-xs sm:text-sm leading-snug">
                {stage.ageRange}: {stage.stageName}
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 whitespace-nowrap shrink-0 self-start xs:self-auto">
                คะแนนดวง {stage.score}/100
              </span>
            </div>
            <div className="text-xs text-slate-200 space-y-1">
              <p>
                <b className="text-blue-300">การงาน:</b> {stage.careerStatus}
              </p>
              <p>
                <b className="text-amber-300">การเงิน:</b> {stage.wealthStatus}
              </p>
              <p>
                <b className="text-pink-300">ความรัก:</b> {stage.loveStatus}
              </p>
            </div>
            <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/60 mt-1">
              <b>คำแนะนำ:</b> {stage.advice}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
