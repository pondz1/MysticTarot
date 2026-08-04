import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../data/tarotCards';
import { TAROT_CARDS } from '../data/tarotCards';
import type { DrawnCard } from '../services/aiService';
import { Sparkles, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TarotDeckProps {
  spreadMode: 'single' | 'three';
  onCardsSelected: (cards: DrawnCard[]) => void;
  isAnalyzing: boolean;
}

export const TarotDeck: React.FC<TarotDeckProps> = ({
  spreadMode,
  onCardsSelected,
  isAnalyzing
}) => {
  const targetCount = spreadMode === 'single' ? 1 : 3;
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [deck, setDeck] = useState<TarotCard[]>(() => shuffleArray([...TAROT_CARDS]));

  // Helper array shuffle
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Trigger shuffle animation
  const handleShuffle = () => {
    if (isShuffling || selectedCards.length > 0) return;
    setIsShuffling(true);
    setTimeout(() => {
      setDeck(shuffleArray([...TAROT_CARDS]));
      setIsShuffling(false);
    }, 1200);
  };

  // Helper to get position name
  const getPositionName = (index: number) => {
    if (spreadMode === 'single') return 'ไพ่แทนคำทำนายประจำวัน';
    if (index === 0) return 'ตำแหน่งที่ 1: อดีต / พื้นดวงชะตา';
    if (index === 1) return 'ตำแหน่งที่ 2: ปัจจุบัน / สถานการณ์จริง';
    return 'ตำแหน่งที่ 3: อนาคต / ทางออกและผลลัพธ์';
  };

  // Seamless Pick / Swap / Deselect card handler
  const handlePickCard = (card: TarotCard) => {
    if (isShuffling || isAnalyzing) return;

    const isAlreadyPicked = selectedCards.some((sc) => sc.card.id === card.id);

    // 1. If card is already selected -> Deselect it
    if (isAlreadyPicked) {
      setSelectedCards((prev) => prev.filter((sc) => sc.card.id !== card.id));
      return;
    }

    const isReversed = Math.random() < 0.25;

    // 2. If selection is not full yet -> Add new card
    if (selectedCards.length < targetCount) {
      const newCardEntry: DrawnCard = {
        card,
        isReversed,
        position: getPositionName(selectedCards.length)
      };
      setSelectedCards((prev) => [...prev, newCardEntry]);
    } else {
      // 3. Selection is full -> Seamlessly swap/replace the last selected card with newly clicked card!
      const updated = [...selectedCards];
      const replaceIndex = targetCount - 1;
      updated[replaceIndex] = {
        card,
        isReversed,
        position: getPositionName(replaceIndex)
      };
      setSelectedCards(updated);
    }
  };

  // Confirm selection and trigger reading
  const handleConfirmSelection = () => {
    if (selectedCards.length !== targetCount || isAnalyzing) return;

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#A855F7', '#38BDF8']
      });
    } catch (e) {
      // ignore if confetti fails
    }

    onCardsSelected(selectedCards);
  };

  // Reset selection
  const handleResetSelection = () => {
    setSelectedCards([]);
    setDeck(shuffleArray([...TAROT_CARDS]));
  };

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center my-6">
      
      {/* Selection Progress Header (Top) */}
      <div className="flex flex-col items-center gap-2 mb-2 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-amber-400/30 text-amber-200 text-xs font-medium shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>
            {isSelectionComplete
              ? 'เลือกไพ่เรียบร้อยแล้ว! ตรวจสอบด้านล่างเพื่อยืนยัน'
              : `กรุณาเลือกไพ่จากสำรับ (${selectedCards.length} / ${targetCount} ใบ)`}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            disabled={isShuffling || selectedCards.length > 0 || isAnalyzing}
            onClick={handleShuffle}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-100 disabled:opacity-40 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'กำลังสับไพ่...' : 'สับไพ่ในสำรับ'}</span>
          </button>

          {selectedCards.length > 0 && !isAnalyzing && (
            <button
              type="button"
              onClick={handleResetSelection}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
            >
              <span>ล้างเลือกใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Fan Deck Display (Interactive Card Selection - Middle) */}
      <div className="relative w-full min-h-[320px] md:min-h-[360px] overflow-x-auto py-12 md:py-16 scrollbar-none touch-pan-x">
        <div className="flex justify-start items-center min-w-max px-12 sm:px-16 md:px-24 -space-x-12 sm:-space-x-10 md:-space-x-8 lg:-space-x-7 mx-auto">
          {deck.slice(0, 15).map((card, idx) => {
            const isPicked = selectedCards.some((sc) => sc.card.id === card.id);
            // Slight fan rotation effect
            const rotation = (idx - 7) * 3;

            return (
              <motion.div
                key={card.id}
                initial={{ y: 0, rotate: rotation }}
                animate={
                  isShuffling
                    ? {
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 30,
                        rotate: (Math.random() - 0.5) * 30,
                      }
                    : isPicked
                    ? { y: -28, scale: 1.08, rotate: 0, zIndex: 40 }
                    : { y: 0, rotate: rotation, zIndex: 1 }
                }
                whileHover={{ y: -20, scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => handlePickCard(card)}
                style={{ transform: 'translateZ(0)' }}
                className={`relative w-24 h-40 sm:w-28 sm:h-44 md:w-32 md:h-52 rounded-xl cursor-pointer shadow-lg border bg-slate-900 flex flex-col items-center justify-center p-2 text-center select-none gpu-accelerated overflow-hidden ${
                  isPicked
                    ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.8)]'
                    : 'border-amber-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                }`}
              >
                {/* Pure Card Back Image */}
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

                {/* Elegant Small Corner Checkmark Badge */}
                {isPicked && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-4 h-4 fill-slate-950 text-amber-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Helper Text (When not complete) */}
      {!isSelectionComplete && (
        <p className="text-xs text-purple-300/70 mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>แตะคลิกเลือกไพ่ที่สะดุดตาที่สุด ({selectedCards.length} / {targetCount}) • เลื่อนซ้าย-ขวาเพื่อดูไพ่เพิ่มเติม</span>
        </p>
      )}

      {/* Confirmation Banner (Placed Below the Deck - Reading flow: Top -> Deck -> Bottom Confirm) */}
      {isSelectionComplete && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-panel-gold rounded-2xl p-4 mt-2 flex flex-col items-center gap-2.5 text-center border border-amber-400/60 shadow-xl"
        >
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>เลือกไพ่ครบถ้วน ({selectedCards.length} / {targetCount} ใบ)</span>
          </div>

          <button
            type="button"
            onClick={handleConfirmSelection}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 border border-amber-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-purple-950 fill-purple-950" />
            <span>🔮 ยืนยันการเลือกไพ่ & อ่านทำนาย</span>
          </button>

          <p className="text-[11px] text-purple-300/70">
            * หากต้องการสลับเปลี่ยนไพ่ ให้แตะคลิกที่ไพ่ใบอื่นในสำรับได้ทันที
          </p>
        </motion.div>
      )}

    </div>
  );
};
