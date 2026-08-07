import React from 'react';
import type { SpreadMode } from '../types/tarot';
import { TAROT_SPREADS } from '../data/tarotSpreads';
import { Sparkles, Compass, Layers, Heart, Crown } from 'lucide-react';

interface SpreadSelectorProps {
  mode: SpreadMode;
  onSelectMode: (mode: SpreadMode) => void;
  disabled?: boolean;
}

const RECOMMENDED_ID: SpreadMode = 'three';

export const SpreadSelector: React.FC<SpreadSelectorProps> = ({
  mode,
  onSelectMode,
  disabled = false,
}) => {
  const renderIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-purple-400/90'}`;
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className={iconClass} aria-hidden="true" />;
      case 'compass':
        return <Compass className={iconClass} aria-hidden="true" />;
      case 'layers':
        return <Layers className={iconClass} aria-hidden="true" />;
      case 'heart':
        return <Heart className={iconClass} aria-hidden="true" />;
      case 'crown':
        return <Crown className={iconClass} aria-hidden="true" />;
      default:
        return <Sparkles className={iconClass} aria-hidden="true" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-2 sm:my-3 px-2">
      <div className="flex items-center justify-between sm:justify-center gap-2 mb-2 px-1">
        <h2 className="text-xs sm:text-sm font-bold text-amber-100/95 tracking-wide">
          ขั้นตอนที่ 1 · เลือกรูปแบบการทำนาย
        </h2>
        <span className="text-[10px] text-slate-500 sm:hidden flex items-center gap-1 shrink-0">
          <span>เลื่อนดู</span>
          <span className="text-amber-400/80" aria-hidden="true">
            →
          </span>
        </span>
      </div>

      <div
        role="listbox"
        aria-label="รูปแบบการทำนายไพ่"
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible snap-x scrollbar-none p-2.5 sm:p-3 -mx-2 sm:mx-0"
      >
        {TAROT_SPREADS.map((spread) => {
          const isSelected = mode === spread.id;
          const isRecommended = spread.id === RECOMMENDED_ID;

          return (
            <button
              key={spread.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={disabled}
              onClick={() => onSelectMode(spread.id)}
              className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl text-left transition-colors duration-150 cursor-pointer disabled:opacity-50 w-[165px] xs:w-[185px] sm:w-auto shrink-0 sm:shrink snap-align-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060f] ${
                isSelected
                  ? 'bg-slate-900 border-2 border-amber-400/70'
                  : 'bg-slate-950/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 tracking-wide">
                  แนะนำ
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {renderIcon(spread.iconName, isSelected)}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-transparent text-slate-500 border-slate-700'
                    }`}
                  >
                    {spread.cardCount} ใบ
                  </span>
                </div>

                <h3
                  className={`text-xs sm:text-sm font-bold mb-0.5 truncate ${
                    isSelected ? 'text-amber-50' : 'text-slate-200'
                  }`}
                >
                  {spread.titleTh}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mb-1.5 truncate">
                  {spread.titleEn}
                </p>

                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight line-clamp-2">
                  {spread.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
