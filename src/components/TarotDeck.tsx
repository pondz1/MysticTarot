import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../data/tarotCards';
import { TAROT_CARDS } from '../data/tarotCards';
import type { DrawnCard } from '../services/aiService';
import { Sparkles, RefreshCw, Eye } from 'lucide-react';
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

    // If reached target count, trigger confetti and submit callback
    if (newSelection.length === targetCount) {
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
      onCardsSelected(newSelection);
    }
  };

  // Reset selection
  const handleResetSelection = () => {
    setSelectedCards([]);
    setDeck(shuffleArray([...TAROT_CARDS]));
  };

  return (
    <div className="w-full flex flex-col items-center my-6">
      
      {/* Selection Progress Header */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-amber-400/30 text-amber-200 text-xs font-medium shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>
            {selectedCards.length === targetCount
              ? 'เปิดหน้าไพ่สำเร็จ! พร้อมให้อ่านคำทำนาย'
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
              <span>เลือกไพ่ใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Fan Deck Display (Interactive Card Selection) */}
      {selectedCards.length < targetCount && (
        <div className="relative w-full max-w-4xl min-h-[260px] md:min-h-[300px] flex justify-center items-center overflow-x-auto py-8 px-4 scrollbar-none">
          <div className="flex -space-x-12 sm:-space-x-10 md:-space-x-8 lg:-space-x-7 justify-center items-center">
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
                      : { y: 0, rotate: rotation }
                  }
                  whileHover={{ y: -20, scale: 1.05, zIndex: 30 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  onClick={() => handlePickCard(card)}
                  className={`relative w-24 h-40 sm:w-28 sm:h-44 md:w-32 md:h-52 rounded-xl cursor-pointer shadow-lg border border-amber-400/50 bg-slate-900 flex flex-col items-center justify-center p-2 text-center select-none will-change-transform overflow-hidden ${
                    isPicked ? 'opacity-30 pointer-events-none scale-95' : 'hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                  }`}
                >
                  {/* Pure Card Back Image without icon overlay */}
                  <img
                    src="/cards/card_back.jpg"
                    alt="Tarot Back"
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    onError={(e) => {
                      // fallback if image not found
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instruction Helper Text */}
      {selectedCards.length < targetCount && (
        <p className="text-xs text-purple-300/70 mt-2 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          แตะคลิกที่ไพ่ใบที่สะดุดตาคุณมากที่สุดในสำรับ
        </p>
      )}

    </div>
  );
};
