import React from 'react';
import type { SelectionMode } from '../../types/tarot';
import { Layers, Zap, Scissors, Orbit, Sparkles } from 'lucide-react';

interface DeckModeSelectorProps {
  selectionMode: SelectionMode;
  onSelectMode: (mode: SelectionMode) => void;
  disabled?: boolean;
}

export const DeckModeSelector: React.FC<DeckModeSelectorProps> = ({
  selectionMode,
  onSelectMode,
  disabled = false
}) => {
  const modes: { id: SelectionMode; label: string; mobileLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'manual', label: 'คลี่ไพ่เลือกเอง', mobileLabel: 'คลี่เลือกเอง', icon: Layers },
    { id: 'auto', label: 'ให้จักรวาลเลือก', mobileLabel: 'จักรวาลเลือก', icon: Zap },
    { id: 'cut3', label: 'ตัดสำรับ 3 กอง', mobileLabel: 'ตัด 3 กอง', icon: Scissors },
    { id: 'orbit', label: 'กงล้อ 3D', mobileLabel: 'กงล้อ 3D', icon: Orbit },
    { id: 'hold', label: 'ตั้งจิตอธิษฐาน', mobileLabel: 'ตั้งจิต', icon: Sparkles },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-2 my-2">
      {/* 5-Tab Segmented Bar */}
      <div className="grid grid-cols-5 p-1 rounded-2xl bg-purple-950/80 backdrop-blur-md border border-purple-500/40 gap-0.5 sm:gap-1 shadow-lg">
        {modes.map((modeItem) => {
          const Icon = modeItem.icon;
          const isSelected = selectionMode === modeItem.id;

          return (
            <button
              key={modeItem.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(modeItem.id)}
              aria-label={`โหมดเปิดไพ่: ${modeItem.label}`}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-0.5 sm:px-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 text-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950 fill-slate-950' : 'text-amber-300'}`} />
              <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs truncate font-medium">
                <span className="inline sm:hidden">{modeItem.mobileLabel}</span>
                <span className="hidden sm:inline">{modeItem.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
