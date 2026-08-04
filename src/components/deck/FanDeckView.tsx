import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { CheckCircle2, LayoutGrid } from 'lucide-react';

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
      {/* 22-Card Clean Grid Display (No Horizontal Scroll Needed) */}
      <div
        ref={deckContainerRef}
        className="w-full max-w-4xl px-2 sm:px-4 my-2"
      >
        <div className="grid grid-cols-6 xs:grid-cols-7 sm:grid-cols-11 gap-1.5 sm:gap-2.5 justify-items-center">
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
                animate={
                  isShuffling
                    ? {
                        x: (Math.random() - 0.5) * 40,
                        y: (Math.random() - 0.5) * 20,
                        rotate: (Math.random() - 0.5) * 20,
                      }
                    : isPicked
                    ? { y: -8, scale: 1.08, zIndex: 30 }
                    : { y: 0, scale: 1, zIndex: 1 }
                }
                whileHover={{ y: -6, scale: 1.06, zIndex: 20 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => onPickCard(card)}
                className={`relative w-full aspect-[2/3] max-w-[72px] sm:max-w-[88px] rounded-lg cursor-pointer shadow-md border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none overflow-hidden transition-all duration-200 ${
                  isPicked
                    ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.8)]'
                    : 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]'
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
                  <div className="absolute top-1 right-1 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950 text-amber-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <LayoutGrid className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>ตารางไพ่ 22 ใบ • แตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ)</span>
        </p>
      )}
    </div>
  );
};
