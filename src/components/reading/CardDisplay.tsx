import React from 'react';
import { motion } from 'framer-motion';
import type { DrawnCard } from '../../types/tarot';
import { TarotArt } from '../common/TarotArt';
import { Sparkles, Info } from 'lucide-react';

interface CardDisplayProps {
  drawnCards: DrawnCard[];
  onOpenCardDetails: (card: DrawnCard) => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ drawnCards, onOpenCardDetails }) => {
  if (drawnCards.length === 0) return null;

  // Grid layout class based on number of cards
  const getGridClass = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1 max-w-xs mx-auto';
      case 3: return 'grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto';
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto';
      case 5: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-6xl mx-auto';
      case 10: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-6xl mx-auto';
      default: return 'grid-cols-1 sm:grid-cols-3 md:grid-cols-4 max-w-5xl mx-auto';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold font-serif-mystic text-gold-gradient flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          ไพ่ยิปซีที่คุณเลือกสลักชะตา ({drawnCards.length} ใบ)
        </h2>
        <p className="text-xs text-purple-300/80 mt-1">
          แตะคลิกที่ใบไพ่เพื่ออ่านรายละเอียดไพ่แต่ละใบเพิ่มเติมได้
        </p>
      </div>

      <div className={`grid gap-4 sm:gap-6 justify-items-center ${getGridClass(drawnCards.length)}`}>
        {drawnCards.map((dCard, index) => (
          <motion.div
            key={dCard.card.id + index}
            initial={{ opacity: 0, y: 30, rotateY: 180 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: 'translateZ(0)' }}
            className="flex flex-col items-center w-full max-w-[260px] gpu-accelerated"
          >
            {/* Position Tag */}
            <div className="mb-2 px-2.5 py-1 rounded-full bg-purple-950/90 border border-amber-400/40 text-amber-200 text-[11px] font-semibold shadow-md flex items-center gap-1 text-center truncate max-w-full">
              <span className="truncate">{dCard.position}</span>
            </div>

            {/* Interactive Card Container */}
            <div
              onClick={() => onOpenCardDetails(dCard)}
              className="group relative w-full aspect-[1/1.68] cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <TarotArt card={dCard.card} isReversed={dCard.isReversed} size="full" />

              {/* Hover Overlay Hint */}
              <div className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center border border-amber-400/60 backdrop-blur-xs">
                <Info className="w-7 h-7 text-amber-300 mb-1" />
                <p className="text-xs font-bold text-amber-200">{dCard.card.nameTh}</p>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-3 px-2">
                  {dCard.isReversed ? dCard.card.reversedMeaning : dCard.card.uprightMeaning}
                </p>
                <span className="mt-2 text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded border border-amber-400/40">
                  คลิกอ่านรายละเอียด
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
