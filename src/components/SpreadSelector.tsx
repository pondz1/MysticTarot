import React from 'react';
import type { SpreadMode } from '../types/tarot';
import { TAROT_SPREADS } from '../data/tarotSpreads';
import { Sparkles, Compass, Layers, Heart, Crown } from 'lucide-react';

interface SpreadSelectorProps {
  mode: SpreadMode;
  onSelectMode: (mode: SpreadMode) => void;
  disabled?: boolean;
}

export const SpreadSelector: React.FC<SpreadSelectorProps> = ({
  mode,
  onSelectMode,
  disabled = false
}) => {
  const renderIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-purple-400'}`;
    switch (iconName) {
      case 'sparkles': return <Sparkles className={iconClass} />;
      case 'compass': return <Compass className={iconClass} />;
      case 'layers': return <Layers className={iconClass} />;
      case 'heart': return <Heart className={iconClass} />;
      case 'crown': return <Crown className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-4 px-2">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">
          เลือกรูปแบบการทำนาย (Tarot Spreads)
        </span>
      </div>

      {/* Grid of 5 Spreads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {TAROT_SPREADS.map((spread) => {
          const isSelected = mode === spread.id;

          return (
            <button
              key={spread.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(spread.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-900/90 via-purple-950/90 to-slate-900 border-2 border-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-[1.02]'
                  : 'glass-panel hover:border-amber-400/40 hover:bg-purple-950/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-xl bg-purple-950/80 border border-amber-400/30">
                    {renderIcon(spread.iconName, isSelected)}
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-purple-950/60 text-amber-300/90 border-purple-500/30'
                  }`}>
                    {spread.cardCount} ใบ
                  </span>
                </div>

                <h3 className={`text-sm font-bold font-serif-mystic mb-0.5 ${
                  isSelected ? 'text-amber-200' : 'text-slate-200'
                }`}>
                  {spread.titleTh}
                </h3>
                <p className="text-[10px] text-purple-300/60 mb-2">{spread.titleEn}</p>

                <p className="text-[11px] text-slate-300/80 leading-snug line-clamp-2">
                  {spread.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-amber-400/30 text-[10px] text-amber-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>กำลังใช้งานสเปรดนี้</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
