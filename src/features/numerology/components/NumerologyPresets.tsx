import React from 'react';

export interface SampleNumberItem {
  label: string;
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'phone' | 'car' | 'house' | 'card';
}

interface NumerologyPresetsProps {
  sampleNumbers: SampleNumberItem[];
  onSelectSample: (num: string, type: 'phone' | 'car' | 'house' | 'card') => void;
}

export const NumerologyPresets: React.FC<NumerologyPresetsProps> = ({
  sampleNumbers,
  onSelectSample,
}) => {
  return (
    <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
      {sampleNumbers.map((s, idx) => {
        const IconComp = s.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSample(s.number, s.type)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-teal-400 text-cyan-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <IconComp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{s.label}</span>
            <span className="font-mono text-teal-300">({s.number})</span>
          </button>
        );
      })}
    </div>
  );
};
