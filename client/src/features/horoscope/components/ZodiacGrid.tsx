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
    <div
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5"
      role="listbox"
      aria-label="เลือก 12 ราศี"
    >
      {zodiacSigns.map((sign) => {
        const isSelected = selectedSign.id === sign.id;
        const elementStyle = ELEMENT_STYLE_MAP[sign.element];
        return (
          <button
            key={sign.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={isLoading}
            onClick={() => onSelectSign(sign)}
            className={`p-2 sm:p-3 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 min-h-[96px] sm:min-h-[108px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : isSelected
                  ? `${elementStyle.activeBg} ${elementStyle.activeBorder} cursor-pointer`
                  : `${elementStyle.bg} ${elementStyle.border} text-slate-300 cursor-pointer`
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center shrink-0 relative bg-slate-950">
              <img
                src={`/zodiac/${sign.id}.png`}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden w-full h-full bg-slate-900 text-slate-400 font-serif text-xl items-center justify-center"
                aria-hidden="true"
              >
                {sign.symbol}
              </div>
            </div>
            <div
              className={`font-semibold text-xs sm:text-sm leading-tight ${
                isSelected ? elementStyle.text : 'text-slate-100'
              }`}
            >
              {sign.nameTh}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">{sign.dateRange}</div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full border mt-0.5 font-medium ${elementStyle.badgeBg}`}
            >
              {sign.elementTh}
            </span>
          </button>
        );
      })}
    </div>
  );
};
