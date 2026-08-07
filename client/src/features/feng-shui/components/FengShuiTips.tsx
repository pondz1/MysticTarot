import React from 'react';
import { Home, CheckCircle2 } from 'lucide-react';
import type { FengShuiTip } from '../types/fengshui';

interface FengShuiTipsProps {
  tips: FengShuiTip[];
  selectedSpace: string;
  dayNameTh: string;
  iconColorClass: string;
}

export const FengShuiTips: React.FC<FengShuiTipsProps> = ({
  tips,
  selectedSpace,
  dayNameTh,
  iconColorClass,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-start sm:items-center gap-2">
          <Home className={`w-5 h-5 ${iconColorClass} shrink-0 mt-0.5 sm:mt-0`} aria-hidden="true" />
          <span className="leading-snug">
            เคล็ดลับ · {selectedSpace} · {dayNameTh}
          </span>
        </h2>
        <span className="text-xs text-slate-500">ปรับพื้นที่ตามวันและตำแหน่ง</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5"
          >
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{tip.title}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
