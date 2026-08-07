import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

interface AiModeToggleProps {
  useAi: boolean;
  onChange: (useAi: boolean) => void;
  disabled?: boolean;
  /** Short status line next to the control */
  statusText?: string;
  accentClassName?: string;
}

/**
 * Shared AI vs offline/standard toggle with plain-language credit hint.
 */
export const AiModeToggle: React.FC<AiModeToggleProps> = ({
  useAi,
  onChange,
  disabled = false,
  statusText,
  accentClassName = 'text-amber-400',
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
      <div className="min-w-0 text-xs sm:text-sm text-slate-400">
        <span className="font-semibold text-slate-300">โหมดคำทำนาย</span>
        {statusText && <span className="ml-1.5 text-slate-500">· {statusText}</span>}
        <p className="text-[11px] text-slate-600 mt-0.5">
          AI ใช้เครดิต · มาตรฐานฟรี อ่านได้ทันที
        </p>
      </div>

      <div
        className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0"
        role="group"
        aria-label="เลือกโหมดคำทำนาย"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          aria-pressed={useAi}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 ${
            useAi
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${useAi ? '' : accentClassName}`} aria-hidden="true" />
          <span>AI (ใช้เครดิต)</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          aria-pressed={!useAi}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 ${
            !useAi
              ? 'bg-slate-700 text-slate-50 border border-slate-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>มาตรฐาน (ฟรี)</span>
        </button>
      </div>
    </div>
  );
};
