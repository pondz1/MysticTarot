import React, { useState } from 'react';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Orbit, CheckCircle2, RotateCcw, RotateCw, Eye } from 'lucide-react';

interface OrbitDeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  onPickCard: (card: TarotCard) => void;
}

export const OrbitDeckView: React.FC<OrbitDeckViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  onPickCard,
}) => {
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const totalCards = deck.length;
  const angleStep = 360 / totalCards;
  const radius = 240; // 3D Orbit radius in px

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    setRotationDeg((prev) => prev + deltaX * 0.4);
    setDragStartX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center py-4 select-none">
      {/* Title */}
      <div className="text-center mb-2">
        <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Orbit className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>กงล้อดวงดาว 3D (Cosmic Wheel)</span>
        </span>
        <p className="text-[11px] text-purple-300/80 mt-0.5">
          ลากหมุนกงล้อจักรวาลแล้วแตะเลือกไพ่ ({selectedCards.length} / {targetCount} ใบ)
        </p>
      </div>

      {/* Orbit Controls */}
      <div className="flex items-center gap-3 my-1">
        <button
          type="button"
          onClick={() => setRotationDeg((prev) => prev + 30)}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-950/80 border border-amber-400/30 text-amber-200 hover:bg-purple-900 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-amber-300" />
          <span>หมุนซ้าย</span>
        </button>

        <button
          type="button"
          onClick={() => setRotationDeg((prev) => prev - 30)}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-950/80 border border-amber-400/30 text-amber-200 hover:bg-purple-900 transition-all cursor-pointer"
        >
          <span>หมุนขวา</span>
          <RotateCw className="w-3 h-3 text-amber-300" />
        </button>
      </div>

      {/* 3D Orbit Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full max-w-2xl h-[320px] sm:h-[360px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y my-2"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center transform-style-3d transition-transform duration-75"
          style={{
            transform: `rotateY(${rotationDeg}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {deck.map((card, idx) => {
            const isPicked = selectedCards.some((sc) => sc.card.id === card.id);
            const angle = idx * angleStep;

            return (
              <div
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAnalyzing) onPickCard(card);
                }}
                style={{
                  position: 'absolute',
                  transform: `rotateY(${angle}deg) translateZ(${radius}px) ${isPicked ? 'translateY(-20px) scale(1.1)' : ''}`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                className={`w-20 h-32 sm:w-24 sm:h-38 rounded-xl cursor-pointer shadow-2xl border bg-slate-900 flex flex-col items-center justify-center p-1 select-none transition-transform duration-200 ${
                  isPicked
                    ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_25px_rgba(234,179,8,0.9)] z-50'
                    : 'border-amber-400/40 hover:border-amber-300'
                }`}
              >
                <img
                  src="/cards/card_back.jpg"
                  alt="Tarot Back"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {isPicked && (
                  <div className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-4 h-4 fill-slate-950 text-amber-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Touch Swipe Hint */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>ลากหน้าจอหมุนกงล้อ 3D แล้วแตะเลือกไพ่ที่ต้องการ</span>
        </p>
      )}
    </div>
  );
};
