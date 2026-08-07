import React, { useState } from 'react';
import { Orbit, Crown, ChevronDown, ChevronUp, RefreshCw, Settings2 } from 'lucide-react';
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
  const isDefaultMode = selectionMode === 'manual' && deckFilter === 'all';
  const [showAdvanced, setShowAdvanced] = useState(!isDefaultMode);

  return (
    <div className="w-full max-w-full px-3 flex flex-col items-center gap-3 sm:gap-3.5 mb-4 sm:mb-5 text-center">
      {/* Primary status — one clear instruction */}
      <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 rounded-full bg-slate-950/90 border border-amber-400/35 text-amber-100 text-xs sm:text-sm font-medium">
        <span className="leading-tight">
          {isSelectionComplete
            ? `เลือกครบ ${targetCount} ใบแล้ว — ยืนยันด้านล่างเพื่อดูคำทำนาย`
            : `แตะเลือกไพ่${spreadTitleTh ? ` · ${spreadTitleTh}` : ''} (${selectedCount}/${targetCount})`}
        </span>
      </div>

      {/* Primary actions only */}
      <div className="flex flex-wrap items-center justify-center gap-2 relative z-20">
        {!isSelectionActive && (
          <button
            type="button"
            disabled={isShuffling || isAnalyzing}
            onClick={onShuffle}
            className="flex items-center gap-1.5 text-xs px-4 py-2 min-h-[40px] rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/45 text-amber-100 disabled:opacity-40 transition-colors cursor-pointer font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isShuffling ? 'กำลังสับ…' : 'สับไพ่'}</span>
          </button>
        )}

        {isSelectionActive && !isAnalyzing && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs px-4 py-2 min-h-[40px] rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-colors cursor-pointer font-medium"
          >
            <span>เลือกใหม่</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          disabled={isAnalyzing}
          aria-expanded={showAdvanced}
          className="flex items-center gap-1.5 text-xs px-3 py-2 min-h-[40px] rounded-xl text-slate-400 hover:text-amber-200 border border-transparent hover:border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Settings2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>ตัวเลือกขั้นสูง</span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Advanced: mode + filter — collapsed by default when using defaults */}
      {showAdvanced && (
        <div className="w-full max-w-md flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 animate-fade-in">
          <p className="text-[11px] text-slate-500 w-full text-left px-0.5">
            ค่าเริ่มต้น: คลี่ไพ่เลือกเอง · ทั้งสำรับ 78 ใบ — เปลี่ยนได้ด้านล่าง
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <button
              type="button"
              disabled={isShuffling || isAnalyzing || isSelectionActive}
              onClick={() => onOpenModal('mode')}
              title={
                isSelectionActive
                  ? 'หากต้องการเปลี่ยนโหมด ให้กดเลือกใหม่ก่อน'
                  : 'เลือกรูปแบบเปิดไพ่'
              }
              className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/40 text-slate-200 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Orbit className="w-3.5 h-3.5 text-amber-400/80 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[140px] sm:max-w-none">{getModeLabel(selectionMode)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={isShuffling || isAnalyzing || isSelectionActive}
              onClick={() => onOpenModal('filter')}
              title={
                isSelectionActive
                  ? 'หากต้องการเปลี่ยนสำรับ ให้กดเลือกใหม่ก่อน'
                  : 'เลือกประเภทสำรับ'
              }
              className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/40 text-slate-200 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400/80 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[140px] sm:max-w-none">{getFilterLabel(deckFilter)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
