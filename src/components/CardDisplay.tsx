import React from 'react';
import { motion } from 'framer-motion';
import type { DrawnCard } from '../services/aiService';
import { TarotArt } from './TarotArt';
import { Sparkles, Info } from 'lucide-react';

interface CardDisplayProps {
  drawnCards: DrawnCard[];
  onOpenCardDetails: (card: DrawnCard) => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ drawnCards, onOpenCardDetails }) => {
  if (drawnCards.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold font-serif-mystic text-gold-gradient flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          ไพ่ยิปซีที่คุณเลือกสลักชะตา
        </h2>
        <p className="text-xs text-purple-300/80 mt-1">
          คลิกที่ใบไพ่เพื่ออ่านรายละเอียดไพ่แต่ละใบเพิ่มเติมได้
        </p>
      </div>

      <div className={`grid gap-6 justify-items-center ${
        drawnCards.length === 1 
          ? 'grid-cols-1 max-w-xs mx-auto' 
          : 'grid-cols-1 md:grid-cols-3'
      }`}>
        {drawnCards.map((dCard, index) => (
          <motion.div
            key={dCard.card.id + index}
            initial={{ opacity: 0, y: 30, rotateY: 180 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: 'translateZ(0)' }}
            className="flex flex-col items-center w-full max-w-[280px] gpu-accelerated"
          >
            {/* Spread Position Tag */}
            <div className="mb-2 px-3 py-1 rounded-full bg-purple-950/80 border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-md flex items-center gap-1.5">
              <span>{dCard.position}</span>
            </div>

            {/* Interactive Card Container */}
            <div
              onClick={() => onOpenCardDetails(dCard)}
              className="group relative w-full h-[380px] cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <TarotArt card={dCard.card} isReversed={dCard.isReversed} size="full" />

              {/* Hover Overlay Hint */}
              <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center border border-amber-400/60 backdrop-blur-xs">
                <Info className="w-8 h-8 text-amber-300 mb-2" />
                <p className="text-xs font-bold text-amber-200">{dCard.card.nameTh}</p>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-3 px-2">
                  {dCard.isReversed ? dCard.card.reversedMeaning : dCard.card.uprightMeaning}
                </p>
                <span className="mt-3 text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded border border-amber-400/40">
                  คลิกอ่านรายละเอียดไพ่
                </span>
              </div>
            </div>

            {/* Card Footer Summary */}
            <div className="mt-3 text-center glass-panel p-2.5 rounded-lg w-full border border-amber-500/20">
              <h3 className="text-sm font-bold text-amber-200 font-serif-mystic">
                {dCard.card.nameTh}
              </h3>
              <p className="text-[11px] text-purple-300/90 mt-0.5">
                {dCard.isReversed ? '⚠️ ไพ่กลับหัว (Reversed)' : '✨ ไพ่ตั้งหัว (Upright)'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
