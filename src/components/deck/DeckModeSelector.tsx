import React from 'react';
import type { SelectionMode } from '../../types/tarot';
import { Layers, Zap, Scissors } from 'lucide-react';

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
    { id: 'auto', label: 'ให้จักรวาลเลือก', icon: Zap },
    { id: 'cut3', label: 'ตัดสำรับ 3 กอง', icon: Scissors },
  ];

  return (
    <div className="flex items-center justify-center p-1 rounded-xl bg-purple-950/70 border border-purple-500/30 gap-1 my-2 max-w-md mx-auto shadow-inner">
      {modes.map((modeItem) => {
        const Icon = modeItem.icon;
        const isSelected = selectionMode === modeItem.id;

        return (
          <button
            key={modeItem.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMode(modeItem.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 ${
              isSelected
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950 fill-slate-950' : 'text-amber-300'}`} />
            <span>{modeItem.label}</span>
          </button>
        );
      })}
    </div>
  );
};
