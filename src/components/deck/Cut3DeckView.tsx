import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Sparkles, CheckCircle2, RefreshCw, Zap, Hand } from 'lucide-react';
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
  const [subMode, setSubMode] = useState<'auto' | 'manual'>('auto');
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [isCutting, setIsCutting] = useState(false);

  const isSelectionComplete = selectedCards.length === targetCount;

  // Get subset of deck for chosen pile
  const getPileCards = (pileIdx: number): TarotCard[] => {
    const sectionSize = Math.floor(deck.length / 3);
    const start = pileIdx * sectionSize;
    const end = pileIdx === 2 ? deck.length : start + sectionSize;
    return deck.slice(start, end);
  };

  const handleCutPile = (pileIdx: number) => {
    if (isCutting || isAnalyzing || selectedCards.length > 0) return;

    setSelectedPile(pileIdx);

    if (subMode === 'auto') {
      setIsCutting(true);
      setTimeout(() => {
        const sliced = getPileCards(pileIdx).slice(0, targetCount);
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
      }, 750);
    }
  };

  const handleManualPickFromPile = (card: TarotCard) => {
    if (isAnalyzing || isSelectionComplete) return;

    const isAlreadyPicked = selectedCards.some((sc) => sc.card.id === card.id);
    if (isAlreadyPicked) {
      const updated = selectedCards.filter((sc) => sc.card.id !== card.id);
      onPickCardsBatch(updated);
      return;
    }

    if (selectedCards.length < targetCount) {
      const newDrawn: DrawnCard = {
        card,
        isReversed: Math.random() < 0.25,
        position: getPositionName(selectedCards.length)
      };
      const updated = [...selectedCards, newDrawn];
      onPickCardsBatch(updated);

      if (updated.length === targetCount) {
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
      }
    }
  };

  const handleResetCut = () => {
    setSelectedPile(null);
    onReset();
  };

  return (
    <div className="w-full flex flex-col items-center py-3 select-none">
      {/* Sub-Mode Toggle Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-purple-950/80 border border-purple-500/40 mb-3 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setSubMode('auto');
            handleResetCut();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            subMode === 'auto'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ตามโชคชะตา (อัตโนมัติ)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubMode('manual');
            handleResetCut();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            subMode === 'manual'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>คลี่เลือกไพ่เองจากกอง</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mb-3">
        <span className="text-xs text-amber-300 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>พิธีกรรมตัดสำรับไพ่ 3 กอง</span>
        </span>
        <p className="text-xs text-purple-200/80 mt-1">
          {isSelectionComplete
            ? 'ทำพิธีตัดสำรับเสร็จสิ้น! ตรวจสอบไพ่และกดยืนยันด้านล่าง'
            : subMode === 'auto'
            ? 'แตะเลือกลดสำรับ 1 กองตามสัมผัส พลังงานจะสุ่มดึงไพ่ขึ้นมาให้อัตโนมัติ'
            : selectedPile === null
            ? 'แตะเลือก 1 กองที่คุณต้องการเปิดคลี่สำรับเพื่อเลือกไพ่ด้วยตัวเอง'
            : `เลือกแตะไพ่จาก ${PILE_NAMES[selectedPile].title} (${selectedCards.length} / ${targetCount} ใบ)`}
        </p>
      </div>

      {/* 3 Piles Display (Visible when no pile is selected in manual mode or during auto mode) */}
      {(selectedPile === null || subMode === 'auto') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl w-full px-4 my-2">
          {PILE_NAMES.map((pile) => {
            const isThisPileChosen = selectedPile === pile.id && isSelectionComplete;

            return (
              <motion.div
                key={pile.id}
                role="button"
                tabIndex={0}
                aria-label={`เลือกตัดสำรับ ${pile.title} (${pile.subtitle})`}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCutPile(pile.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCutPile(pile.id);
                  }
                }}
                className={`relative flex flex-col items-center p-4 rounded-2xl border bg-gradient-to-b ${pile.color} cursor-pointer transition-all duration-300 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isThisPileChosen
                    ? 'border-2 border-amber-400 ring-2 ring-amber-300 shadow-[0_0_25px_rgba(234,179,8,0.5)]'
                    : 'hover:border-amber-400/60'
                }`}
              >
                {/* Stacked 3D Card Illusion */}
                <div className="relative w-22 h-32 sm:w-24 sm:h-36 mb-3 flex items-center justify-center">
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
      )}

      {/* Manual Card Selection Fan from Selected Pile */}
      {subMode === 'manual' && selectedPile !== null && (
        <div className="w-full max-w-3xl px-2 my-2 flex flex-col items-center select-none">
          <div className="flex items-center justify-between w-full max-w-xl px-4 mb-2">
            <span className="text-xs font-bold text-amber-300">
              คลี่เลือกไพ่จาก {PILE_NAMES[selectedPile].title} ({selectedCards.length} / {targetCount} ใบ)
            </span>
            <button
              type="button"
              onClick={handleResetCut}
              className="text-[11px] text-purple-300 hover:text-amber-200 underline cursor-pointer"
            >
              เปลี่ยนกองตัดไพ่
            </button>
          </div>

          {/* Overlapping Arc Fan Ribbon for Selected Pile */}
          <div className="w-full flex justify-center items-center py-6 px-1 my-1 overflow-hidden">
            <div className="flex justify-center items-center w-full max-w-xl mx-auto">
              {getPileCards(selectedPile).map((card, idx) => {
                const pileCards = getPileCards(selectedPile);
                const midIdx = (pileCards.length - 1) / 2;
                const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

                // Gentle arc fan angle (-10deg to +10deg)
                const fanAngle = (idx - midIdx) * 3;
                const arcY = Math.abs(idx - midIdx) * 1.6;

                return (
                  <motion.div
                    key={card.id}
                    initial={{ y: arcY, rotate: fanAngle }}
                    animate={
                      isPicked
                        ? { y: -16, scale: 1.12, rotate: 0, zIndex: 50 }
                        : { y: [arcY, arcY - 4, arcY], rotate: fanAngle, zIndex: idx + 1 }
                    }
                    whileHover={{ y: -12, scale: 1.1, rotate: 0, zIndex: 45 }}
                    transition={{
                      duration: 0.2,
                      ease: 'easeOut',
                      y: isPicked ? undefined : { repeat: Infinity, repeatType: 'reverse', duration: 2.8, delay: idx * 0.08 },
                    }}
                    onClick={() => handleManualPickFromPile(card)}
                    style={{
                      transformOrigin: 'bottom center',
                      marginLeft: idx > 0 ? '-3.8%' : '0px',
                    }}
                    className={`relative w-[12.5vw] max-w-[110px] min-w-[64px] h-[19vw] max-h-[168px] min-h-[98px] rounded-lg sm:rounded-xl cursor-pointer shadow-2xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none overflow-hidden shrink-0 transition-shadow duration-200 ${
                      isPicked
                        ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_35px_rgba(234,179,8,0.95)]'
                        : 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_24px_rgba(234,179,8,0.65)]'
                    }`}
                  >
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

                    {isPicked && (
                      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 fill-slate-950 text-amber-400" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedCards.length > 0 && !isAnalyzing && (
        <button
          type="button"
          onClick={handleResetCut}
          className="mt-3 flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
          <span>ตัดสำรับใหม่</span>
        </button>
      )}
    </div>
  );
};
