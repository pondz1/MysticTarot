import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { CheckCircle2, Touchpad } from 'lucide-react';

interface FanDeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isShuffling: boolean;
  onPickCard: (card: TarotCard) => void;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  deckContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const FanDeckView: React.FC<FanDeckViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isShuffling,
  onPickCard,
  cardRefs,
  deckContainerRef,
}) => {
  const isSelectionComplete = selectedCards.length === targetCount;

  // Split 22 cards into 2 balanced rows of 11 cards
  const halfLength = Math.ceil(deck.length / 2);
  const row1 = deck.slice(0, halfLength);
  const row2 = deck.slice(halfLength);

  const renderCardRow = (rowCards: TarotCard[], startIdxOffset: number) => (
    <div className="flex justify-center items-center w-full max-w-full mx-auto my-1 sm:my-2">
      {rowCards.map((card, idx) => {
        const globalIdx = startIdxOffset + idx;
        const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

        return (
          <motion.div
            key={card.id}
            ref={(el) => {
              if (cardRefs.current) {
                cardRefs.current[globalIdx] = el;
              }
            }}
            initial={{ y: 0, rotate: 0 }}
            animate={
              isShuffling
                ? {
                    x: (Math.random() - 0.5) * 60,
                    y: (Math.random() - 0.5) * 30,
                    rotate: (Math.random() - 0.5) * 20,
                  }
                : isPicked
                ? { y: -24, scale: 1.15, rotate: 0, zIndex: 50 }
                : { y: 0, scale: 1, rotate: 0, zIndex: idx + 1 }
            }
            whileHover={{ y: -18, scale: 1.12, zIndex: 40 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => onPickCard(card)}
            style={{
              marginLeft: idx > 0 ? 'calc(-2.2vw - 6px)' : '0px',
            }}
            className={`relative w-10 xs:w-12 sm:w-20 md:w-24 h-16 xs:h-20 sm:h-32 md:h-38 rounded-lg sm:rounded-xl cursor-pointer shadow-xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none overflow-hidden shrink-0 transition-shadow duration-200 ${
              isPicked
                ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.9)]'
                : 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]'
            }`}
          >
            <img
              src="/cards/card_back.jpg"
              alt="Tarot Back"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />

            {isPicked && (
              <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 fill-slate-950 text-amber-400" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center py-2 select-none">
      {/* 2-Row Straight Overlapping Deck Display */}
      <div
        ref={deckContainerRef}
        className="relative w-full max-w-4xl flex flex-col items-center justify-center pt-8 pb-3 sm:pt-10 sm:pb-4 px-1 sm:px-4 my-2"
      >
        {renderCardRow(row1, 0)}
        {renderCardRow(row2, halfLength)}
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Touchpad className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>แตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ) • แสดงไพ่ซ้อน 2 แถวตั้งตรงเต็มหน้าจอ</span>
        </p>
      )}
    </div>
  );
};
