import React from 'react';
import { TrendingUp, Sparkles, Briefcase, Coins, Heart, ShieldCheck } from 'lucide-react';

interface NumerologyAspectBarsProps {
  aspectScores: {
    work: number;
    wealth: number;
    love: number;
    karma: number;
  };
  iconColorClass: string;
  secondaryIconColorClass: string;
}

export const NumerologyAspectBars: React.FC<NumerologyAspectBarsProps> = ({
  aspectScores,
  iconColorClass,
  secondaryIconColorClass,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/70 p-4 sm:p-6 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      <div className={`flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold ${iconColorClass}`}>
        <div className="flex items-center gap-2 min-w-0">
          <TrendingUp className={`w-4 h-4 ${iconColorClass} shrink-0`} />
          <span>ระดับคะแนนส่งเสริมดวงชะตา 4 ด้านประจำตัวเลข</span>
        </div>
        <Sparkles className={`w-4 h-4 ${secondaryIconColorClass} shrink-0 hidden sm:block`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Work */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>การงาน & สติปัญญานำพาความก้าวหน้า:</span>
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

        {/* Wealth */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>การเงิน & ทรัพย์สินมหาโชคลาภ:</span>
            </span>
            <span className="text-amber-300 font-mono">{aspectScores.wealth}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${aspectScores.wealth}%` }}
              className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Love */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-pink-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>เสน่ห์เมตตา & ความรักสมหวัง:</span>
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

        {/* Karma */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>บารมี & สิ่งศักดิ์สิทธิ์คุ้มครอง:</span>
            </span>
            <span className="text-emerald-300 font-mono">{aspectScores.karma}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${aspectScores.karma}%` }}
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
