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

  return (
    <div className="w-full flex flex-col items-center py-2 select-none">
      {/* Fan Deck Display (Fits 100% on screen - No Horizontal Scroll Needed) */}
      <div
        ref={deckContainerRef}
        className="relative w-full max-w-4xl min-h-[220px] sm:min-h-[300px] md:min-h-[360px] flex items-center justify-center overflow-visible pt-12 pb-4 sm:pt-16 sm:pb-6 px-1 sm:px-4 my-2"
      >
        <div className="flex justify-center items-center w-full max-w-full mx-auto">
          {deck.map((card, idx) => {
            const isPicked = selectedCards.some((sc) => sc.card.id === card.id);
            // Fan curve rotation: -22deg to +22deg across 22 cards
            const rotation = (idx - 10.5) * 2.1;
            // Arc vertical offset: cards at center curve downwards slightly
            const arcY = Math.abs(idx - 10.5) * 0.8;

            return (
              <motion.div
                key={card.id}
                ref={(el) => {
                  if (cardRefs.current) {
                    cardRefs.current[idx] = el;
                  }
                }}
                initial={{ y: arcY, rotate: rotation }}
                animate={
                  isShuffling
                    ? {
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 30,
                        rotate: (Math.random() - 0.5) * 30,
                      }
                    : isPicked
                    ? { y: -32, scale: 1.18, rotate: 0, zIndex: 50 }
                    : { y: arcY, rotate: rotation, zIndex: idx + 1 }
                }
                whileHover={{ y: -24, scale: 1.15, zIndex: 40 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => onPickCard(card)}
                style={{
                  transformOrigin: 'bottom center',
                  marginLeft: idx > 0 ? 'calc(-1.4vw - 4px)' : '0px',
                }}
                className={`relative w-9 xs:w-11 sm:w-18 md:w-22 lg:w-26 h-16 xs:h-20 sm:h-32 md:h-40 lg:h-46 rounded-lg sm:rounded-xl cursor-pointer shadow-xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 sm:p-1 select-none overflow-hidden shrink-0 transition-shadow duration-200 ${
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
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Touchpad className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>แตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ) • ไพ่ทุกใบคลี่แสดงพร้อมกันเต็มหน้าจอ</span>
        </p>
      )}
    </div>
  );
};
