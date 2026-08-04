import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../data/tarotCards';
import { TAROT_CARDS } from '../data/tarotCards';
import type { DrawnCard } from '../services/aiService';
import { Sparkles, RefreshCw, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
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

  // Trigger card pick
  const handlePickCard = (card: TarotCard) => {
    if (selectedCards.length >= targetCount || isShuffling || isAnalyzing) return;

    // Check if card already selected
    if (selectedCards.some((sc) => sc.card.id === card.id)) return;

    // Random reversed status (25% chance of being reversed for authentic tarot experience)
    const isReversed = Math.random() < 0.25;

    // Position naming
    let positionName = 'ไพ่แทนคำทำนายประจำวัน';
    if (spreadMode === 'three') {
      if (selectedCards.length === 0) positionName = 'ตำแหน่งที่ 1: อดีต / พื้นดวงชะตา';
      else if (selectedCards.length === 1) positionName = 'ตำแหน่งที่ 2: ปัจจุบัน / สถานการณ์จริง';
      else positionName = 'ตำแหน่งที่ 3: อนาคต / ทางออกและผลลัพธ์';
    }

    const newSelection = [
      ...selectedCards,
      { card, isReversed, position: positionName }
    ];

    setSelectedCards(newSelection);
  };

  // Deselect a card if user changes their mind
  const handleDeselectCard = (cardId: string) => {
    if (isAnalyzing) return;
    setSelectedCards((prev) => prev.filter((sc) => sc.card.id !== cardId));
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
      
      {/* Selection Progress Header */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-amber-400/30 text-amber-200 text-xs font-medium shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>
            {isSelectionComplete
              ? 'เลือกไพ่ครบถ้วนแล้ว! กรุณากดยืนยันเพื่อเริ่มอ่านทำนาย'
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
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>ล้างเลือกไพ่ใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Step Bar (When selection reaches targetCount) */}
      {isSelectionComplete && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl glass-panel-gold rounded-2xl p-4 mb-6 flex flex-col items-center gap-3 text-center border border-amber-400/60 shadow-xl"
        >
          <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>เลือกไพ่ครบแล้ว ({selectedCards.length} ใบ)</span>
          </div>

          <p className="text-xs text-purple-200/80">
            หากพอใจกับไพ่ที่เลือก กดยืนยันเพื่อรับคำทำนาย หรือกดเปลี่ยนใจเพื่อสุ่มเลือกใหม่ได้ทุกเมื่อ
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mt-1">
            <button
              type="button"
              onClick={handleConfirmSelection}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 border border-amber-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-950 fill-purple-950" />
              <span>🔮 ยืนยันการเลือกไพ่ & อ่านทำนาย</span>
            </button>

            <button
              type="button"
              onClick={handleResetSelection}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-400/40 text-purple-200 text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
              <span>เปลี่ยนใจ / เลือกใหม่</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Fan Deck Display (Interactive Card Selection) */}
      <div className="relative w-full max-w-5xl min-h-[260px] md:min-h-[300px] flex justify-start md:justify-center items-center overflow-x-auto py-8 px-4 scrollbar-none touch-pan-x">
        <div className="flex -space-x-12 sm:-space-x-10 md:-space-x-8 lg:-space-x-7 justify-start md:justify-center items-center min-w-max px-8 sm:px-12">
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
                    ? { y: -24, scale: 1.04, rotate: 0 }
                    : { y: 0, rotate: rotation }
                }
                whileHover={{ y: -20, scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => {
                  if (isPicked) {
                    handleDeselectCard(card.id);
                  } else {
                    handlePickCard(card);
                  }
                }}
                className={`relative w-24 h-40 sm:w-28 sm:h-44 md:w-32 md:h-52 rounded-xl cursor-pointer shadow-lg border bg-slate-900 flex flex-col items-center justify-center p-2 text-center select-none will-change-transform overflow-hidden ${
                  isPicked
                    ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(234,179,8,0.6)]'
                    : 'border-amber-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                }`}
              >
                {/* Pure Card Back Image */}
                <img
                  src="/cards/card_back.jpg"
                  alt="Tarot Back"
                  loading="eager"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity ${
                    isPicked ? 'opacity-70' : 'opacity-100'
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Selected Indicator Badge */}
                {isPicked && (
                  <div className="absolute inset-0 z-10 bg-amber-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 p-2 text-amber-200">
                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                    <span className="text-[10px] font-bold">เลือกแล้ว</span>
                    <span className="text-[9px] text-amber-300/80 underline">แตะเพื่อยกเลิก</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Instruction Helper Text */}
      {!isSelectionComplete && (
        <p className="text-xs text-purple-300/70 mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>แตะคลิกเลือกไพ่ที่สะดุดตาที่สุด ({selectedCards.length} / {targetCount}) • เลื่อนซ้าย-ขวาเพื่อดูไพ่เพิ่มเติม</span>
        </p>
      )}

    </div>
  );
};
