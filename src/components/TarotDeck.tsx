import React, { useState, useEffect, useRef } from 'react';
import type { TarotCard } from '../data/tarotCards';
import { TAROT_CARDS } from '../data/tarotCards';
import type { DrawnCard, SpreadMode, SelectionMode } from '../types/tarot';
import { getSpreadConfig } from '../data/tarotSpreads';
import { Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

import { DeckModeSelector } from './deck/DeckModeSelector';
import { FanDeckView } from './deck/FanDeckView';
import { Cut3DeckView } from './deck/Cut3DeckView';
import { OrbitDeckView } from './deck/OrbitDeckView';
import { MindfulHoldView } from './deck/MindfulHoldView';
import { AutoDeckView } from './deck/AutoDeckView';
import { DeckConfirmation } from './deck/DeckConfirmation';

interface TarotDeckProps {
  spreadMode: SpreadMode;
  onCardsSelected: (cards: DrawnCard[], useAi: boolean) => void;
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
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [useAi, setUseAi] = useState<boolean>(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [deck, setDeck] = useState<TarotCard[]>(() => shuffleArray([...TAROT_CARDS]));

  const deckContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset selection when spreadMode changes
  useEffect(() => {
    setSelectedCards([]);
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

  // Trigger shuffle animation
  const handleShuffle = () => {
    if (isShuffling || selectedCards.length > 0) return;
    setIsShuffling(true);
    setTimeout(() => {
      setDeck(shuffleArray([...TAROT_CARDS]));
      setIsShuffling(false);
    }, 1200);
  };

  // Helper to get position name from spread config
  const getPositionName = (index: number) => {
    return spreadConfig.positions[index] || `ตำแหน่งที่ ${index + 1}`;
  };

  // Auto-pick mode ("ให้จักรวาลเลือกให้")
  const handleAutoPick = () => {
    if (isShuffling || isAnalyzing) return;

    setIsShuffling(true);
    setTimeout(() => {
      const indices: number[] = [];
      while (indices.length < targetCount && indices.length < deck.length) {
        const r = Math.floor(Math.random() * deck.length);
        if (!indices.includes(r)) {
          indices.push(r);
        }
      }

      const picked: DrawnCard[] = indices.map((idx, posIdx) => ({
        card: deck[idx],
        isReversed: Math.random() < 0.25,
        position: getPositionName(posIdx)
      }));

      setSelectedCards(picked);
      setIsShuffling(false);

      if (indices.length > 0) {
        const targetIdx = indices[0];
        setTimeout(() => {
          const targetEl = cardRefs.current[targetIdx];
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 100);
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8']
        });
      } catch (e) {
        // ignore
      }
    }, 700);
  };

  // Seamless Pick / Swap / Deselect card handler for manual fan deck & orbit view
  const handlePickCard = (card: TarotCard) => {
    if (isShuffling || isAnalyzing) return;

    const isAlreadyPicked = selectedCards.some((sc) => sc.card.id === card.id);

    if (isAlreadyPicked) {
      setSelectedCards((prev) => prev.filter((sc) => sc.card.id !== card.id));
      return;
    }

    const isReversed = Math.random() < 0.25;

    if (selectedCards.length < targetCount) {
      const newCardEntry: DrawnCard = {
        card,
        isReversed,
        position: getPositionName(selectedCards.length)
      };
      setSelectedCards((prev) => [...prev, newCardEntry]);
    } else {
      const updated = [...selectedCards];
      const replaceIndex = targetCount - 1;
      updated[replaceIndex] = {
        card,
        isReversed,
        position: getPositionName(replaceIndex)
      };
      setSelectedCards(updated);
    }
  };

  // Confirm selection and trigger reading
  const handleConfirmSelection = () => {
    if (selectedCards.length !== targetCount || isAnalyzing) return;

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

    onCardsSelected(selectedCards, useAi);
  };

  // Reset selection
  const handleResetSelection = () => {
    setSelectedCards([]);
    setDeck(shuffleArray([...TAROT_CARDS]));
  };

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center my-2 sm:my-4">
      
      {/* Header Badge */}
      <div className="w-full max-w-full px-2 flex flex-col items-center gap-1.5 sm:gap-2 mb-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-purple-950/80 border border-amber-400/30 text-amber-200 text-[10px] sm:text-xs font-medium shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
          <span className="leading-tight">
            {isSelectionComplete
              ? `เลือกครบแล้ว (${targetCount}/${targetCount} ใบ)! กดยืนยันด้านล่าง`
              : `เลือกไพ่สำหรับ "${spreadConfig.titleTh}" (${selectedCards.length} / ${targetCount} ใบ)`}
          </span>
        </div>

        {/* Selection Mode Switcher Tabs */}
        <DeckModeSelector
          selectionMode={selectionMode}
          onSelectMode={(mode) => {
            setSelectionMode(mode);
          }}
          disabled={isShuffling || isAnalyzing}
        />

        {/* Action Controls for Fan Deck Mode */}
        {selectionMode === 'manual' && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-0.5">
            <button
              type="button"
              disabled={isShuffling || selectedCards.length > 0 || isAnalyzing}
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-[11px] sm:text-xs px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-100 disabled:opacity-40 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'กำลังสับไพ่...' : 'สับไพ่ในสำรับ'}</span>
            </button>

            {selectedCards.length > 0 && !isAnalyzing && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="flex items-center gap-1.5 text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
              >
                <span>ล้างเลือกใหม่</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Render Selected View Strategy */}
      {selectionMode === 'auto' ? (
        <AutoDeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          isShuffling={isShuffling}
          onAutoPick={handleAutoPick}
          onReset={handleResetSelection}
        />
      ) : selectionMode === 'cut3' ? (
        <Cut3DeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          onPickCardsBatch={(cards) => setSelectedCards(cards)}
          getPositionName={getPositionName}
          onReset={handleResetSelection}
        />
      ) : selectionMode === 'orbit' ? (
        <OrbitDeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
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
    </div>
  );
};
