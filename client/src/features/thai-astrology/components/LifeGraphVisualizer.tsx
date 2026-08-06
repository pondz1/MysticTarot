import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { LifeStagePoint } from '../types/thaiAstrology';

interface LifeGraphVisualizerProps {
  lifeGraphPoints: LifeStagePoint[];
  iconColorClass: string;
}

export const LifeGraphVisualizer: React.FC<LifeGraphVisualizerProps> = ({
  lifeGraphPoints,
  iconColorClass,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold text-slate-200 flex items-start sm:items-center gap-2">
        <TrendingUp className={`w-5 h-5 ${iconColorClass} shrink-0 mt-0.5 sm:mt-0`} />
        <span className="leading-snug">
          ระดับดวงชะตามุมมองกราฟชีวิต <span className="text-xs sm:text-sm font-normal text-slate-400 block sm:inline">(Life Graph Curve)</span>
        </span>
      </h3>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 sm:gap-2 pt-4">
        {lifeGraphPoints.map((stage, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 group">
            <span className="text-xs font-bold text-amber-300 font-mono">{stage.score}%</span>
            <div className="w-full bg-slate-950 h-36 rounded-xl border border-slate-800 p-1 flex items-end shadow-inner">
              <div
                style={{ height: `${stage.score}%` }}
                className={`w-full rounded-lg transition-all duration-500 ${
                  stage.score >= 80
                    ? 'bg-gradient-to-t from-rose-600 via-pink-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : stage.score >= 60
                    ? 'bg-gradient-to-t from-rose-700 to-orange-400'
                    : 'bg-gradient-to-t from-slate-700 to-rose-600'
                }`}
              />
            </div>
            <div className="text-[11px] font-semibold text-slate-300 text-center">{stage.ageRange}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
