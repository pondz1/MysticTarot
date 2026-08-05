import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Compass, CheckCircle2, RefreshCw, Zap, Sun, Moon, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompassDeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  onPickCardsBatch: (cards: DrawnCard[]) => void;
  getPositionName: (index: number) => string;
  onReset: () => void;
}

const ZODIAC_HOUSES = [
  { name: 'เมษ', house: 'เรือนที่ 1: ตัวตนและการเริ่มต้นใหม่', element: 'ธาตุไฟ' },
  { name: 'พฤษภ', house: 'เรือนที่ 2: การเงินและความมั่นคง', element: 'ธาตุดิน' },
  { name: 'เมถุน', house: 'เรือนที่ 3: การสื่อสารและการเรียนรู้', element: 'ธาตุลม' },
  { name: 'กรกฎ', house: 'เรือนที่ 4: ครอบครัวและรากฐานชีวิต', element: 'ธาตุน้ำ' },
  { name: 'สิงห์', house: 'เรือนที่ 5: ความรักและความคิดสร้างสรรค์', element: 'ธาตุไฟ' },
  { name: 'กันย์', house: 'เรือนที่ 6: การงานและสุขภาพ', element: 'ธาตุดิน' },
  { name: 'ตุลย์', house: 'เรือนที่ 7: ความสัมพันธ์และหุ้นส่วน', element: 'ธาตุลม' },
  { name: 'พิจิก', house: 'เรือนที่ 8: ความลึกลับและการเปลี่ยนแปลง', element: 'ธาตุน้ำ' },
  { name: 'ธนู', house: 'เรือนที่ 9: วิสัยทัศน์และการเดินทาง', element: 'ธาตุไฟ' },
  { name: 'มังกร', house: 'เรือนที่ 10: เกียรติยศและความสำเร็จ', element: 'ธาตุดิน' },
  { name: 'กุมภ์', house: 'เรือนที่ 11: มิตรภาพและความฝัน', element: 'ธาตุลม' },
  { name: 'มีน', house: 'เรือนที่ 12: จิตวิญญาณและสังหรณ์', element: 'ธาตุน้ำ' },
];

export const CompassDeckView: React.FC<CompassDeckViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  onPickCardsBatch,
  getPositionName,
  onReset,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [needleRotation, setNeedleRotation] = useState(0);
  const [activeZodiac, setActiveZodiac] = useState<typeof ZODIAC_HOUSES[0] | null>(null);

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

  // Trigger needle spin to select a zodiac house & draw card
  const handleSpinCompass = () => {
    if (isSpinning || isAnalyzing || isSelectionComplete) return;

    setIsSpinning(true);

    // Calculate target rotation (multiple full 360 turns + house angle)
    const houseAngle = 360 / ZODIAC_HOUSES.length;
    const randomHouseIndex = Math.floor(Math.random() * ZODIAC_HOUSES.length);
    const targetAngle = needleRotation + 1440 + randomHouseIndex * houseAngle;

    setNeedleRotation(targetAngle);

    setTimeout(() => {
      const selectedZodiac = ZODIAC_HOUSES[randomHouseIndex];
      setActiveZodiac(selectedZodiac);

      // Pick distinct random card from deck
      const existingIds = new Set(selectedCards.map((sc) => sc.card.id));
      const availableCards = deck.filter((c) => !existingIds.has(c.id));
      const pool = availableCards.length > 0 ? availableCards : deck;

      const randomCard = pool[Math.floor(Math.random() * pool.length)];
      const nextIndex = selectedCards.length;

      const newDrawnCard: DrawnCard = {
        card: randomCard,
        isReversed: Math.random() < 0.25,
        position: getPositionName(nextIndex),
      };

      const updated = [...selectedCards, newDrawnCard];
      onPickCardsBatch(updated);

      setIsSpinning(false);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8'],
        });
      } catch (e) {
        // ignore
      }
    }, 1800);
  };

  // Spin compass to draw all remaining cards
  const handleSpinAll = () => {
    if (isSpinning || isAnalyzing || isSelectionComplete) return;

    setIsSpinning(true);
    setNeedleRotation((prev) => prev + 1800);

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
      setIsSpinning(false);

      try {
        confetti({
          particleCount: 95,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#A855F7', '#38BDF8'],
        });
      } catch (e) {
        // ignore
      }
    }, 1900);
  };

  return (
    <div className="w-full flex flex-col items-center py-2 sm:py-4 select-none">
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-amber-400/40 text-[11px] sm:text-xs">
        <span className="flex items-center gap-1.5 font-bold text-amber-300">
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>พิธีกรรมวงล้อเข็มทิศดวงดาว 12 ราศี (Astral Tarot Astrolabe)</span>
        </span>
      </div>

      {/* Title & Active House Instruction */}
      <div className="text-center mb-3 sm:mb-4 px-4 max-w-md">
        <h3 className="text-sm sm:text-base font-bold text-gold-gradient font-serif-mystic">
          {isSelectionComplete
            ? '✨ เข็มทิศดวงดาวชี้สแกนไพ่ครบถ้วนแล้ว!'
            : activeZodiac
            ? `เข็มทิศชี้เรือนชะตา ราศี${activeZodiac.name} (${activeZodiac.element})`
            : `หมุนเข็มทิศดวงดาวสแกนไพ่ประจำเรือนชะตา (${selectedCards.length} / ${targetCount} ใบ)`}
        </h3>
        {activeZodiac && !isSelectionComplete && (
          <p className="text-xs text-amber-300 font-semibold mt-1 animate-pulse px-3 py-1 rounded-full bg-purple-950/90 border border-amber-400/30 inline-block shadow-md">
            {activeZodiac.house}
          </p>
        )}
      </div>

      {/* 3D Astrolabe Radial Tarot Wheel */}
      {!isSelectionComplete && (
        <div className="relative my-2 sm:my-4 flex flex-col items-center justify-center w-full max-w-md">
          {/* Main 360 Degree Stage Container */}
          <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full border-4 border-amber-400/60 bg-gradient-to-b from-[#0e0826] via-[#090518] to-[#12072b] shadow-[0_0_60px_rgba(234,179,8,0.35)] flex items-center justify-center p-2 overflow-hidden">
            
            {/* Outer Astrolabe Geometric SVG Wheel Marks */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 animate-spin-slow">
              <circle cx="50%" cy="50%" r="46%" stroke="#EAB308" strokeWidth="1" strokeDasharray="6,4" fill="none" />
              <circle cx="50%" cy="50%" r="35%" stroke="#A855F7" strokeWidth="1" strokeDasharray="4,4" fill="none" />
              <circle cx="50%" cy="50%" r="20%" stroke="#EAB308" strokeWidth="1.5" fill="none" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#EAB308" strokeWidth="0.5" opacity="0.4" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#EAB308" strokeWidth="0.5" opacity="0.4" />
            </svg>

            {/* Glowing Cardinal Badges */}
            <span className="absolute top-1.5 text-[10px] font-extrabold text-amber-300 tracking-widest drop-shadow-md">N</span>
            <span className="absolute bottom-1.5 text-[10px] font-extrabold text-amber-300 tracking-widest drop-shadow-md">S</span>
            <span className="absolute right-2 text-[10px] font-extrabold text-amber-300 tracking-widest drop-shadow-md">E</span>
            <span className="absolute left-2 text-[10px] font-extrabold text-amber-300 tracking-widest drop-shadow-md">W</span>

            {/* 12 Miniature Tarot Cards arranged radially in a 360° circle */}
            {ZODIAC_HOUSES.map((zh, idx) => {
              const angle = (idx * 360) / ZODIAC_HOUSES.length - 90;
              const rad = (angle * Math.PI) / 180;
              // Precision radius to fit neatly inside 320px/400px container
              const radius = window.innerWidth >= 640 ? 142 : 108;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              const isThisActive = activeZodiac?.name === zh.name;

              return (
                <motion.div
                  key={zh.name}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  animate={
                    isThisActive
                      ? { scale: [1, 1.25, 1.15], zIndex: 40 }
                      : { scale: 1, zIndex: 20 }
                  }
                  transition={{ duration: 0.35 }}
                  className="absolute flex flex-col items-center group cursor-pointer"
                  onClick={handleSpinCompass}
                >
                  {/* Mini Card Frame */}
                  <div
                    className={`relative w-8 h-12 sm:w-10 sm:h-15 rounded-md sm:rounded-lg border bg-slate-900 shadow-md transition-all duration-300 overflow-hidden ${
                      isThisActive
                        ? 'border-amber-300 ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(234,179,8,1)]'
                        : 'border-amber-400/60 hover:border-amber-300 hover:scale-110'
                    }`}
                  >
                    <img
                      src="/cards/card_back.jpg"
                      alt={zh.name}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* House Index Badge */}
                    <span className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-extrabold flex items-center justify-center shadow-md">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Zodiac Name Tag */}
                  <span
                    className={`text-[8px] sm:text-[9px] font-bold mt-0.5 px-1 py-0.2 rounded transition-all ${
                      isThisActive
                        ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold scale-105'
                        : 'bg-purple-950/90 text-amber-200 border border-purple-700/60'
                    }`}
                  >
                    {zh.name}
                  </span>
                </motion.div>
              );
            })}

            {/* Central Ornate 3D Metallic Sun-Moon Needle Pointer */}
            <motion.div
              animate={{ rotate: needleRotation }}
              transition={{
                duration: isSpinning ? 1.8 : 0.4,
                ease: [0.15, 0.85, 0.35, 1],
              }}
              className="relative w-full h-full flex items-center justify-center pointer-events-none z-30"
            >
              {/* Gold Sunburst Needle Shaft extending out to the card radius */}
              <div className="absolute w-2 h-52 sm:h-68 bg-gradient-to-t from-purple-950 via-amber-400 to-amber-200 rounded-full shadow-[0_0_25px_rgba(234,179,8,0.9)] flex flex-col items-center justify-between py-0.5">
                {/* Sunburst Needle Tip (Points directly at the target card) */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 border border-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,1)] -mt-2.5">
                  <Sun className="w-3 h-3 text-slate-950 animate-spin-slow" />
                </div>
                {/* Crescent Moon Tail */}
                <div className="w-4.5 h-4.5 rounded-full bg-indigo-900 border border-amber-300/80 flex items-center justify-center shadow-md -mb-2">
                  <Moon className="w-2.5 h-2.5 text-amber-300" />
                </div>
              </div>
            </motion.div>

            {/* Core Gemstone Center Glass Button (Compact so it never overlaps cards) */}
            <motion.button
              type="button"
              onClick={handleSpinCompass}
              disabled={isSpinning || isAnalyzing}
              animate={isSpinning ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
              className="absolute z-40 w-20 h-20 xs:w-22 xs:h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 via-purple-900 to-slate-950 border-2 border-amber-300 shadow-[0_0_40px_rgba(234,179,8,0.9)] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden"
            >
              <Compass className={`w-8 h-8 text-amber-300 ${isSpinning ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-bold text-amber-100 mt-0.5 font-serif-mystic">
                {isSpinning ? 'หมุนสแกน...' : 'หมุนเข็มทิศ'}
              </span>
            </motion.button>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2.5 mt-5">
            <button
              type="button"
              disabled={isSpinning || isAnalyzing}
              onClick={handleSpinCompass}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>หมุนเข็มทิศ 1 ครั้ง</span>
            </button>

            {targetCount - selectedCards.length > 1 && (
              <button
                type="button"
                disabled={isSpinning || isAnalyzing}
                onClick={handleSpinAll}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>สแกนดวงดาวทั้งหมด</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manifested Compass Cards Grid */}
      <AnimatePresence>
        {selectedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl px-2 my-2 flex flex-col items-center select-none"
          >
            <div className="flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-purple-950/90 border border-amber-400/50 text-xs sm:text-sm font-bold text-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ไพ่ประจำเรือนชะตาที่ได้รับการสแกน ({selectedCards.length} / {targetCount} ใบ)</span>
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
          <span>ทำพิธีหมุนเข็มทิศใหม่</span>
        </motion.button>
      )}
    </div>
  );
};
