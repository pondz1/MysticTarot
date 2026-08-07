import React, { useState, useEffect, useRef } from 'react';
import type { TarotCard } from '../data/tarotCards';
import { TAROT_CARDS } from '../data/tarotCards';
import type { DrawnCard, SpreadMode, SelectionMode } from '../types/tarot';
import { getSpreadConfig } from '../data/tarotSpreads';
import confetti from 'canvas-confetti';

import { TarotDeckHeaderControls } from './deck/TarotDeckHeaderControls';
import { FanDeckView } from './deck/FanDeckView';
import { Cut3DeckView } from './deck/Cut3DeckView';
import { OrbitDeckView } from './deck/OrbitDeckView';
import { MindfulHoldView } from './deck/MindfulHoldView';
import { JumpingCardView } from './deck/JumpingCardView';
import { CompassDeckView } from './deck/CompassDeckView';
import { DeckConfirmation } from './deck/DeckConfirmation';
import { DeckSelectionModal } from '../../../components/modals/DeckSelectionModal';
import { storageService } from '../../../services/storageService';
import { prefersReducedMotion } from '../../../hooks/useModalA11y';

interface TarotDeckProps {
  spreadMode: SpreadMode;
  onCardsSelected: (cards: DrawnCard[], useAi: boolean, deckFilter?: 'all' | 'major' | 'minor') => void;
  isAnalyzing: boolean;
}

export const TarotDeck: React.FC<TarotDeckProps> = ({
  spreadMode,
  onCardsSelected,
  isAnalyzing,
}) => {
  const spreadConfig = getSpreadConfig(spreadMode);
  const targetCount = spreadConfig.cardCount;

  // Persistent preferences from localStorage
  const savedPrefs = storageService.getDeckPreferences();

  const [selectionMode, setSelectionMode] = useState<SelectionMode>(savedPrefs.selectionMode);
  const [deckFilter, setDeckFilter] = useState<'all' | 'major' | 'minor'>(savedPrefs.deckFilter);
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [hasStartedSelection, setHasStartedSelection] = useState<boolean>(false);
  const [useAi, setUseAiState] = useState<boolean>(savedPrefs.useAi);
  const [isShuffling, setIsShuffling] = useState(false);
  const [activeModal, setActiveModal] = useState<'mode' | 'filter' | null>(null);

  const setUseAi = (val: boolean) => {
    setUseAiState(val);
    storageService.saveDeckPreferences({ useAi: val });
  };

  const isSelectionActive = selectedCards.length > 0 || hasStartedSelection;

  const getModeLabel = (mode: SelectionMode) => {
    switch (mode) {
      case 'manual': return 'คลี่ไพ่เลือกเอง';
      case 'cut3': return 'ตัดสำรับ 3 กอง';
      case 'orbit': return 'กงล้อดวงดาว 3D';
      case 'hold': return 'ตั้งจิตอธิษฐาน';
      case 'jump': return 'เสี่ยงทายไพ่กระโดด';
      case 'compass': return 'เข็มทิศดวงดาว';
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

  const [deck, setDeck] = useState<TarotCard[]>(() => shuffleArray(getFilteredCards(savedPrefs.deckFilter)));

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
    storageService.saveDeckPreferences({ deckFilter: filter });
    setSelectedCards([]);
    setHasStartedSelection(false);
    cardRefs.current = [];
    setDeck(shuffleArray(getFilteredCards(filter)));
  };

  // Handle selection mode change without losing deckFilter
  const handleModeChange = (mode: SelectionMode) => {
    if (isShuffling || isAnalyzing || isSelectionActive) return;
    setSelectionMode(mode);
    storageService.saveDeckPreferences({ selectionMode: mode });
    setSelectedCards([]);
    setHasStartedSelection(false);
    cardRefs.current = [];
    setDeck(shuffleArray(getFilteredCards(deckFilter)));
  };

  // Trigger shuffle animation
  const handleShuffle = () => {
    if (isShuffling || isSelectionActive || isAnalyzing) return;
    setIsShuffling(true);

    setTimeout(() => {
      setDeck(shuffleArray(getFilteredCards(deckFilter)));
      setIsShuffling(false);
      if (!prefersReducedMotion()) {
        try {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { y: 0.65 },
            colors: ['#EAB308', '#A855F7', '#38BDF8'],
          });
        } catch {
          // ignore
        }
      }
    }, prefersReducedMotion() ? 200 : 1000);
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
        position: getPositionName(idx),
      }));
      setSelectedCards(reindexed);
      return;
    }

    const isReversed = Math.random() < 0.25;

    if (selectedCards.length < targetCount) {
      const newCardEntry: DrawnCard = {
        card,
        isReversed,
        position: getPositionName(selectedCards.length),
      };
      const updated = [...selectedCards, newCardEntry].map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx),
      }));
      setSelectedCards(updated);
    } else {
      const updated = [...selectedCards];
      const replaceIndex = targetCount - 1;
      updated[replaceIndex] = {
        card,
        isReversed,
        position: getPositionName(replaceIndex),
      };
      const reindexed = updated.map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx),
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
        position: getPositionName(idx),
      }));

    if (!prefersReducedMotion()) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8'],
        });
      } catch {
        // ignore
      }
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

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center my-2 sm:my-3">
      {/* Header Controls & Status Badge */}
      <TarotDeckHeaderControls
        selectionMode={selectionMode}
        deckFilter={deckFilter}
        isShuffling={isShuffling}
        isAnalyzing={isAnalyzing}
        isSelectionActive={isSelectionActive}
        isSelectionComplete={isSelectionComplete}
        selectedCount={selectedCards.length}
        targetCount={targetCount}
        spreadTitleTh={spreadConfig.titleTh}
        getModeLabel={getModeLabel}
        getFilterLabel={getFilterLabel}
        onOpenModal={(modal) => setActiveModal(modal)}
        onShuffle={handleShuffle}
        onReset={handleResetSelection}
      />

      {/* Render Selected View Strategy */}
      {selectionMode === 'cut3' ? (
        <Cut3DeckView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          isShuffling={isShuffling}
          onShuffle={handleShuffle}
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
      ) : selectionMode === 'jump' ? (
        <JumpingCardView
          deck={deck}
          selectedCards={selectedCards}
          targetCount={targetCount}
          isAnalyzing={isAnalyzing}
          onPickCardsBatch={(cards) => setSelectedCards(cards)}
          getPositionName={getPositionName}
          onReset={handleResetSelection}
        />
      ) : selectionMode === 'compass' ? (
        <CompassDeckView
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
