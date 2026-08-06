import React from 'react';
import { Compass, Briefcase, Coins, Heart, Stethoscope } from 'lucide-react';
import type { AuspiciousDirection } from '../types/fengshui';

interface FengShuiDirectionsProps {
  directions: AuspiciousDirection[];
  dayNameTh: string;
  iconColorClass: string;
}

export const FengShuiDirections: React.FC<FengShuiDirectionsProps> = ({
  directions,
  dayNameTh,
  iconColorClass,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-xl font-bold text-slate-200 flex items-start sm:items-center gap-2">
          <Compass className={`w-5 h-5 ${iconColorClass} shrink-0 mt-0.5 sm:mt-0`} />
          <span className="leading-snug">
            ทิศมงคลประจำ{dayNameTh} <span className="text-xs sm:text-sm font-normal text-slate-400 block sm:inline">(Auspicious Directions)</span>
          </span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          อัปเดตทิศมงคลและทิศกาลกิณีตามวันประจำสัปดาห์
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {directions.map((dir, idx) => {
          const isAvoid = dir.category === 'avoid';
          const isWork = dir.category === 'work';
          const isWealth = dir.category === 'wealth';
          const isLove = dir.category === 'love';

          const cardBorder = isAvoid
            ? 'border-rose-900/60 bg-rose-950/10 hover:border-rose-500/50'
            : isWork
            ? 'border-blue-500/30 hover:border-blue-400/60 bg-slate-900/80'
            : isWealth
            ? 'border-amber-500/30 hover:border-amber-400/60 bg-slate-900/80'
            : 'border-pink-500/30 hover:border-pink-400/60 bg-slate-900/80';

          const titleColor = isAvoid
            ? 'text-rose-300'
            : isWork
            ? 'text-blue-300'
            : isWealth
            ? 'text-amber-300'
            : 'text-pink-300';

          return (
            <div key={idx} className={`p-5 rounded-2xl border space-y-2.5 transition-all shadow-xs ${cardBorder}`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-base flex items-center gap-2 ${titleColor}`}>
                  {isWork && <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />}
                  {isWealth && <Coins className="w-4 h-4 text-amber-400 shrink-0" />}
                  {isLove && <Heart className="w-4 h-4 text-pink-400 shrink-0" />}
                  {isAvoid && <Stethoscope className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{dir.directionTh}</span>
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                    isAvoid ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-950 text-emerald-300 border-slate-700'
                  }`}
                >
                  {dir.angle}
                </span>
              </div>
              <span className={`text-xs font-semibold block ${isAvoid ? 'text-rose-400' : 'text-emerald-400'}`}>
                {dir.energyType}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{dir.benefit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
