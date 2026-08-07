import React from 'react';
import { Compass, Briefcase, Coins, Heart, Ban } from 'lucide-react';
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
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Compass className={`w-5 h-5 ${iconColorClass} shrink-0`} aria-hidden="true" />
          <span>ทิศมงคลประจำ{dayNameTh}</span>
        </h2>
        <span className="text-xs text-slate-500">ทิศแนะนำ / ควรหลีก ตามวันในสัปดาห์</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {directions.map((dir, idx) => {
          const isAvoid = dir.category === 'avoid';
          const isWork = dir.category === 'work';
          const isWealth = dir.category === 'wealth';
          const isLove = dir.category === 'love';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-2 ${
                isAvoid
                  ? 'border-rose-900/50 bg-rose-950/10'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-semibold text-sm flex items-center gap-2 ${
                    isAvoid
                      ? 'text-rose-300'
                      : isWork
                        ? 'text-blue-300'
                        : isWealth
                          ? 'text-amber-300'
                          : 'text-pink-300'
                  }`}
                >
                  {isWork && <Briefcase className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />}
                  {isWealth && <Coins className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />}
                  {isLove && <Heart className="w-4 h-4 text-pink-400 shrink-0" aria-hidden="true" />}
                  {isAvoid && <Ban className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />}
                  <span>{dir.directionTh}</span>
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-slate-700 text-slate-400 shrink-0">
                  {dir.angle}
                </span>
              </div>
              <span className={`text-xs font-medium block ${isAvoid ? 'text-rose-400/90' : 'text-slate-400'}`}>
                {dir.energyType}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{dir.benefit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
