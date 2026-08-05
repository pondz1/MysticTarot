import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Sparkles, CheckCircle2, RefreshCw, Zap, Hand, Compass, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FanDeckView } from './FanDeckView';

interface Cut3DeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  isShuffling?: boolean;
  onShuffle?: () => void;
  onPickCardsBatch: (cards: DrawnCard[]) => void;
  getPositionName: (index: number) => string;
  onReset: () => void;
  onSelectionActiveChange?: (active: boolean) => void;
}

const PILE_NAMES = [
  {
    id: 0,
    title: 'กองพลังงานเบื้องบน',
    subtitle: 'ส่วนบนของสำรับ • หยั่งรู้จิตใต้สำนึก',
    badge: 'Upper Energy',
    color: 'from-purple-900/50 via-indigo-950/80 to-slate-950 border-purple-400/50 shadow-purple-900/30',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    id: 1,
    title: 'กองพลังงานแก่นแท้',
    subtitle: 'ส่วนกลางของสำรับ • สะท้อนสถานการณ์หลัก',
    badge: 'Core Energy',
    color: 'from-amber-900/40 via-purple-950/80 to-slate-950 border-amber-400/60 shadow-amber-900/40',
    glowColor: 'rgba(234, 179, 8, 0.45)',
  },
  {
    id: 2,
    title: 'กองพลังงานหยั่งรู้',
    subtitle: 'ส่วนล่างของสำรับ • ชี้นำทิศทางอนาคต',
    badge: 'Deep Energy',
    color: 'from-indigo-900/50 via-purple-950/80 to-slate-950 border-indigo-400/50 shadow-indigo-900/30',
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
];

export const Cut3DeckView: React.FC<Cut3DeckViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  isShuffling = false,
  onShuffle,
  onPickCardsBatch,
  getPositionName,
  onReset,
  onSelectionActiveChange,
}) => {
  const [subMode, setSubMode] = useState<'auto' | 'manual'>('auto');
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [isCutting, setIsCutting] = useState(false);

  const manualCardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const manualDeckContainerRef = React.useRef<HTMLDivElement | null>(null);

  const isSelectionComplete = selectedCards.length === targetCount;

  // Notify parent of active selection state
  React.useEffect(() => {
    const active = selectedPile !== null || isCutting || selectedCards.length > 0;
    onSelectionActiveChange?.(active);
  }, [selectedPile, isCutting, selectedCards.length, onSelectionActiveChange]);

  // Reset selected pile state when selected cards are cleared externally or deck is reset
  React.useEffect(() => {
    if (selectedCards.length === 0) {
      setSelectedPile(null);
      setIsCutting(false);
    }
  }, [deck, selectedCards.length]);

  // Get subset of deck for chosen pile
  const getPileCards = (pileIdx: number): TarotCard[] => {
    const sectionSize = Math.floor(deck.length / 3);
    const start = pileIdx * sectionSize;
    const end = pileIdx === 2 ? deck.length : start + sectionSize;
    return deck.slice(start, end);
  };

  // Restack deck starting with the chosen pile on top, followed by remaining piles in order
  const getRestackedDeckFromPile = (pileIdx: number): TarotCard[] => {
    const pile0 = getPileCards(0);
    const pile1 = getPileCards(1);
    const pile2 = getPileCards(2);

    if (pileIdx === 0) return [...pile0, ...pile1, ...pile2];
    if (pileIdx === 1) return [...pile1, ...pile2, ...pile0];
    return [...pile2, ...pile0, ...pile1];
  };

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

  const handleCutPile = (pileIdx: number) => {
    if (isCutting || isAnalyzing || selectedCards.length > 0) return;

    setSelectedPile(pileIdx);

    if (subMode === 'auto') {
      setIsCutting(true);
      setTimeout(() => {
        const restacked = getRestackedDeckFromPile(pileIdx);
        const finalCards = restacked.slice(0, targetCount);

        const drawn: DrawnCard[] = finalCards.map((card, idx) => ({
          card,
          isReversed: Math.random() < 0.25,
          position: getPositionName(idx),
        }));

        onPickCardsBatch(drawn);
        setIsCutting(false);

        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#EAB308', '#A855F7', '#38BDF8'],
          });
        } catch (e) {
          // ignore
        }
      }, 850);
    }
  };

  const handleManualPickFromPile = (card: TarotCard) => {
    if (isAnalyzing || isSelectionComplete) return;

    const isAlreadyPicked = selectedCards.some((sc) => sc.card.id === card.id);
    if (isAlreadyPicked) {
      const remaining = selectedCards.filter((sc) => sc.card.id !== card.id);
      const reindexed = remaining.map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx),
      }));
      onPickCardsBatch(reindexed);
      return;
    }

    if (selectedCards.length < targetCount) {
      const newDrawn: DrawnCard = {
        card,
        isReversed: Math.random() < 0.25,
        position: getPositionName(selectedCards.length),
      };
      const updated = [...selectedCards, newDrawn].map((sc, idx) => ({
        ...sc,
        position: getPositionName(idx),
      }));
      onPickCardsBatch(updated);

      if (updated.length === targetCount) {
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#EAB308', '#A855F7', '#38BDF8'],
          });
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const handleResetCut = () => {
    setSelectedPile(null);
    onReset();
  };

  return (
    <div className="w-full flex flex-col items-center py-2 sm:py-4 select-none">
      {/* Step Indicator Header */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-purple-950/70 border border-amber-400/30 text-[11px] sm:text-xs">
        <span className="flex items-center gap-1 font-bold text-amber-400">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>โหมดตัดไพ่ 3 กอง ({subMode === 'auto' ? 'ระบบตัดอัตโนมัติ' : 'เลือกเปิดเอง'})</span>
        </span>
      </div>

      {/* Mode Sub-Selector Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b081d]/90 border border-purple-500/40 shadow-inner mb-3 max-w-xs w-full justify-center">
        <button
          type="button"
          onClick={() => {
            setSubMode('auto');
            handleResetCut();
          }}
          className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            subMode === 'auto'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span>ตัดอัตโนมัติ</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubMode('manual');
            handleResetCut();
          }}
          className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            subMode === 'manual'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          <Hand className="w-3.5 h-3.5 shrink-0" />
          <span>เลือกเปิดเอง</span>
        </button>
      </div>

      {/* Submode instructions & Shuffle Action */}
      <div className="text-center mb-3 sm:mb-4 px-4 max-w-md">
        <h3 className="text-sm sm:text-base font-bold text-gold-gradient font-serif-mystic">
          {selectedPile !== null && isSelectionComplete
            ? `ทำพิธีตัดสำรับเรียบร้อยจาก ${PILE_NAMES[selectedPile].title}`
            : selectedPile !== null
            ? `กำลังเลือกไพ่จาก ${PILE_NAMES[selectedPile].title}`
            : subMode === 'auto'
            ? 'เลือก 1 ใน 3 กองด้านล่าง เพื่อให้ระบบเปิดไพ่ประจำชะตา'
            : 'เลือก 1 ใน 3 กองด้านล่าง แล้วคลี่ไพ่ขึ้นมาเลือกเปิดด้วยตัวเอง'}
        </h3>

        {/* Shuffle Button */}
        {selectedPile === null && onShuffle && (
          <button
            type="button"
            disabled={isShuffling || isCutting || isAnalyzing}
            onClick={onShuffle}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-medium transition-all cursor-pointer shadow-sm hover:scale-105"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'กำลังสับไพ่และจัดกองใหม่...' : 'สับไพ่ใหม่ (สุ่มกองใหม่)'}</span>
          </button>
        )}
      </div>

      {/* 3D Piles Display with Flying Cards Ritual */}
      {(selectedPile === null || (subMode === 'auto' && !isSelectionComplete)) && (
        <div className="relative max-w-3xl w-full px-4 my-2">
          {/* Flying Cards Arc Animations during isShuffling */}
          {isShuffling && (
            <div className="absolute inset-0 pointer-events-none z-40 overflow-visible flex items-center justify-center">
              {/* Flying Card 1: Left to Right Parabolic Arc */}
              <motion.div
                initial={{ opacity: 0, x: -140, y: 0, scale: 0.8, rotate: -20 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  x: [-180, -90, 0, 90, 180],
                  y: [10, -70, -110, -70, 10],
                  rotate: [-30, -10, 90, 190, 210],
                  scale: [0.8, 1.15, 1.3, 1.15, 0.8],
                }}
                transition={{
                  duration: 0.75,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 0.05,
                }}
                className="absolute w-14 h-22 sm:w-18 sm:h-26 rounded-xl border border-amber-400/80 bg-slate-900 shadow-[0_0_25px_rgba(234,179,8,0.9)] overflow-hidden"
              >
                <img src="/cards/card_back.jpg" alt="Flying Card Left" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-amber-400/20 mix-blend-overlay animate-pulse" />
              </motion.div>

              {/* Flying Card 2: Right to Left Parabolic Arc */}
              <motion.div
                initial={{ opacity: 0, x: 140, y: 0, scale: 0.8, rotate: 20 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  x: [180, 90, 0, -90, -180],
                  y: [10, -80, -120, -80, 10],
                  rotate: [30, 10, -90, -190, -210],
                  scale: [0.8, 1.15, 1.3, 1.15, 0.8],
                }}
                transition={{
                  duration: 0.75,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: 0.25,
                  repeatDelay: 0.05,
                }}
                className="absolute w-14 h-22 sm:w-18 sm:h-26 rounded-xl border border-purple-400/80 bg-slate-900 shadow-[0_0_25px_rgba(168,85,247,0.9)] overflow-hidden"
              >
                <img src="/cards/card_back.jpg" alt="Flying Card Right" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-purple-400/20 mix-blend-overlay animate-pulse" />
              </motion.div>

              {/* Flying Card 3: Center Vertical Leap & Spin */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [20, -130, 20],
                  rotate: [0, 180, 360],
                  scale: [0.9, 1.25, 0.9],
                }}
                transition={{
                  duration: 0.65,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: 0.4,
                  repeatDelay: 0.1,
                }}
                className="absolute w-14 h-22 sm:w-18 sm:h-26 rounded-xl border border-amber-300 bg-slate-900 shadow-[0_0_30px_rgba(234,179,8,1)] overflow-hidden"
              >
                <img src="/cards/card_back.jpg" alt="Flying Card Center" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-purple-500/30 to-amber-300/30 mix-blend-overlay animate-pulse" />
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 w-full">
          {PILE_NAMES.map((pile) => {
            const isThisPileSelected = selectedPile === pile.id;
            const isCuttingThisPile = isCutting && isThisPileSelected;

            return (
              <motion.div
                key={pile.id}
                role="button"
                tabIndex={0}
                aria-label={`เลือกตัดสำรับ ${pile.title} (${pile.subtitle})`}
                whileHover={isShuffling ? {} : { y: -8, scale: 1.03 }}
                whileTap={isShuffling ? {} : { scale: 0.96 }}
                animate={
                  isShuffling
                    ? {
                        x: pile.id === 0 ? [-18, 18, -10, 10, 0] : pile.id === 2 ? [18, -18, 10, -10, 0] : [0, -8, 8, 0],
                        y: pile.id === 1 ? [-12, 12, -6, 6, 0] : [0, -6, 6, 0],
                        rotate: pile.id === 0 ? [-6, 6, -3, 3, 0] : pile.id === 2 ? [6, -6, 3, -3, 0] : [-4, 4, -2, 2, 0],
                        scale: [1, 1.05, 0.96, 1.03, 1],
                      }
                    : { x: 0, y: 0, rotate: 0, scale: 1 }
                }
                transition={
                  isShuffling
                    ? { duration: 0.8, ease: 'easeInOut', repeat: Infinity }
                    : { duration: 0.4, ease: 'easeOut' }
                }
                onClick={() => handleCutPile(pile.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCutPile(pile.id);
                  }
                }}
                className={`relative group flex flex-col items-center p-4 sm:p-5 rounded-3xl border bg-gradient-to-b ${pile.color} cursor-pointer transition-all duration-300 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-400 overflow-hidden ${
                  isThisPileSelected
                    ? 'border-2 border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_35px_rgba(234,179,8,0.6)] scale-[1.03]'
                    : 'hover:border-amber-400/80 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
                }`}
              >
                {/* Mystic Aura Glow Background */}
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${pile.glowColor} 0%, transparent 70%)`,
                  }}
                />

                {/* Badge Header */}
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950/80 text-amber-300 border border-amber-400/30 mb-3 z-10">
                  {pile.badge}
                </span>

                {/* 3D Layered Card Stack Effect */}
                <div className="relative w-24 h-36 sm:w-28 sm:h-40 mb-4 flex items-center justify-center z-10 perspective-500">
                  {/* Card Layer 3 (Bottom) */}
                  <motion.div
                    animate={
                      isShuffling
                        ? { x: [12, -8, 12], rotate: [10, -5, 10] }
                        : { x: 0, y: 0, rotate: 0 }
                    }
                    transition={
                      isShuffling
                        ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.4, ease: 'easeOut' }
                    }
                    className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/30 transform translate-x-3 translate-y-3 rotate-[5deg] opacity-50 shadow-md group-hover:translate-x-4 group-hover:translate-y-4 group-hover:rotate-[7deg] transition-transform duration-300"
                  >
                    <img
                      src="/cards/card_back.jpg"
                      alt="Back Layer 3"
                      className="w-full h-full object-cover rounded-xl opacity-30"
                    />
                  </motion.div>

                  {/* Card Layer 2 (Middle) */}
                  <motion.div
                    animate={
                      isShuffling
                        ? { x: [-10, 10, -10], rotate: [-8, 6, -8] }
                        : { x: 0, y: 0, rotate: 0 }
                    }
                    transition={
                      isShuffling
                        ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.4, ease: 'easeOut' }
                    }
                    className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/40 transform translate-x-1.5 translate-y-1.5 rotate-[-3deg] opacity-75 shadow-md group-hover:translate-x-2 group-hover:translate-y-2 group-hover:rotate-[-4deg] transition-transform duration-300"
                  >
                    <img
                      src="/cards/card_back.jpg"
                      alt="Back Layer 2"
                      className="w-full h-full object-cover rounded-xl opacity-50"
                    />
                  </motion.div>

                  {/* Card Layer 1 (Top / Front) */}
                  <motion.div
                    animate={
                      isCuttingThisPile
                        ? { y: [-18, 0], scale: [1.15, 1], rotate: [0, -5, 0] }
                        : isShuffling
                        ? { y: [-6, 6, -6], scale: [1.05, 0.95, 1.05] }
                        : { x: 0, y: 0, rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`absolute inset-0 bg-slate-900 rounded-xl border shadow-2xl overflow-hidden transition-all duration-300 ${
                      isThisPileSelected
                        ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.8)]'
                        : 'border-amber-400/70 group-hover:border-amber-300'
                    }`}
                  >
                    <img
                      src="/cards/card_back.jpg"
                      alt="Back Top"
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Shimmer Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>

                  {/* Shuffling Aura Overlay */}
                  {isShuffling && (
                    <div className="absolute inset-0 z-30 bg-purple-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 border border-amber-400/60 shadow-[0_0_25px_rgba(234,179,8,0.6)] animate-pulse">
                      <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                      <span className="text-[10px] font-bold text-amber-200 text-center leading-tight">
                        กำลังสลับไพ่...
                      </span>
                    </div>
                  )}

                  {/* Loading Spinner overlay during cutting ritual */}
                  {isCuttingThisPile && (
                    <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
                      <span className="text-[10px] text-amber-200 font-bold">กำลังตัดไพ่...</span>
                    </div>
                  )}
                </div>

                {/* Pile Title & Subtitle */}
                <h4 className="text-sm sm:text-base font-bold text-amber-100 font-serif-mystic text-center z-10">
                  {pile.title}
                </h4>
                <p className="text-[11px] text-purple-200/80 text-center mt-1 z-10 leading-snug">
                  {pile.subtitle}
                </p>

                {/* Interactive Status Tag */}
                <div className="mt-3.5 z-10">
                  {isThisPileSelected && isSelectionComplete ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/60 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ตัดสำรับเรียบร้อย</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/70 border border-amber-400/30 group-hover:bg-amber-400/20 group-hover:border-amber-400/60 transition-colors">
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>แตะเลือกลดสำรับกองนี้</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      )}

      {/* Auto Cut Manifested Cards (Visible when selection completes in auto subMode) */}
      <AnimatePresence>
        {subMode === 'auto' && isSelectionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl px-2 my-2 flex flex-col items-center select-none"
          >
            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-purple-950/90 border border-amber-400/50 text-xs sm:text-sm font-bold text-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ไพ่ที่ได้รับการคัดเลือกจากการตัดสำรับ {selectedPile !== null ? `(${PILE_NAMES[selectedPile].title})` : ''} ({selectedCards.length} ใบ)</span>
            </div>

            {/* Manifested Cards Compact Grid */}
            <div className={`grid gap-x-2 gap-y-1.5 sm:gap-4 sm:gap-y-4 w-full justify-items-center ${getGridConfig(selectedCards.length)}`}>
              {selectedCards.map((sc, idx) => {
                const shortPosition = sc.position.split(':')[0] || `ตำแหน่งที่ ${idx + 1}`;
                const detailPosition = sc.position.includes(':') ? sc.position.split(':')[1]?.trim() : '';

                return (
                  <motion.div
                    key={sc.card.id || idx}
                    initial={{ opacity: 0, y: 20, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
                    className="relative group flex flex-col items-center max-w-[130px] xs:max-w-[145px] sm:max-w-[170px] w-full"
                  >
                    {/* Compact Hero Card Image */}
                    <div className="relative w-22 h-34 xs:w-26 xs:h-40 sm:w-32 sm:h-48 md:w-36 md:h-54 rounded-xl sm:rounded-2xl border-2 border-amber-400/80 bg-slate-900 shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] group-hover:border-amber-300 transition-all duration-300 overflow-hidden">
                      <img
                        src="/cards/card_back.jpg"
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

      {/* Manual Card Selection Fan from Selected Pile */}
      {subMode === 'manual' && selectedPile !== null && (
        <div className="w-full max-w-5xl px-2 my-2 flex flex-col items-center select-none animate-fade-in">
          <div className="flex items-center justify-between w-full max-w-xl px-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs sm:text-sm font-bold text-amber-200 font-serif-mystic">
                กำลังคลี่ไพ่จาก {PILE_NAMES[selectedPile].title} ({selectedCards.length} / {targetCount} ใบ)
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetCut}
              className="text-xs text-purple-300 hover:text-amber-200 underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>เปลี่ยนกองตัดไพ่</span>
            </button>
          </div>

          <FanDeckView
            deck={getPileCards(selectedPile)}
            selectedCards={selectedCards}
            targetCount={targetCount}
            isShuffling={false}
            onPickCard={(card) => handleManualPickFromPile(card)}
            cardRefs={manualCardRefs}
            deckContainerRef={manualDeckContainerRef}
          />
        </div>
      )}

      {/* Reset Cut Button */}
      {selectedCards.length > 0 && !isAnalyzing && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={handleResetCut}
          className="mt-4 flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>ทำพิธีตัดสำรับใหม่</span>
        </motion.button>
      )}
    </div>
  );
};
