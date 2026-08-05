import React, { useState, useEffect, useRef } from 'react';
import type { TarotCard } from '../../data/tarotCards';
import { TAROT_CARDS } from '../../data/tarotCards';
import type { DrawnCard, SpreadMode, SelectionMode } from '../../types/tarot';
import { getSpreadConfig } from '../../data/tarotSpreads';
import { Sparkles, RefreshCw, Crown, ChevronDown, Orbit } from 'lucide-react';
import confetti from 'canvas-confetti';

import { FanDeckView } from '../deck/FanDeckView';
import { Cut3DeckView } from '../deck/Cut3DeckView';
import { OrbitDeckView } from '../deck/OrbitDeckView';
import { MindfulHoldView } from '../deck/MindfulHoldView';
import { DeckConfirmation } from '../deck/DeckConfirmation';
import { DeckSelectionModal } from '../modals/DeckSelectionModal';

interface TarotDeckProps {
  spreadMode: SpreadMode;
  onCardsSelected: (cards: DrawnCard[], useAi: boolean, deckFilter?: 'all' | 'major' | 'minor') => void;
  isAnalyzing: boolean;
}



export const TarotDeck: React.FC<TarotDeckProps> = ({
  spreadMode,
  onCardsSelected,
  isAnalyzing
}) => {
  const spreadConfig = getSpreadConfig(spreadMode);
  const targetCount = spreadConfig.cardCount;

  const [selectionMode, setSelectionMode] = useState<SelectionMode>('manual');
  const [deckFilter, setDeckFilter] = useState<'all' | 'major' | 'minor'>('major');
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [hasStartedSelection, setHasStartedSelection] = useState<boolean>(false);
  const [useAi, setUseAi] = useState<boolean>(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [activeModal, setActiveModal] = useState<'mode' | 'filter' | null>(null);

  const isSelectionActive = selectedCards.length > 0 || hasStartedSelection;

  const getModeLabel = (mode: SelectionMode) => {
    switch (mode) {
      case 'manual': return 'คลี่ไพ่เลือกเอง';
      case 'cut3': return 'ตัดสำรับ 3 กอง';
      case 'orbit': return 'กงล้อดวงดาว 3D';
      case 'hold': return 'ตั้งจิตอธิษฐาน';
    }
  };

  const getFilterLabel = (filter: 'all' | 'major' | 'minor') => {
    switch (filter) {
      case 'major': return 'สำรับ Major (22 ใบ)';
      case 'minor': return 'สำรับ Minor (56 ใบ)';
      case 'all': return 'ทั้งสำรับ (78 ใบ)';
    }
  };

  const getFilteredCards = (filter: 'all' | 'major' | 'minor'): TarotCard[] => {
    if (filter === 'major') {
      return TAROT_CARDS.filter((c) => c.arcana === 'major' || !c.arcana);
    }
    if (filter === 'minor') {
      return TAROT_CARDS.filter((c) => c.arcana === 'minor');
    }
    return TAROT_CARDS;
  };

  const [deck, setDeck] = useState<TarotCard[]>(() => shuffleArray(getFilteredCards('major')));

  const deckContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset selection when spreadMode changes
  useEffect(() => {
    setSelectedCards([]);
    setHasStartedSelection(false);
    cardRefs.current = [];
  }, [spreadMode]);

  // Helper array shuffle
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Handle deck filter change
  const handleFilterChange = (filter: 'all' | 'major' | 'minor') => {
    if (isShuffling || isAnalyzing || isSelectionActive) return;
    setDeckFilter(filter);
    setSelectedCards([]);
    setHasStartedSelection(false);
    cardRefs.current = [];
    setDeck(shuffleArray(getFilteredCards(filter)));
  };

  // Trigger shuffle animation
  const handleShuffle = () => {
    if (isShuffling || isSelectionActive || isAnalyzing) return;
    setIsShuffling(true);

    setTimeout(() => {
      setDeck(shuffleArray(getFilteredCards(deckFilter)));
      setIsShuffling(false);
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#EAB308', '#A855F7', '#38BDF8']
        });
      } catch (e) {
        // ignore
      }
    }, 1000);
  };

  // Helper to get position name from spread config
  const getPositionName = (index: number) => {
    return spreadConfig.positions[index] || `ตำแหน่งที่ ${index + 1}`;
  };

  // Seamless Pick / Swap / Deselect card handler for manual fan deck & orbit view
  const handlePickCard = (card: TarotCard) => {
    if (!card || isShuffling || isAnalyzing) return;

    const isAlreadyPicked = selectedCards.some((sc) => sc?.card?.id === card.id);

    if (isAlreadyPicked) {
      const remaining = selectedCards.filter((sc) => sc?.card?.id !== card.id);
      const reindexed = remaining.map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx)
      }));
      setSelectedCards(reindexed);
      return;
    }

    const isReversed = Math.random() < 0.25;

    if (selectedCards.length < targetCount) {
      const newCardEntry: DrawnCard = {
        card,
        isReversed,
        position: getPositionName(selectedCards.length)
      };
      const updated = [...selectedCards, newCardEntry].map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx)
      }));
      setSelectedCards(updated);
    } else {
      const updated = [...selectedCards];
      const replaceIndex = targetCount - 1;
      updated[replaceIndex] = {
        card,
        isReversed,
        position: getPositionName(replaceIndex)
      };
      const reindexed = updated.map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx)
      }));
      setSelectedCards(reindexed);
    }
  };

  // Confirm selection and trigger reading
  const handleConfirmSelection = () => {
    if (selectedCards.length !== targetCount || isAnalyzing) return;

    const normalizedCards = selectedCards
      .filter((sc) => sc && sc.card)
      .map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx)
      }));

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#A855F7', '#38BDF8']
      });
    } catch (e) {
      // ignore
    }

    onCardsSelected(normalizedCards, useAi, deckFilter);
  };

  // Reset selection
  const handleResetSelection = () => {
    setSelectedCards([]);
    setHasStartedSelection(false);
    cardRefs.current = [];
    setDeck(shuffleArray(getFilteredCards(deckFilter)));
  };

  // Handle selection mode change without losing deckFilter
  const handleModeChange = (mode: SelectionMode) => {
    if (isShuffling || isAnalyzing || isSelectionActive) return;
    setSelectionMode(mode);
    setSelectedCards([]);
    setHasStartedSelection(false);
    cardRefs.current = [];
    setDeck(shuffleArray(getFilteredCards(deckFilter)));
  };

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center my-2 sm:my-3">

      {/* Header Controls & Status Badge Container */}
      <div className="w-full max-w-full px-3 flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-5 text-center">
        {/* Action Controls & Modal Trigger Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 relative z-20">
          {/* Mode Selector Modal Trigger Button */}
          <button
            type="button"
            disabled={isShuffling || isAnalyzing || isSelectionActive}
            onClick={() => setActiveModal('mode')}
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
            onClick={() => setActiveModal('filter')}
            title={isSelectionActive ? 'หากต้องการเปลี่ยนสำรับ ให้กดล้างเลือกใหม่ก่อน' : 'เลือกประเภทสำรับ'}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 hover:border-amber-400/80 text-amber-200 hover:text-amber-100 text-[11px] sm:text-xs font-semibold shadow-md hover:shadow-[0_0_15px_rgba(234,179,8,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{getFilterLabel(deckFilter)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </button>

          {selectionMode === 'manual' && (
            <button
              type="button"
              disabled={isShuffling || isSelectionActive || isAnalyzing}
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-[11px] sm:text-xs px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-100 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'กำลังสับ...' : 'สับไพ่'}</span>
            </button>
          )}

          {isSelectionActive && !isAnalyzing && (
            <button
              type="button"
              onClick={handleResetSelection}
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
              : `แตะเลือกไพ่สำหรับ "${spreadConfig.titleTh}" (${selectedCards.length} / ${targetCount} ใบ)`}
          </span>
        </div>
      </div>

      {/* Render Selected View Strategy */}
      {selectionMode === 'cut3' ? (
        <Cut3DeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          onPickCardsBatch={(cards) => setSelectedCards(cards)}
          getPositionName={getPositionName}
          onReset={handleResetSelection}
          onSelectionActiveChange={setHasStartedSelection}
        />
      ) : selectionMode === 'orbit' ? (
        <OrbitDeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          isShuffling={isShuffling}
          onShuffle={handleShuffle}
          onPickCard={handlePickCard}
        />
      ) : selectionMode === 'hold' ? (
        <MindfulHoldView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          onPickCardsBatch={(cards) => setSelectedCards(cards)}
          getPositionName={getPositionName}
          onReset={handleResetSelection}
        />
      ) : (
        <FanDeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isShuffling={isShuffling}
          onPickCard={handlePickCard}
          cardRefs={cardRefs}
          deckContainerRef={deckContainerRef}
        />
      )}

      {/* Confirmation Banner */}
      <DeckConfirmation
        selectedCount={selectedCards.length}
        targetCount={targetCount}
        useAi={useAi}
        setUseAi={setUseAi}
        onConfirm={handleConfirmSelection}
        isAnalyzing={isAnalyzing}
      />

      {/* Mode & Deck Filter Selection Modal */}
      <DeckSelectionModal
        isOpen={activeModal !== null}
        type={activeModal || 'mode'}
        currentMode={selectionMode}
        currentFilter={deckFilter}
        onSelectMode={(mode) => handleModeChange(mode)}
        onSelectFilter={(filter) => handleFilterChange(filter)}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
