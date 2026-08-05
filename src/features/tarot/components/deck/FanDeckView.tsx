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
  const [numRows, setNumRows] = useState<number>(3);

  // Full responsive breakpoint rules: Default (Mobile), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
  useEffect(() => {
    const updateRows = () => {
      const w = window.innerWidth;
      const count = deck.length;

      if (w < 480) {
        // Compact Mobile (< 480px)
        if (count > 60) setNumRows(6);
        else if (count > 30) setNumRows(5);
        else setNumRows(3);
      } else if (w < 640) {
        // Mobile Landscape / Large Phone (480px - 639px)
        if (count > 60) setNumRows(6);
        else if (count > 30) setNumRows(4);
        else setNumRows(3);
      } else if (w < 1024) {
        // Tablet / Medium Screen (sm & md: 640px - 1023px)
        if (count > 60) setNumRows(6);
        else if (count > 30) setNumRows(4);
        else setNumRows(3);
      } else {
        // Laptop / Large Desktop / Ultra-wide (lg, xl, 2xl: >= 1024px)
        if (count > 60) setNumRows(6);
        else if (count > 30) setNumRows(5);
        else setNumRows(3);
      }
    };
    updateRows();
    window.addEventListener('resize', updateRows);
    return () => window.removeEventListener('resize', updateRows);
  }, [deck.length]);

  // Split deck into balanced rows
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
      <div className="flex justify-center items-center w-full max-w-full mx-auto my-0.5 sm:my-1 lg:my-1.5">
        {rowCards.map((card, idx) => {
          const globalIdx = startIdxOffset + idx;
          const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

          // Gentle magical fan arc calculation
          const fanAngle = (idx - midIdx) * (numRows >= 5 ? 0.7 : 1.1);
          const arcY = Math.abs(idx - midIdx) * (numRows >= 5 ? 0.4 : 0.7);

          // Negative margin tuned per row count and device tier for consistent 30% overlap
          let marginLeft = '0px';
          if (idx > 0) {
            if (numRows >= 6) marginLeft = '-14px';
            else if (numRows === 5) marginLeft = '-18px';
            else if (numRows === 4) marginLeft = '-22px';
            else marginLeft = '-28px';
          }

          // Complete Breakpoint Matrix: default (mobile), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
          const cardSizeClass =
            numRows >= 6
              ? 'w-[38px] sm:w-[48px] md:w-[54px] lg:w-[68px] xl:w-[76px] 2xl:w-[84px] h-[57px] sm:h-[72px] md:h-[81px] lg:h-[102px] xl:h-[114px] 2xl:h-[126px]'
              : numRows === 5
                ? 'w-[44px] sm:w-[56px] md:w-[62px] lg:w-[78px] xl:w-[88px] 2xl:w-[98px] h-[66px] sm:h-[84px] md:h-[93px] lg:h-[117px] xl:h-[132px] 2xl:h-[147px]'
                : numRows === 4
                  ? 'w-[50px] sm:w-[64px] md:w-[70px] lg:w-[90px] xl:w-[102px] 2xl:w-[114px] h-[75px] sm:h-[96px] md:h-[105px] lg:h-[135px] xl:h-[153px] 2xl:h-[171px]'
                  : 'w-[64px] sm:w-[84px] md:w-[90px] lg:w-[118px] xl:w-[134px] 2xl:w-[148px] h-[96px] sm:h-[126px] md:h-[135px] lg:h-[177px] xl:h-[201px] 2xl:h-[222px]';

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
                      x: globalIdx % 2 === 0 ? [0, -60, 25, 0] : [0, 60, -25, 0],
                      y: [0, -20, 8, 0],
                      rotate: globalIdx % 2 === 0 ? [0, -18, 6, 0] : [0, 18, -6, 0],
                      scale: [1, 1.1, 1.03, 1],
                      zIndex: [globalIdx + 1, 100 + (globalIdx % 10), globalIdx + 1]
                    }
                  : isPicked
                    ? { x: 0, y: -16, scale: 1.12, rotate: 0, zIndex: 50 }
                    : { x: 0, y: [arcY, arcY - 4, arcY], rotate: fanAngle, zIndex: idx + 1 }
              }
              whileHover={{ y: -14, scale: 1.14, rotate: 0, zIndex: 45 }}
              transition={{
                duration: isShuffling ? 1.0 : 0.45,
                ease: isShuffling ? [0.22, 1, 0.36, 1] : [0.16, 1, 0.3, 1],
                delay: isShuffling ? (globalIdx % 10) * 0.02 : 0,
                y: isPicked || isShuffling ? undefined : { repeat: Infinity, repeatType: 'reverse', duration: 2.6, delay: idx * 0.07 },
              }}
              onClick={() => onPickCard(card)}
              style={{
                transformOrigin: 'bottom center',
                marginLeft,
              }}
              className={`relative rounded-lg sm:rounded-xl cursor-pointer shadow-2xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none overflow-hidden shrink-0 transition-shadow duration-200 ${cardSizeClass} ${isPicked
                ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.9)] z-30'
                : 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.65)]'
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
                <div className="absolute top-1 right-1 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
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
      {/* Magical Fan Deck Display Container */}
      <div
        ref={deckContainerRef}
        className="w-full max-w-5xl sm:max-w-6xl mx-auto flex flex-col items-center justify-center pt-6 pb-4 sm:pt-8 sm:pb-6 px-1 sm:px-2 my-2 overflow-visible sm:overflow-hidden"
      >
        {deckRows.map((rowCards, rIdx) => {
          const offset = rIdx * Math.ceil(deck.length / numRows);
          return <React.Fragment key={rIdx}>{renderCardRow(rowCards, offset)}</React.Fragment>;
        })}
      </div>

      {/* Helper Text */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/80 mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/50 border border-purple-800/40 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>พัดสำรับไพ่เวทมนตร์ {numRows} แถวขลัง</span>
        </p>
      )}
    </div>
  );
};
