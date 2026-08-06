import React from 'react';
import type { ZodiacSign } from '../types/horoscope';
import { ELEMENT_STYLE_MAP } from '../data/zodiacData';

interface ZodiacGridProps {
  zodiacSigns: ZodiacSign[];
  selectedSign: ZodiacSign;
  onSelectSign: (sign: ZodiacSign) => void;
  isLoading: boolean;
}

export const ZodiacGrid: React.FC<ZodiacGridProps> = ({
  zodiacSigns,
  selectedSign,
  onSelectSign,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
      {zodiacSigns.map((sign) => {
        const isSelected = selectedSign.id === sign.id;
        const elementStyle = ELEMENT_STYLE_MAP[sign.element];
        return (
          <button
            key={sign.id}
            disabled={isLoading}
            onClick={() => onSelectSign(sign)}
            className={`p-2 sm:p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-1 sm:gap-1.5 group ${
              isLoading
                ? 'opacity-60 cursor-not-allowed'
                : isSelected
                  ? `${elementStyle.activeBg} ${elementStyle.activeBorder} ${elementStyle.glow} scale-105 shadow-xl cursor-pointer`
                  : `${elementStyle.bg} ${elementStyle.border} text-slate-300 cursor-pointer`
            }`}
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-purple-400/50 shadow-lg shadow-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 relative bg-slate-950">
              <img
                src={`/zodiac/${sign.id}.png`}
                alt={sign.nameTh}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-600/30 text-purple-300 font-serif text-2xl items-center justify-center">
                {sign.symbol}
              </div>
            </div>
            <div className={`font-bold text-xs sm:text-sm ${isSelected ? elementStyle.text : 'text-slate-100'}`}>
              {sign.nameTh}
            </div>
            <div className="text-[10px] text-slate-400">{sign.dateRange}</div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border mt-0.5 font-medium ${elementStyle.badgeBg}`}>
              {sign.elementTh}
            </span>
          </button>
        );
      })}
    </div>
  );
};
