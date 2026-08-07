import React from 'react';
import { Palette, Briefcase, Coins, Heart, Ban } from 'lucide-react';
import type { DailyLuckyColors } from '../types/fengshui';

interface FengShuiColorGridProps {
  currentDayInfo: DailyLuckyColors;
  cardBgStyle: string;
  badgeBgStyle: string;
  iconColorClass: string;
}

export const FengShuiColorGrid: React.FC<FengShuiColorGridProps> = ({
  currentDayInfo,
  iconColorClass,
}) => {
  const cells = [
    {
      label: 'การงาน',
      value: currentDayInfo.luckyWork.join(', '),
      icon: Briefcase,
      iconClass: 'text-blue-400',
      border: 'border-slate-800',
    },
    {
      label: 'การเงิน',
      value: currentDayInfo.luckyWealth.join(', '),
      icon: Coins,
      iconClass: 'text-amber-400',
      border: 'border-slate-800',
    },
    {
      label: 'ความรัก',
      value: currentDayInfo.luckyLove.join(', '),
      icon: Heart,
      iconClass: 'text-pink-400',
      border: 'border-slate-800',
    },
    {
      label: 'สีควรหลีก',
      value: currentDayInfo.unluckyForbidden.join(', '),
      icon: Ban,
      iconClass: 'text-rose-400',
      border: 'border-rose-900/50',
    },
  ];

  return (
    <div className="rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/40 space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
          <Palette className={`w-4 h-4 ${iconColorClass}`} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            สีมงคลประจำ{currentDayInfo.dayNameTh}
          </h2>
          <p className="text-xs text-slate-500">สีแนะนำตามด้านชีวิต · ตารางอ้างอิงประจำวัน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {cells.map((cell) => {
          const Icon = cell.icon;
          return (
            <div
              key={cell.label}
              className={`p-3.5 rounded-xl bg-slate-950/70 border ${cell.border} space-y-1.5`}
            >
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${cell.iconClass}`} aria-hidden="true" />
                <span>{cell.label}</span>
              </span>
              <div className="text-sm font-semibold text-slate-200 leading-snug">{cell.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
