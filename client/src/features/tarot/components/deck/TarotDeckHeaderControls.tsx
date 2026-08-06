import React from 'react';
import { Orbit, Crown, ChevronDown, RefreshCw, Sparkles } from 'lucide-react';
import type { SelectionMode } from '../../types/tarot';

interface TarotDeckHeaderControlsProps {
  selectionMode: SelectionMode;
  deckFilter: 'all' | 'major' | 'minor';
  isShuffling: boolean;
  isAnalyzing: boolean;
  isSelectionActive: boolean;
  isSelectionComplete: boolean;
  selectedCount: number;
  targetCount: number;
  spreadTitleTh: string;
  getModeLabel: (mode: SelectionMode) => string;
  getFilterLabel: (filter: 'all' | 'major' | 'minor') => string;
  onOpenModal: (modal: 'mode' | 'filter') => void;
  onShuffle: () => void;
  onReset: () => void;
}

export const TarotDeckHeaderControls: React.FC<TarotDeckHeaderControlsProps> = ({
  selectionMode,
  deckFilter,
  isShuffling,
  isAnalyzing,
  isSelectionActive,
  isSelectionComplete,
  selectedCount,
  targetCount,
  spreadTitleTh,
  getModeLabel,
  getFilterLabel,
  onOpenModal,
  onShuffle,
  onReset,
}) => {
  return (
    <div className="w-full max-w-full px-3 flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-5 text-center">
      {/* Action Controls & Modal Trigger Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 relative z-20">
        {/* Mode Selector Modal Trigger Button */}
        <button
          type="button"
          disabled={isShuffling || isAnalyzing || isSelectionActive}
          onClick={() => onOpenModal('mode')}
          title={isSelectionActive ? 'หากต้องการเปลี่ยนโหมด ให้กดล้างเลือกใหม่ก่อน' : 'เลือกรูปแบบเปิดไพ่'}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 hover:border-amber-400/80 text-amber-200 hover:text-amber-100 text-[11px] sm:text-xs font-semibold shadow-md hover:shadow-[0_0_15px_rgba(234,179,8,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Orbit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{getModeLabel(selectionMode)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        </button>

        {/* Filter Selector Modal Trigger Button */}
        <button
          type="button"
          disabled={isShuffling || isAnalyzing || isSelectionActive}
          onClick={() => onOpenModal('filter')}
          title={isSelectionActive ? 'หากต้องการเปลี่ยนสำรับ ให้กดล้างเลือกใหม่ก่อน' : 'เลือกประเภทสำรับ'}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 hover:border-amber-400/80 text-amber-200 hover:text-amber-100 text-[11px] sm:text-xs font-semibold shadow-md hover:shadow-[0_0_15px_rgba(234,179,8,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{getFilterLabel(deckFilter)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        </button>

        {!isSelectionActive && (
          <button
            type="button"
            disabled={isShuffling || isAnalyzing}
            onClick={onShuffle}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-100 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'กำลังสับ...' : 'สับไพ่'}</span>
          </button>
        )}

        {isSelectionActive && !isAnalyzing && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer shadow-sm"
          >
            <span>ล้างเลือกใหม่</span>
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-purple-950/80 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-medium shadow-md">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
        <span className="leading-tight">
          {isSelectionComplete
            ? `เลือกครบแล้ว (${targetCount}/${targetCount} ใบ)! กดยืนยันด้านล่าง`
            : `แตะเลือกไพ่สำหรับ "${spreadTitleTh}" (${selectedCount} / ${targetCount} ใบ)`}
        </span>
      </div>
    </div>
  );
};
