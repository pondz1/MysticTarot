import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
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

  const handleStartHold = () => {
    if (isAnalyzing || isSelectionComplete || holdFinished) return;

    setIsHolding(true);
    setProgress(0);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          completeHold();
          return 100;
        }
        return prev + 4; // Fills 100% in ~1.25s
      });
    }, 50);
  };

  const handleEndHold = () => {
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
      position: getPositionName(posIdx)
    }));

    onPickCardsBatch(drawn);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#A855F7', '#38BDF8']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleResetHold = () => {
    setHoldFinished(false);
    setProgress(0);
    onReset();
  };

  // SVG Progress circle calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full flex flex-col items-center py-6 select-none">
      {/* Title */}
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>พิธีกรรมตั้งจิตอธิษฐาน (Mindful Touch & Hold)</span>
        </span>
        <p className="text-xs text-purple-200/80 mt-1 max-w-sm">
          {isSelectionComplete
            ? 'ถ่ายทอดพลังงานอธิษฐานเรียบร้อย! ตรวจสอบคำทำนายด้านล่าง'
            : 'หลับตา หลอนถึงคำถาม แล้วแตะค้างที่ลูกแก้วจักรวาลด้านล่าง'}
        </p>
      </div>

      {/* Cosmic Orb Hold Button */}
      <div className="relative my-4 flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            className="text-purple-950/60"
            fill="transparent"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#goldGradient)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
            fill="transparent"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Interactive Orb Element */}
        <motion.button
          type="button"
          onMouseDown={handleStartHold}
          onMouseUp={handleEndHold}
          onMouseLeave={handleEndHold}
          onTouchStart={handleStartHold}
          onTouchEnd={handleEndHold}
          animate={
            isHolding
              ? { scale: [1, 1.06, 1.02], filter: 'drop-shadow(0 0 35px rgba(234,179,8,0.9))' }
              : isSelectionComplete
              ? { scale: 1.05, filter: 'drop-shadow(0 0 25px rgba(234,179,8,0.7))' }
              : { scale: 1 }
          }
          transition={{ duration: 0.3 }}
          className={`absolute inset-4 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border ${
            isSelectionComplete
              ? 'bg-gradient-to-tr from-purple-900 via-amber-600 to-indigo-900 border-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.8)]'
              : 'bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 border-amber-400/40 hover:border-amber-300'
          }`}
        >
          {isSelectionComplete ? (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-10 h-10 text-amber-300 animate-bounce" />
              <span className="text-xs font-bold text-amber-200">รับสารจักรวาลแล้ว</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 px-3 text-center">
              <Sparkles className={`w-8 h-8 ${isHolding ? 'text-amber-300 animate-spin' : 'text-amber-400'}`} />
              <span className="text-xs font-bold text-amber-200">
                {isHolding ? `${progress}%` : 'แตะค้างอธิษฐาน'}
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Helper State Message */}
      {!isSelectionComplete && (
        <p className="text-[11px] text-purple-300/70 mt-2">
          {isHolding ? 'กำลังเชื่อมต่อพลังงานจักรวาล...' : '* แตะค้างไว้จนกว่าพลังงานจะครบ 100%'}
        </p>
      )}

      {isSelectionComplete && !isAnalyzing && (
        <button
          type="button"
          onClick={handleResetHold}
          className="mt-3 flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
          <span>ตั้งจิตอธิษฐานใหม่</span>
        </button>
      )}
    </div>
  );
};
