import React from 'react';
import { Award, Coins, Heart, Sparkles, ShieldCheck, Briefcase } from 'lucide-react';
import type { PairNumberAnalysis } from '../types/numerology';

interface NumerologyPairGridProps {
  pairAnalyses: PairNumberAnalysis[];
  tagBgStyle: string;
  iconColorClass: string;
}

export const NumerologyPairGrid: React.FC<NumerologyPairGridProps> = ({
  pairAnalyses,
  tagBgStyle,
  iconColorClass,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-200 flex items-center gap-2 min-w-0">
          <Award className={`w-5 h-5 ${iconColorClass} shrink-0`} />
          <span className="truncate">ถอดรหัสคู่เลขในตัวเลข ({pairAnalyses.length} คู่)</span>
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full ${tagBgStyle} font-semibold whitespace-nowrap shrink-0 self-start sm:self-auto`}>
          แยกตามหมวดพลังงาน
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {pairAnalyses.map((pairItem, index) => {
          const getCategoryStyle = (cat: string) => {
            switch (cat) {
              case 'wealth':
                return { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', card: 'hover:border-amber-400/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]', icon: Coins };
              case 'love':
                return { badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30', card: 'hover:border-pink-400/50 hover:shadow-[0_0_12px_rgba(236,72,153,0.2)]', icon: Heart };
              case 'charm':
                return { badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', card: 'hover:border-purple-400/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]', icon: Sparkles };
              case 'karma':
                return { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', card: 'hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]', icon: ShieldCheck };
              case 'caution':
                return { badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', card: 'hover:border-orange-400/50 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)]', icon: ShieldCheck };
              default:
                return { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', card: 'hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]', icon: Briefcase };
            }
          };
          const style = getCategoryStyle(pairItem.category);
          const PairIcon = style.icon;

          return (
            <div key={index} className={`p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 ${style.card} transition-all space-y-2 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg font-mono font-extrabold ${style.badge} px-2.5 py-0.5 rounded border`}>
                    {pairItem.pair}
                  </span>
                  <PairIcon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400 font-semibold">คะแนน {pairItem.score}/10</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{pairItem.meaning}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
