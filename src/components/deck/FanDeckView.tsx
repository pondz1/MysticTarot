import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { CheckCircle2, Sparkles } from 'lucide-react';

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
    <div className="flex justify-center items-center w-full max-w-full mx-auto my-1.5 sm:my-3">
      {rowCards.map((card, idx) => {
        const globalIdx = startIdxOffset + idx;
        const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

        // Elegant gentle fan curve per 11-card row (-8deg to +8deg)
        const fanAngle = (idx - 5) * 1.6;
        const arcY = Math.abs(idx - 5) * 1.1;

        return (
          <motion.div
            key={card.id}
            ref={(el) => {
              if (cardRefs.current) {
                cardRefs.current[globalIdx] = el;
              }
            }}
            initial={{ y: arcY, rotate: fanAngle }}
            animate={
              isShuffling
                ? {
                    x: (Math.random() - 0.5) * 60,
                    y: (Math.random() - 0.5) * 30,
                    rotate: (Math.random() - 0.5) * 20,
                  }
                : isPicked
                ? { y: -30, scale: 1.18, rotate: 0, zIndex: 50 }
                : { y: [arcY, arcY - 4, arcY], rotate: fanAngle, zIndex: idx + 1 }
            }
            whileHover={{ y: -26, scale: 1.15, rotate: 0, zIndex: 45 }}
            transition={{
              duration: isShuffling ? 0.3 : 0.2,
              ease: 'easeOut',
              y: isPicked || isShuffling ? undefined : { repeat: Infinity, repeatType: 'reverse', duration: 2.8, delay: idx * 0.08 },
            }}
            onClick={() => onPickCard(card)}
            style={{
              transformOrigin: 'bottom center',
              marginLeft: idx > 0 ? 'calc(-2.5vw - 10px)' : '0px',
            }}
            className={`relative w-12 xs:w-14 sm:w-24 md:w-28 lg:w-32 h-19 xs:h-22 sm:h-38 md:h-44 lg:h-50 rounded-lg sm:rounded-xl cursor-pointer shadow-2xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none overflow-hidden shrink-0 transition-shadow duration-200 ${
              isPicked
                ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_35px_rgba(234,179,8,0.95)]'
                : 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_24px_rgba(234,179,8,0.65)]'
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
      {/* 2-Row Magical Gentle Fan Deck Display */}
      <div
        ref={deckContainerRef}
        className="relative w-full max-w-5xl md:max-w-6xl flex flex-col items-center justify-center pt-8 pb-4 sm:pt-12 sm:pb-6 px-1 sm:px-4 my-2"
      >
        {renderCardRow(row1, 0)}
        {renderCardRow(row2, halfLength)}
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>แตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ) • พัดสำรับไพ่เวทมนตร์ 2 แถวขลัง</span>
        </p>
      )}
    </div>
  );
};
