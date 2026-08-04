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
    <div className="w-full flex flex-col items-center">
      {/* Fan Deck Display */}
      <div
        ref={deckContainerRef}
        className="relative w-full min-h-[220px] sm:min-h-[290px] md:min-h-[340px] overflow-x-auto pt-10 pb-2 sm:pt-14 sm:pb-4 md:pt-16 md:pb-6 scrollbar-none touch-pan-x"
      >
        <div className="flex justify-start items-center min-w-max px-8 sm:px-16 md:px-24 -space-x-12 sm:-space-x-10 md:-space-x-8 lg:-space-x-7 mx-auto">
          {deck.map((card, idx) => {
            const isPicked = selectedCards.some((sc) => sc.card.id === card.id);
            const rotation = (idx - 10) * 2.2;

            return (
              <motion.div
                key={card.id}
                ref={(el) => {
                  if (cardRefs.current) {
                    cardRefs.current[idx] = el;
                  }
                }}
                initial={{ y: 0, rotate: rotation }}
                animate={
                  isShuffling
                    ? {
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 30,
                        rotate: (Math.random() - 0.5) * 30,
                      }
                    : isPicked
                    ? { y: -24, scale: 1.08, rotate: 0, zIndex: 40 }
                    : { y: 0, rotate: rotation, zIndex: 1 }
                }
                whileHover={{ y: -16, scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => onPickCard(card)}
                style={{ transform: 'translateZ(0)' }}
                className={`relative w-20 h-32 sm:w-28 sm:h-44 md:w-32 md:h-52 rounded-xl cursor-pointer shadow-lg border bg-slate-900 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center select-none gpu-accelerated overflow-hidden ${
                  isPicked
                    ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.8)]'
                    : 'border-amber-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
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
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-amber-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>แตะเลือกไพ่ ({selectedCards.length} / {targetCount}) • เลื่อนซ้าย-ขวาเพื่อดูไพ่เพิ่ม</span>
        </p>
      )}
    </div>
  );
};
