import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { CheckCircle2, RefreshCw, Compass, Zap, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JumpingCardViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  onPickCardsBatch: (cards: DrawnCard[]) => void;
  getPositionName: (index: number) => string;
  onReset: () => void;
}

export const JumpingCardView: React.FC<JumpingCardViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  onPickCardsBatch,
  getPositionName,
  onReset,
}) => {
  const [isJumping, setIsJumping] = useState(false);
  const [activeJumpingCard, setActiveJumpingCard] = useState<TarotCard | null>(null);

  const isSelectionComplete = selectedCards.length === targetCount;

  // Helper for responsive tight grid classes based on card count
  const getGridConfig = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1 max-w-[140px]';
      case 2:
        return 'grid-cols-2 max-w-[270px]';
      case 3:
        return 'grid-cols-3 max-w-[360px] xs:max-w-[400px] sm:max-w-xl';
      case 4:
        return 'grid-cols-2 max-w-[280px] xs:max-w-[310px] sm:grid-cols-4 sm:max-w-3xl';
      case 5:
        return 'grid-cols-3 max-w-[360px] xs:max-w-[400px] sm:grid-cols-5 sm:max-w-4xl';
      case 6:
        return 'grid-cols-3 max-w-[360px] xs:max-w-[400px] sm:grid-cols-6 sm:max-w-5xl';
      default: // 7-10+ cards
        return 'grid-cols-3 max-w-[360px] xs:max-w-[400px] sm:grid-cols-4 md:grid-cols-5 sm:max-w-5xl';
    }
  };

  // Trigger one single card jump ritual
  const handleJumpOneCard = () => {
    if (isJumping || isAnalyzing || isSelectionComplete) return;

    setIsJumping(true);

    // Filter out already selected cards
    const existingIds = new Set(selectedCards.map((sc) => sc.card.id));
    const availableCards = deck.filter((c) => !existingIds.has(c.id));
    const pool = availableCards.length > 0 ? availableCards : deck;

    // Pick random jumping card
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    setActiveJumpingCard(randomCard);

    setTimeout(() => {
      const nextIndex = selectedCards.length;
      const newDrawnCard: DrawnCard = {
        card: randomCard,
        isReversed: Math.random() < 0.25,
        position: getPositionName(nextIndex),
      };

      const updated = [...selectedCards, newDrawnCard];
      onPickCardsBatch(updated);

      setIsJumping(false);
      setActiveJumpingCard(null);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8'],
        });
      } catch {
        // ignore
      }
    }, 850);
  };

  // Jump all remaining cards in sequence
  const handleJumpAllCards = () => {
    if (isJumping || isAnalyzing || isSelectionComplete) return;

    setIsJumping(true);

    setTimeout(() => {
      const existingIds = new Set(selectedCards.map((sc) => sc.card.id));
      const availableCards = deck.filter((c) => !existingIds.has(c.id));

      const drawnNeeded = targetCount - selectedCards.length;
      const chosenIndices: number[] = [];

      while (chosenIndices.length < drawnNeeded && chosenIndices.length < availableCards.length) {
        const r = Math.floor(Math.random() * availableCards.length);
        if (!chosenIndices.includes(r)) {
          chosenIndices.push(r);
        }
      }

      const newDrawnList: DrawnCard[] = chosenIndices.map((idx, posIdx) => ({
        card: availableCards[idx],
        isReversed: Math.random() < 0.25,
        position: getPositionName(selectedCards.length + posIdx),
      }));

      const finalBatch = [...selectedCards, ...newDrawnList];
      onPickCardsBatch(finalBatch);
      setIsJumping(false);

      try {
        confetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8'],
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  return (
    <div className="w-full flex flex-col items-center py-2 sm:py-4 select-none">
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-purple-950/70 border border-amber-400/30 text-[11px] sm:text-xs">
        <span className="flex items-center gap-1 font-bold text-amber-400">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>พิธีเสี่ยงทายไพ่กระโดด (Spirit Jumping Card Ritual)</span>
        </span>
      </div>

      {/* Title & Guidance */}
      <div className="text-center mb-3 sm:mb-4 px-4 max-w-md">
        <h3 className="text-sm sm:text-base font-bold text-gold-gradient font-serif-mystic">
          {isSelectionComplete
            ? '✨ ไพ่ประจำชะตากระโดดออกมาครบถ้วนแล้ว!'
            : `ตั้งจิตอธิษฐานแล้วสับเขย่าสำรับ ให้ไพ่กระโดดออกมา (${selectedCards.length} / ${targetCount} ใบ)`}
        </h3>
        <p className="text-xs text-purple-200/80 mt-1">
          {isSelectionComplete
            ? 'ตรวจสอบผลไพ่ประจำชะตาด้านล่าง หรือกดยืนยันเพื่ออ่านคำทำนาย'
            : '* ตามความเชื่อของไพ่ยิปซี ไพ่ที่กระโดดออกมาเองคือไพ่ที่มีคลื่นพลังงานส่งถึงคุณมากที่สุด'}
        </p>
      </div>

      {/* Interactive Shaking Deck Stage */}
      {!isSelectionComplete && (
        <div className="relative my-3 flex flex-col items-center">
          {/* Deck Visual Stack */}
          <div className="relative w-32 h-48 xs:w-36 xs:h-54 sm:w-40 sm:h-60 flex items-center justify-center">
            {/* Background Aura */}
            <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-xl animate-pulse pointer-events-none" />

            {/* Back Card Stack Layer 3 */}
            <div className="absolute inset-0 rounded-2xl border border-amber-400/30 bg-slate-900 transform translate-x-3 translate-y-3 rotate-6 opacity-60 overflow-hidden">
              <img src="/cards/card_back.webp" alt="Stack 3" className="w-full h-full object-cover rounded-2xl opacity-40" />
            </div>

            {/* Back Card Stack Layer 2 */}
            <div className="absolute inset-0 rounded-2xl border border-amber-400/50 bg-slate-900 transform translate-x-1.5 translate-y-1.5 -rotate-3 opacity-80 overflow-hidden">
              <img src="/cards/card_back.webp" alt="Stack 2" className="w-full h-full object-cover rounded-2xl opacity-60" />
            </div>

            {/* Top Deck Card */}
            <motion.div
              animate={
                isJumping
                  ? {
                    x: [-12, 12, -8, 8, 0],
                    y: [-6, 6, -6, 0],
                    rotate: [-6, 6, -3, 3, 0],
                  }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={{ duration: 0.5, repeat: isJumping ? Infinity : 0 }}
              className="absolute inset-0 rounded-2xl border-2 border-amber-400 bg-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.5)] overflow-hidden cursor-pointer"
              onClick={handleJumpOneCard}
            >
              <img src="/cards/card_back.webp" alt="Spirit Deck" className="w-full h-full object-cover rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent pointer-events-none" />

              {/* Center Glow Symbol */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2">
                <Flame className={`w-8 h-8 ${isJumping ? 'text-amber-300 animate-bounce' : 'text-amber-400'}`} />
                <span className="text-[11px] font-bold text-amber-200 text-center font-serif-mystic drop-shadow-md">
                  {isJumping ? 'กำลังเขย่าสำรับ...' : 'แตะเขย่าไพ่กระโดด'}
                </span>
              </div>
            </motion.div>

            {/* Leaping Jumping Card Animation Overlay */}
            <AnimatePresence>
              {isJumping && activeJumpingCard && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.9, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    y: [0, -180, -100, -20],
                    x: [0, 30, -30, 0],
                    rotate: [0, 180, 360, 360],
                    scale: [0.9, 1.3, 1.1, 0.9],
                  }}
                  transition={{ duration: 0.85, ease: 'easeInOut' }}
                  className="absolute z-50 inset-0 rounded-2xl border-2 border-amber-300 bg-slate-900 shadow-[0_0_40px_rgba(234,179,8,1)] overflow-hidden pointer-events-none"
                >
                  <img src="/cards/card_back.webp" alt="Leaping Card" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/40 via-purple-500/40 to-amber-300/40 mix-blend-overlay animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2.5 mt-4 sm:mt-5 pt-4 sm:pt-5">
            <button
              type="button"
              disabled={isJumping || isAnalyzing}
              onClick={handleJumpOneCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span>เขย่าไพ่กระโดด 1 ใบ</span>
            </button>

            {targetCount - selectedCards.length > 1 && (
              <button
                type="button"
                disabled={isJumping || isAnalyzing}
                onClick={handleJumpAllCards}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>เสี่ยงทายทั้งหมด</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manifested Jumping Cards Grid */}
      <AnimatePresence>
        {selectedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl px-2 my-2 flex flex-col items-center select-none"
          >
            <div className="flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-purple-950/90 border border-amber-400/50 text-xs sm:text-sm font-bold text-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ไพ่ประจำชะตาที่กระโดดออกมา ({selectedCards.length} / {targetCount} ใบ)</span>
            </div>

            {/* Manifested Cards Compact Grid */}
            <div className={`grid gap-x-2 gap-y-1.5 sm:gap-4 sm:gap-y-4 w-full justify-items-center ${getGridConfig(selectedCards.length)}`}>
              {selectedCards.map((sc, idx) => {
                const shortPosition = sc.position.split(':')[0] || `ตำแหน่งที่ ${idx + 1}`;
                const detailPosition = sc.position.includes(':') ? sc.position.split(':')[1]?.trim() : '';

                return (
                  <motion.div
                    key={sc.card.id || idx}
                    initial={{ opacity: 0, y: 25, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
                    className="relative group flex flex-col items-center max-w-[130px] xs:max-w-[145px] sm:max-w-[170px] w-full"
                  >
                    {/* Compact Hero Card Image */}
                    <div className="relative w-22 h-34 xs:w-26 xs:h-40 sm:w-32 sm:h-48 md:w-36 md:h-54 rounded-xl sm:rounded-2xl border-2 border-amber-400/80 bg-slate-900 shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] group-hover:border-amber-300 transition-all duration-300 overflow-hidden">
                      <img
                        src="/cards/card_back.webp"
                        alt={sc.card.nameTh}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent pointer-events-none" />

                      {/* Card Index Number Badge */}
                      <span className="absolute top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center shadow-md">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Compact Position Badge */}
                    <span
                      title={sc.position}
                      className="text-[10px] sm:text-xs text-amber-200 font-bold mt-1 px-2 py-0.5 rounded-md sm:rounded-lg bg-purple-950/90 border border-amber-400/40 max-w-full truncate text-center shadow-sm"
                    >
                      {shortPosition}
                    </span>

                    {/* Optional Detail Subtitle */}
                    {detailPosition && (
                      <span className="text-[9px] sm:text-[10px] text-purple-300/80 text-center mt-0.5 line-clamp-1 max-w-full px-0.5 leading-tight">
                        {detailPosition}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Action Button */}
      {selectedCards.length > 0 && !isAnalyzing && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={onReset}
          className="mt-4 flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>ทำพิธีเสี่ยงทายใหม่</span>
        </motion.button>
      )}
    </div>
  );
};
