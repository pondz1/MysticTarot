import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { CheckCircle2, Eye } from 'lucide-react';

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

  return (
    <div className="w-full flex flex-col items-center py-2 select-none">
      {/* Straight Overlapping Deck Ribbon Display */}
      <div
        ref={deckContainerRef}
        className="relative w-full max-w-5xl min-h-[220px] sm:min-h-[280px] md:min-h-[330px] overflow-x-auto pt-10 pb-4 sm:pt-14 sm:pb-6 md:pt-16 md:pb-8 scrollbar-none touch-pan-x"
      >
        <div className="flex justify-start items-center min-w-max px-6 sm:px-12 md:px-16 -space-x-11 xs:-space-x-10 sm:-space-x-8 md:-space-x-6 lg:-space-x-5 mx-auto">
          {deck.map((card, idx) => {
            const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

            return (
              <motion.div
                key={card.id}
                ref={(el) => {
                  if (cardRefs.current) {
                    cardRefs.current[idx] = el;
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
                    ? { y: -28, scale: 1.12, rotate: 0, zIndex: 50 }
                    : { y: 0, scale: 1, rotate: 0, zIndex: idx + 1 }
                }
                whileHover={{ y: -20, scale: 1.08, zIndex: 40 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={() => onPickCard(card)}
                className={`relative w-[68px] h-[108px] xs:w-[78px] xs:h-[122px] sm:w-[96px] sm:h-[152px] md:w-[112px] md:h-[178px] rounded-lg sm:rounded-xl cursor-pointer shadow-lg border bg-slate-900 flex flex-col items-center justify-center p-0.5 sm:p-1 text-center select-none overflow-hidden shrink-0 transition-shadow duration-200 ${
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
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>แตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ) • เลื่อนแถบไพ่ซ้าย-ขวาเพื่อเลือกไพ่ที่ต้องการ</span>
        </p>
      )}
    </div>
  );
};
