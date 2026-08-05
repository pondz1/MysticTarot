import React, { useState, useEffect, useRef } from 'react';
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
  const [radius, setRadius] = useState<number>(150);

  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Responsive circle radius calculation taking into account both viewport width AND height
  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Max radius so top/bottom cards when selected never overflow top/bottom screen boundaries
      const maxByHeight = Math.max(90, Math.floor((h - 280) / 2 - 40));

      if (w < 480) {
        setRadius(Math.min(115, maxByHeight));
      } else if (w < 768) {
        setRadius(Math.min(150, maxByHeight));
      } else {
        setRadius(Math.min(195, maxByHeight));
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const totalCards = deck.length;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    const deltaX = e.clientX - dragStartX;

    if (dt > 0) {
      velocityRef.current = (e.clientX - lastXRef.current) / dt;
    }

    setRotationDeg((prev) => prev + deltaX * 0.5);
    setDragStartX(e.clientX);
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Inertia spin momentum
    let currentVel = velocityRef.current * 14;
    if (Math.abs(currentVel) > 0.4) {
      const decay = () => {
        currentVel *= 0.92;
        if (Math.abs(currentVel) > 0.05) {
          setRotationDeg((prev) => prev + currentVel);
          animFrameRef.current = requestAnimationFrame(decay);
        }
      };
      animFrameRef.current = requestAnimationFrame(decay);
    }
  };

  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center py-2 sm:py-4 px-2 select-none">
      {/* Title */}
      <div className="text-center mb-1.5 sm:mb-2">
        <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Orbit className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
          <span>กงล้อดวงดาว 360° (Full Cosmic Wheel)</span>
        </span>
        <p className="text-[10px] sm:text-xs text-purple-300/80 mt-0.5">
          ปัดหมุนกงล้อจักรวาลแล้วแตะเลือกไพ่ที่ต้องการ
        </p>
      </div>

      {/* Orbit Controls */}
      <div className="flex items-center gap-3 mt-1 sm:mt-2 mb-2 sm:mb-4">
        <button
          type="button"
          onClick={() => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            setRotationDeg((prev) => prev + 30);
          }}
          className="flex items-center gap-1 text-[10px] sm:text-[11px] px-3 py-1.5 rounded-lg bg-purple-950/80 border border-amber-400/30 text-amber-200 hover:bg-purple-900 transition-colors cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
          <span>หมุนซ้าย</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            setRotationDeg((prev) => prev - 30);
          }}
          className="flex items-center gap-1 text-[10px] sm:text-[11px] px-3 py-1.5 rounded-lg bg-purple-950/80 border border-amber-400/30 text-amber-200 hover:bg-purple-900 transition-colors cursor-pointer shadow-sm"
        >
          <span>หมุนขวา</span>
          <RotateCw className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>

      {/* Full 360 Radial Circle Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full max-w-4xl sm:max-w-5xl h-[340px] xs:h-[380px] sm:h-[460px] md:h-[530px] flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing touch-pan-y my-2 sm:my-4 px-4 py-4"
      >
        {/* Central Cosmic Core Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-amber-400/30 bg-purple-950/40 backdrop-blur-xs flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <Orbit className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400/60 animate-spin-slow" />
          </div>
        </div>

        {/* Rotatable Wheel Container - hardware accelerated transform */}
        <div
          style={{
            transform: `rotate(${rotationDeg}deg)`,
            transformOrigin: 'center center',
            willChange: 'transform',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {deck.map((card, idx) => {
            const isPicked = selectedCards.some((sc) => sc.card.id === card.id);

            // Use 2 concentric rings for large decks (56/78 cards) to avoid crowding and boost 60FPS performance
            const isLargeDeck = totalCards > 50;
            const useInnerRing = isLargeDeck && idx % 2 === 1;

            const ringCount = isLargeDeck ? (useInnerRing ? Math.floor(totalCards / 2) : Math.ceil(totalCards / 2)) : totalCards;
            const ringIdx = isLargeDeck ? Math.floor(idx / 2) : idx;
            const ringAngleStep = 360 / ringCount;

            const baseAngle = ringIdx * ringAngleStep;
            const rad = (baseAngle * Math.PI) / 180;

            const effectiveRadius = (useInnerRing ? radius * 0.65 : radius) + (isPicked ? 12 : 0);
            const x = Math.sin(rad) * effectiveRadius;
            const y = -Math.cos(rad) * effectiveRadius;

            return (
              <div
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAnalyzing) onPickCard(card);
                }}
                style={{
                  position: 'absolute',
                  transform: `translate3d(${x}px, ${y}px, 0px) rotate(${baseAngle}deg) scale(${isPicked ? 1.15 : 1})`,
                  transformOrigin: 'center center',
                  zIndex: isPicked ? 50 : useInnerRing ? 20 : 10,
                  willChange: 'transform',
                }}
                className={`w-13 h-20 xs:w-15 xs:h-23 sm:w-18 sm:h-28 md:w-20 md:h-32 rounded-lg cursor-pointer shadow-xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none transition-all duration-150 ${
                  isPicked
                    ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_35px_rgba(234,179,8,0.95)]'
                    : 'border-amber-400/40 hover:border-amber-300 hover:scale-110 hover:shadow-[0_0_24px_rgba(234,179,8,0.6)]'
                }`}
              >
                <img
                  src="/cards/card_back.jpg"
                  alt="Tarot Back"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {isPicked && (
                  <div className="absolute top-1 right-1 z-20 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-3 h-3 fill-slate-950 text-amber-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Touch Swipe Hint */}
      {!isSelectionComplete && (
        <p className="text-[10px] sm:text-xs text-purple-300/70 mt-4 sm:mt-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-800/30">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>ปัดเลื่อนซ้าย-ขวาเพื่อหมุนกงล้อ แล้วแตะเลือกไพ่ที่ต้องการ</span>
        </p>
      )}
    </div>
  );
};
