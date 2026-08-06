import React from 'react';
import { Palette, Briefcase, Coins, Heart, Stethoscope } from 'lucide-react';
import type { DailyLuckyColors } from '../types/fengshui';

interface FengShuiColorGridProps {
  currentDayInfo: DailyLuckyColors;
  cardBgStyle: string;
  badgeBgStyle: string;
  iconColorClass: string;
}

export const FengShuiColorGrid: React.FC<FengShuiColorGridProps> = ({
  currentDayInfo,
  cardBgStyle,
  badgeBgStyle,
  iconColorClass,
}) => {
  return (
    <div className={`relative z-10 ${cardBgStyle} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className={`w-10 h-10 rounded-xl ${badgeBgStyle} flex items-center justify-center shadow-xs`}>
          <Palette className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-emerald-200">ตารางสีมงคลประจำ{currentDayInfo.dayNameTh}</h2>
          <p className="text-xs text-slate-400">เลือกแต่งกายด้วยสีมงคลดึงดูดพลังงานบวกในแต่ละด้าน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>การงานเลื่อนขั้น:</span>
          </span>
          <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyWork.join(', ')}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>การเงินโชคลาภ:</span>
          </span>
          <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyWealth.join(', ')}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-pink-500/30 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-pink-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>ความรักเมตตา:</span>
          </span>
          <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyLove.join(', ')}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-800/60 space-y-2 bg-rose-950/15 shadow-xs">
          <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
            <span>สีต้องห้าม/ฉุดดวง:</span>
          </span>
          <div className="text-sm font-bold text-rose-300">{currentDayInfo.unluckyForbidden.join(', ')}</div>
        </div>
      </div>
    </div>
  );
};
