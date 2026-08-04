import React from 'react';
import { Layers, Sparkle } from 'lucide-react';

interface SpreadSelectorProps {
  mode: 'single' | 'three';
  onSelectMode: (mode: 'single' | 'three') => void;
  disabled?: boolean;
}

export const SpreadSelector: React.FC<SpreadSelectorProps> = ({ mode, onSelectMode, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto my-4">
      <label className="text-xs uppercase tracking-widest font-semibold text-purple-300 flex items-center gap-1.5">
        <Sparkle className="w-3.5 h-3.5 text-amber-400" />
        เลือกรูปแบบการเปิดไพ่ยิปซี
      </label>
      
      <div className="grid grid-cols-2 gap-3 w-full p-1.5 rounded-xl glass-panel border border-amber-500/30">
        
        {/* Single Card Mode */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMode('single')}
          className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-lg transition-all text-center ${
            mode === 'single'
              ? 'bg-gradient-to-br from-amber-600/90 to-purple-900/90 text-amber-100 border border-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.25)] font-bold'
              : 'bg-black/30 text-purple-200/70 hover:bg-purple-900/40 hover:text-purple-100 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🃏</span>
            <span className="font-serif-mystic text-sm md:text-base">เลือกไพ่ 1 ใบ</span>
          </div>
          <p className="text-[11px] font-normal opacity-85">
            สรุปภาพรวม / ดวงรายวัน / คำตอบฉับไว
          </p>
          {mode === 'single' && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-amber-400 border border-amber-200 shadow-sm" />
          )}
        </button>

        {/* 3 Cards Mode */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMode('three')}
          className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-lg transition-all text-center ${
            mode === 'three'
              ? 'bg-gradient-to-br from-amber-600/90 to-purple-900/90 text-amber-100 border border-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.25)] font-bold'
              : 'bg-black/30 text-purple-200/70 hover:bg-purple-900/40 hover:text-purple-100 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="flex -space-x-1">
              <Layers className="w-5 h-5 text-amber-300" />
            </div>
            <span className="font-serif-mystic text-sm md:text-base">เลือกไพ่ 3 ใบ</span>
          </div>
          <p className="text-[11px] font-normal opacity-85">
            อดีต - ปัจจุบัน - อนาคต / วิเคราะห์เชิงลึก
          </p>
          {mode === 'three' && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-amber-400 border border-amber-200 shadow-sm" />
          )}
        </button>

      </div>
    </div>
  );
};
