import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Sparkles, CheckCircle2, RefreshCw, Zap, Hand, Flame, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MindfulHoldViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  onPickCardsBatch: (cards: DrawnCard[]) => void;
  getPositionName: (index: number) => string;
  onReset: () => void;
}

export const MindfulHoldView: React.FC<MindfulHoldViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  onPickCardsBatch,
  getPositionName,
  onReset,
}) => {
  const [chargeMode, setChargeMode] = useState<'hold' | 'tap'>('hold');
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [holdFinished, setHoldFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSelectionComplete = selectedCards.length === targetCount;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Reset hold state when selected cards are cleared externally
  useEffect(() => {
    if (selectedCards.length === 0) {
      setHoldFinished(false);
      setProgress(0);
      setIsHolding(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [selectedCards.length]);

  // Trigger completion when progress hits 100%
  useEffect(() => {
    if (progress >= 100 && !holdFinished && !isSelectionComplete) {
      completeHold();
    }
  }, [progress, holdFinished, isSelectionComplete]);

  // Helper to start charging
  const startCharging = () => {
    setIsHolding(true);
    setProgress(0);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev + 2 >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 100;
        }
        return prev + 2; // Fills 100% in ~2.75s (50 steps * 55ms)
      });
    }, 55);
  };

  const handleStartHold = () => {
    if (isAnalyzing || isSelectionComplete || holdFinished) return;

    if (chargeMode === 'tap') {
      if (isHolding) return; // already charging
      startCharging();
    } else {
      startCharging();
    }
  };

  const handleEndHold = () => {
    if (chargeMode === 'tap') return; // in tap mode, don't cancel on mouse/touch end
    if (holdFinished) return;

    setIsHolding(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progress < 100) {
      setProgress(0);
    }
  };

  const completeHold = () => {
    setHoldFinished(true);
    setIsHolding(false);

    // Pick targetCount distinct random cards
    const indices: number[] = [];
    while (indices.length < targetCount && indices.length < deck.length) {
      const r = Math.floor(Math.random() * deck.length);
      if (!indices.includes(r)) {
        indices.push(r);
      }
    }

    const drawn: DrawnCard[] = indices.map((idx, posIdx) => ({
      card: deck[idx],
      isReversed: Math.random() < 0.25,
      position: getPositionName(posIdx),
    }));

    onPickCardsBatch(drawn);

    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#A855F7', '#38BDF8'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleResetHold = () => {
    setHoldFinished(false);
    setProgress(0);
    setIsHolding(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onReset();
  };

  // Guidance message based on progress
  const getGuidanceMessage = () => {
    if (isSelectionComplete) {
      return '✨ รับสารพลังงานจากจักรวาลเรียบร้อยแล้ว! ตรวจสอบคำทำนายด้านล่าง';
    }
    if (progress === 0) {
      return chargeMode === 'hold'
        ? '🧘 หลับตา... แตะค้างที่ลูกแก้วจักรวาลเพื่อส่งคลื่นพลังงานจิต'
        : '🔮 หลับตา... แตะ 1 ครั้งเพื่อเริ่มพิธีสแกนพลังงานจักรวาล';
    }
    if (progress < 35) {
      return '🧘 หลับตา... หายใจเข้าลึกๆ ตั้งสมาธิถึงสิ่งที่ต้องการคำตอบ';
    }
    if (progress < 75) {
      return '✨ กำลังส่งคลื่นพลังงานจิตเข้าสู่ดวงจิตจักรวาล...';
    }
    return '🔮 จักรวาลกำลังระเบิดแสงสแกนค้นหาไพ่ที่เชื่อมโยงกับคุณ...';
  };

  // SVG Progress circle calculations
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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

  return (
    <div className="w-full flex flex-col items-center py-3 sm:py-5 select-none">
      {/* Charge Mode Toggle Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0b081d]/90 border border-purple-500/40 shadow-inner mb-4 max-w-sm w-full justify-center">
        <button
          type="button"
          onClick={() => {
            setChargeMode('hold');
            handleResetHold();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            chargeMode === 'hold'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          <Hand className="w-3.5 h-3.5 shrink-0" />
          <span>แตะค้างชาร์จพลัง</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setChargeMode('tap');
            handleResetHold();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            chargeMode === 'tap'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span>แตะ 1 ครั้งทำสมาธิ</span>
        </button>
      </div>

      {/* Title & Guidance Instructions */}
      <div className="text-center mb-4 sm:mb-6 max-w-md px-4">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>พิธีกรรมตั้งจิตอธิษฐาน (Mindful Meditation)</span>
        </span>
        <h3 className="text-sm sm:text-base font-bold text-gold-gradient font-serif-mystic mt-1">
          {getGuidanceMessage()}
        </h3>
      </div>

      {/* 3D Cosmic Orb & Shockwave Container (Hidden when selection completes to give full focus to cards) */}
      {!isSelectionComplete && (
        <div className="relative my-3 sm:my-5 flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64">
          {/* Shockwave Rings while holding/charging */}
          {isHolding && (
            <>
              <motion.div
                animate={{ scale: [1, 1.45, 1.8], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-amber-400/60 shadow-[0_0_30px_rgba(234,179,8,0.5)] pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1.6], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.5)] pointer-events-none"
              />
            </>
          )}

          {/* Orbiting Cosmic Particle Ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-56 h-56 rounded-full border border-dashed border-purple-400/40 flex items-center justify-center relative ${isHolding ? 'animate-spin' : 'animate-spin-slow'}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-2 left-1/2 -translate-x-1/2 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-purple-400 absolute -bottom-2 left-1/2 -translate-x-1/2 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-1/2 -left-2 -translate-y-1/2 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-purple-300 absolute top-1/2 -right-2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>

          {/* SVG Progress Circle */}
          <svg className="w-56 h-56 transform -rotate-90 z-10">
            <circle
              cx="112"
              cy="112"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              className="text-purple-950/80"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r={radius}
              stroke="url(#orbGoldGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
              fill="transparent"
            />
            <defs>
              <linearGradient id="orbGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Interactive 3D Cosmic Orb Element */}
          <motion.button
            type="button"
            onMouseDown={handleStartHold}
            onMouseUp={handleEndHold}
            onMouseLeave={handleEndHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleEndHold}
            animate={
              isHolding
                ? { scale: [1, 1.08, 1.03], filter: 'drop-shadow(0 0 45px rgba(234,179,8,0.95))' }
                : { scale: 1 }
            }
            transition={{ duration: 0.3 }}
            className={`absolute z-20 inset-8 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border shadow-2xl overflow-hidden ${
              isHolding
                ? 'bg-gradient-to-br from-amber-600/50 via-purple-900/95 to-slate-950 border-amber-400 ring-2 ring-amber-400/60'
                : 'bg-gradient-to-br from-purple-950/90 via-slate-900/95 to-indigo-950 border-amber-400/50 hover:border-amber-300 hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5 px-3 text-center">
              <Flame
                className={`w-9 h-9 transition-transform duration-300 ${
                  isHolding ? 'text-amber-300 animate-bounce scale-110' : 'text-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-amber-100 font-serif-mystic">
                {isHolding
                  ? `${progress}%`
                  : chargeMode === 'hold'
                  ? 'แตะค้างอธิษฐาน'
                  : 'แตะเพื่อเริ่มอธิษฐาน'}
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Cosmic Card Manifestation Sequence (Visible when selection completes) */}
      <AnimatePresence>
        {isSelectionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl px-2 my-2 flex flex-col items-center select-none"
          >
            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-purple-950/90 border border-amber-400/50 text-xs sm:text-sm font-bold text-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ไพ่ที่ได้รับการถ่ายทอดพลังงานอธิษฐาน ({selectedCards.length} ใบ)</span>
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

      {/* Helper State Hint */}
      {!isSelectionComplete && (
        <p className="text-[11px] sm:text-xs text-purple-300/70 mt-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            {isHolding
              ? 'กำลังเชื่อมต่อคลื่นพลังงานจิตสมาธิสู่จักรวาล...'
              : chargeMode === 'hold'
              ? '* แตะค้างไว้ที่ลูกแก้วจนกว่าพลังงานจะเต็ม 100%'
              : '* แตะ 1 ครั้ง แล้วตั้งจิตสมาธิรอพลังงานเต็ม 100%'}
          </span>
        </p>
      )}

      {/* Reset Prayer Action Button */}
      {isSelectionComplete && !isAnalyzing && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={handleResetHold}
          className="mt-4 flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>ตั้งจิตอธิษฐานใหม่</span>
        </motion.button>
      )}
    </div>
  );
};
