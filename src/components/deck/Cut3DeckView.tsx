import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Sparkles, CheckCircle2, RefreshCw, Zap, Hand, Compass, ChevronRight, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FanDeckView } from './FanDeckView';

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
  onPickCardsBatch,
  getPositionName,
  onReset,
}) => {
  const [subMode, setSubMode] = useState<'auto' | 'manual'>('auto');
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [isCutting, setIsCutting] = useState(false);

  const manualCardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const manualDeckContainerRef = React.useRef<HTMLDivElement | null>(null);

  const isSelectionComplete = selectedCards.length === targetCount;

  // Reset selected pile state when selected cards are cleared externally (e.g. changing deck filter or resetting)
  React.useEffect(() => {
    if (selectedCards.length === 0) {
      setSelectedPile(null);
      setIsCutting(false);
    }
  }, [selectedCards.length]);

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
        const finalCards =
          sliced.length < targetCount
            ? [...sliced, ...deck.slice(0, targetCount - sliced.length)]
            : sliced;

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
          <span>พิธีตัดสำรับ 3 กอง</span>
        </span>
        <ChevronRight className="w-3 h-3 text-purple-400" />
        <span className="text-purple-200 font-medium">
          {selectedCards.length > 0
            ? `ขั้นตอนที่ 2: สรุปผลไพ่ (${selectedCards.length}/${targetCount})`
            : selectedPile === null
            ? 'ขั้นตอนที่ 1: ตั้งจิตเลือกกองไพ่'
            : `ขั้นตอนที่ 2: เลือกไพ่จาก ${PILE_NAMES[selectedPile].title}`}
        </span>
      </div>

      {/* Sub-Mode Toggle Bar with Explanations */}
      <div className="flex flex-col items-center mb-4 sm:mb-6 max-w-md w-full px-3">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0b081d]/90 border border-purple-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-full justify-center">
          <button
            type="button"
            onClick={() => {
              setSubMode('auto');
              handleResetCut();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subMode === 'auto'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>สุ่มเปิดให้อัตโนมัติ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubMode('manual');
              handleResetCut();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subMode === 'manual'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Hand className="w-3.5 h-3.5 shrink-0" />
            <span>คลี่หยิบไพ่เองจากกอง</span>
          </button>
        </div>

        {/* Sub-mode hint */}
        <p className="text-[10px] sm:text-xs text-purple-300/70 text-center mt-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            {subMode === 'auto'
              ? 'ระบบจะสุ่มดึงไพ่ครบชุดให้อัตโนมัติทันทีที่แตะเลือกกอง'
              : 'เมื่อแตะเลือกกอง ระบบจะคลี่เฉพาะกองนั้นให้คุณใช้นิ้วจิ้มหยิบไพ่ด้วยตัวเอง'}
          </span>
        </p>
      </div>

      {/* Main Instructions Header */}
      <div className="text-center mb-4 sm:mb-6 max-w-lg px-4">
        <h3 className="text-sm sm:text-base font-bold text-gold-gradient font-serif-mystic flex items-center justify-center gap-2">
          {isSelectionComplete
            ? '✨ ได้รับพลังงานตัดสำรับเรียบร้อยแล้ว'
            : selectedPile === null
            ? '🔮 ทำจิตใจให้สงบ แล้วสัมผัสเลือก 1 กองที่แรงดึงดูดมากที่สุด'
            : `🎴 กำลังทำนายไพ่จาก ${PILE_NAMES[selectedPile].title}`}
        </h3>
        <p className="text-xs text-purple-200/80 mt-1">
          {isSelectionComplete
            ? 'ตรวจสอบตำแหน่งไพ่ที่สุ่มตัดได้ แล้วกดยืนยันเพื่ออ่านคำทำนาย'
            : subMode === 'auto'
            ? 'แบ่งสำรับเป็น 3 ส่วน เลือกกองที่คุณรู้สึกเชื่อมโยงเพื่อเริ่มสุ่มตัดไพ่'
            : selectedPile === null
            ? 'แตะเลือก 1 กอง เพื่อแยกคลี่ไพ่ในกองนั้นออกมารับพลังงาน'
            : `แตะเลือกไพ่ให้ครบ ${targetCount} ใบ สำหรับการดูดวงรอบนี้`}
        </p>
      </div>

      {/* 3D Piles Display */}
      {(selectedPile === null || (subMode === 'auto' && !isSelectionComplete)) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-3xl w-full px-4 my-2">
          {PILE_NAMES.map((pile) => {
            const isThisPileSelected = selectedPile === pile.id;
            const isCuttingThisPile = isCutting && isThisPileSelected;

            return (
              <motion.div
                key={pile.id}
                role="button"
                tabIndex={0}
                aria-label={`เลือกตัดสำรับ ${pile.title} (${pile.subtitle})`}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
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
                  <div className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/30 transform translate-x-3 translate-y-3 rotate-[5deg] opacity-50 shadow-md group-hover:translate-x-4 group-hover:translate-y-4 group-hover:rotate-[7deg] transition-transform duration-300">
                    <img
                      src="/cards/card_back.jpg"
                      alt="Back Layer 3"
                      className="w-full h-full object-cover rounded-xl opacity-30"
                    />
                  </div>

                  {/* Card Layer 2 (Middle) */}
                  <div className="absolute inset-0 bg-slate-900 rounded-xl border border-amber-400/40 transform translate-x-1.5 translate-y-1.5 rotate-[-3deg] opacity-75 shadow-md group-hover:translate-x-2 group-hover:translate-y-2 group-hover:rotate-[-4deg] transition-transform duration-300">
                    <img
                      src="/cards/card_back.jpg"
                      alt="Back Layer 2"
                      className="w-full h-full object-cover rounded-xl opacity-50"
                    />
                  </div>

                  {/* Card Layer 1 (Top / Front) */}
                  <motion.div
                    animate={
                      isCuttingThisPile
                        ? { y: [-18, 0], scale: [1.15, 1], rotate: [0, -5, 0] }
                        : {}
                    }
                    transition={{ duration: 0.7, ease: 'easeOut' }}
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
      )}

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
