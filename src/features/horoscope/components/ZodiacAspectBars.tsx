import React from 'react';
import { TrendingUp, Heart, Briefcase, Coins, Stethoscope } from 'lucide-react';

interface ZodiacAspectBarsProps {
  aspectScores: {
    love: number;
    work: number;
    finance: number;
    health: number;
  };
  timeframe: 'daily' | 'monthly';
  iconColorClass: string;
}

export const ZodiacAspectBars: React.FC<ZodiacAspectBarsProps> = ({
  aspectScores,
  timeframe,
  iconColorClass,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/70 p-4 sm:p-6 rounded-xl border border-slate-800/80">
      <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${iconColorClass}`}>
        <TrendingUp className={`w-4 h-4 ${iconColorClass}`} />
        <span>ระดับคะแนนดวงชะตามงคล 4 ด้าน ({timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Love */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-pink-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>ความรัก & ความสัมพันธ์:</span>
            </span>
            <span className="text-pink-300 font-mono">{aspectScores.love}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${aspectScores.love}%` }}
              className="bg-gradient-to-r from-pink-600 to-rose-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Work */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>การงาน & การเรียน:</span>
            </span>
            <span className="text-blue-300 font-mono">{aspectScores.work}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${aspectScores.work}%` }}
              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Finance */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>การเงิน & โชคลาภ:</span>
            </span>
            <span className="text-amber-300 font-mono">{aspectScores.finance}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${aspectScores.finance}%` }}
              className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Health */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-300 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>สุขภาพ & จิตใจ:</span>
            </span>
            <span className="text-emerald-300 font-mono">{aspectScores.health}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${aspectScores.health}%` }}
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
