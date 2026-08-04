import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Cut3DeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  onPickCardsBatch: (cards: DrawnCard[]) => void;
  getPositionName: (index: number) => string;
  onReset: () => void;
}

const PILE_NAMES = [
  { id: 0, title: 'กองซ้าย', subtitle: 'อดีต / พลังงานแรกเริ่ม', color: 'from-amber-500/20 to-purple-900/40 border-amber-400/40' },
  { id: 1, title: 'กองกลาง', subtitle: 'ปัจจุบัน / พลังงานหลัก', color: 'from-purple-900/40 to-indigo-900/40 border-purple-400/40' },
  { id: 2, title: 'กองขวา', subtitle: 'อนาคต / พลังงานชี้นำ', color: 'from-indigo-900/40 to-amber-500/20 border-amber-400/40' },
];

export const Cut3DeckView: React.FC<Cut3DeckViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  onPickCardsBatch,
  getPositionName,
  onReset,
}) => {
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [isCutting, setIsCutting] = useState(false);

  const handleCutPile = (pileIdx: number) => {
    if (isCutting || isAnalyzing || selectedCards.length > 0) return;

    setSelectedPile(pileIdx);
    setIsCutting(true);

    setTimeout(() => {
      // Calculate offset based on pile chosen
      const offset = pileIdx * 7;
      const sliced = deck.slice(offset, offset + targetCount);
      // If sliced count < targetCount, append from start
      const finalCards = sliced.length < targetCount 
        ? [...sliced, ...deck.slice(0, targetCount - sliced.length)]
        : sliced;

      const drawn: DrawnCard[] = finalCards.map((card, idx) => ({
        card,
        isReversed: Math.random() < 0.25,
        position: getPositionName(idx)
      }));

      onPickCardsBatch(drawn);
      setIsCutting(false);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8']
        });
      } catch (e) {
        // ignore
      }
    }, 900);
  };

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center py-4">
      {/* Instructions */}
      <div className="text-center mb-4">
        <span className="text-xs text-amber-300 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>พิธีกรรมตัดสำรับไพ่ 3 กอง</span>
        </span>
        <p className="text-xs text-purple-200/80 mt-1">
          {isSelectionComplete
            ? 'ทำพิธีตัดสำรับเสร็จสิ้น! ตรวจสอบไพ่และกดยืนยันด้านล่าง'
            : 'ตั้งจิตอธิษฐานแล้วเลือกแตะ "ตัดสำรับ" ที่กองไพ่ที่คุณสัมผัสถึงพลังงาน'}
        </p>
      </div>

      {/* 3 Piles Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl w-full px-4 my-2">
        {PILE_NAMES.map((pile) => {
          const isThisPileChosen = selectedPile === pile.id && isSelectionComplete;

          return (
            <motion.div
              key={pile.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCutPile(pile.id)}
              className={`relative flex flex-col items-center p-4 rounded-2xl border bg-gradient-to-b ${pile.color} cursor-pointer transition-all duration-300 shadow-lg ${
                isThisPileChosen
                  ? 'border-2 border-amber-400 ring-2 ring-amber-300 shadow-[0_0_25px_rgba(234,179,8,0.5)]'
                  : 'hover:border-amber-400/60'
              }`}
            >
              {/* Stacked 3D Card Illusion */}
              <div className="relative w-24 h-36 mb-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/30 transform translate-x-2 translate-y-2 opacity-60 shadow-md">
                  <img src="/cards/card_back.jpg" alt="Back" className="w-full h-full object-cover rounded-xl opacity-40" />
                </div>
                <div className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/40 transform translate-x-1 translate-y-1 opacity-80 shadow-md">
                  <img src="/cards/card_back.jpg" alt="Back" className="w-full h-full object-cover rounded-xl opacity-60" />
                </div>
                <motion.div 
                  animate={isCutting && selectedPile === pile.id ? { y: [-10, 0], scale: [1.1, 1] } : {}}
                  className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/70 shadow-xl overflow-hidden"
                >
                  <img src="/cards/card_back.jpg" alt="Back" className="w-full h-full object-cover rounded-xl" />
                </motion.div>
              </div>

              <h4 className="text-sm font-bold text-amber-200 font-serif-mystic">{pile.title}</h4>
              <p className="text-[10px] text-purple-300/70 text-center mt-0.5">{pile.subtitle}</p>

              {isThisPileChosen && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ตัดสำรับจากกองนี้</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {selectedCards.length > 0 && !isAnalyzing && (
        <button
          type="button"
          onClick={() => {
            setSelectedPile(null);
            onReset();
          }}
          className="mt-3 flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
          <span>ตัดสำรับใหม่</span>
        </button>
      )}
    </div>
  );
};
