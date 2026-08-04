import React, { useState, useEffect } from 'react';
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
  const [numRows, setNumRows] = useState<number>(2);

  // Responsive rows: 3 rows on mobile (< 640px), 2 rows on tablet/desktop (>= 640px)
  useEffect(() => {
    const updateRows = () => {
      if (window.innerWidth < 640) {
        setNumRows(3);
      } else {
        setNumRows(2);
      }
    };
    updateRows();
    window.addEventListener('resize', updateRows);
    return () => window.removeEventListener('resize', updateRows);
  }, []);

  // Split deck into numRows balanced rows
  const getDeckRows = () => {
    const rows: TarotCard[][] = [];
    const perRow = Math.ceil(deck.length / numRows);
    for (let i = 0; i < numRows; i++) {
      const start = i * perRow;
      const end = i === numRows - 1 ? deck.length : start + perRow;
      rows.push(deck.slice(start, end));
    }
    return rows;
  };

  const deckRows = getDeckRows();

  const renderCardRow = (rowCards: TarotCard[], startIdxOffset: number) => {
    const midIdx = (rowCards.length - 1) / 2;

    return (
      <div className="flex justify-center items-center w-full max-w-full mx-auto my-1 sm:my-2.5">
        {rowCards.map((card, idx) => {
          const globalIdx = startIdxOffset + idx;
          const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

          // Gentle fan curve per row
          const fanAngle = (idx - midIdx) * 1.8;
          const arcY = Math.abs(idx - midIdx) * 1.2;

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
                  ? { y: -28, scale: 1.18, rotate: 0, zIndex: 50 }
                  : { y: [arcY, arcY - 4, arcY], rotate: fanAngle, zIndex: idx + 1 }
              }
              whileHover={{ y: -22, scale: 1.15, rotate: 0, zIndex: 45 }}
              transition={{
                duration: isShuffling ? 0.3 : 0.2,
                ease: 'easeOut',
                y: isPicked || isShuffling ? undefined : { repeat: Infinity, repeatType: 'reverse', duration: 2.8, delay: idx * 0.08 },
              }}
              onClick={() => onPickCard(card)}
              style={{
                transformOrigin: 'bottom center',
                marginLeft: idx > 0 ? (numRows === 3 ? 'calc(-3.2vw - 8px)' : 'calc(-2.4vw - 10px)') : '0px',
              }}
              className={`relative rounded-lg sm:rounded-xl cursor-pointer shadow-2xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none overflow-hidden shrink-0 transition-shadow duration-200 ${
                numRows === 3
                  ? 'w-14 xs:w-16 sm:w-22 md:w-26 h-22 xs:h-26 sm:h-34 md:h-40'
                  : 'w-12 xs:w-14 sm:w-24 md:w-28 lg:w-32 h-19 xs:h-22 sm:h-38 md:h-44 lg:h-50'
              } ${
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
  };

  return (
    <div className="w-full flex flex-col items-center py-2 select-none">
      {/* Responsive Multi-Row Magical Fan Deck Display */}
      <div
        ref={deckContainerRef}
        className="relative w-full max-w-5xl md:max-w-6xl flex flex-col items-center justify-center pt-6 pb-4 sm:pt-10 sm:pb-6 px-1 sm:px-4 my-2"
      >
        {deckRows.map((rowCards, rIdx) => {
          const offset = rIdx * Math.ceil(deck.length / numRows);
          return <React.Fragment key={rIdx}>{renderCardRow(rowCards, offset)}</React.Fragment>;
        })}
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>แตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ) • พัดสำรับไพ่เวทมนตร์ {numRows} แถวขลัง</span>
        </p>
      )}
    </div>
  );
};
