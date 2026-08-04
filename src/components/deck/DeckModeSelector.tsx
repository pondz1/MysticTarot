import React from 'react';
import type { SelectionMode } from '../../types/tarot';
import { Layers, Scissors, Orbit } from 'lucide-react';

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
  const modes: { id: SelectionMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'manual', label: 'คลี่ไพ่เลือกเอง', icon: Layers },
    { id: 'cut3', label: 'ตัดสำรับ 3 กอง', icon: Scissors },
    { id: 'orbit', label: 'กงล้อ 3D', icon: Orbit },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-1 my-2">
      <div className="flex items-center justify-center p-1 rounded-xl bg-purple-950/80 border border-purple-500/40 gap-1 shadow-inner">
        {modes.map((modeItem) => {
          const Icon = modeItem.icon;
          const isSelected = selectionMode === modeItem.id;

          return (
            <button
              key={modeItem.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(modeItem.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 ${isSelected
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
                }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950 fill-slate-950' : 'text-amber-300'}`} />
              <span>{modeItem.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
