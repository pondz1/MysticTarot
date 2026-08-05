import React, { useState, useEffect, useRef } from 'react';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Orbit, CheckCircle2, RotateCcw, RotateCw, Eye, Sparkles, Compass } from 'lucide-react';

interface OrbitDeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  isShuffling?: boolean;
  onShuffle?: () => void;
  onPickCard: (card: TarotCard) => void;
}

export const OrbitDeckView: React.FC<OrbitDeckViewProps> = ({
  deck,
  selectedCards,
  targetCount,
  isAnalyzing,
  isShuffling = false,
  onShuffle,
  onPickCard,
}) => {
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [radius, setRadius] = useState<number>(150);
  const [isSpinningFast, setIsSpinningFast] = useState(false);

  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Trigger cosmic spin shuffle animation when isShuffling changes
  useEffect(() => {
    if (isShuffling) {
      setIsSpinningFast(true);
      setRotationDeg((prev) => prev + 1080);
      const timer = setTimeout(() => setIsSpinningFast(false), 600);
      return () => clearTimeout(timer);
    } else {
      setIsSpinningFast(false);
    }
  }, [isShuffling]);

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
      setIsSpinningFast(true);
      const decay = () => {
        currentVel *= 0.92;
        if (Math.abs(currentVel) > 0.05) {
          setRotationDeg((prev) => prev + currentVel);
          animFrameRef.current = requestAnimationFrame(decay);
        } else {
          setIsSpinningFast(false);
        }
      };
      animFrameRef.current = requestAnimationFrame(decay);
    }
  };

  const handleRotateButton = (direction: 'left' | 'right') => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsSpinningFast(true);
    const delta = direction === 'left' ? 45 : -45;
    setRotationDeg((prev) => prev + delta);
    setTimeout(() => setIsSpinningFast(false), 400);
  };

  const isSelectionComplete = selectedCards.length === targetCount;
  const isWheelActive = isDragging || isSpinningFast;

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

      {/* Orbit Controls - Elevated z-30 layer above wheel stage */}
      <div className="relative z-30 pointer-events-auto flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 mb-3 sm:mb-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRotateButton('left');
          }}
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 hover:text-amber-100 transition-all cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
          <span>หมุนซ้าย</span>
        </button>

        {onShuffle && (
          <button
            type="button"
            disabled={isShuffling || selectedCards.length > 0 || isAnalyzing}
            onClick={(e) => {
              e.stopPropagation();
              onShuffle();
            }}
            className="flex items-center gap-1.5 text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-xl bg-amber-600/40 hover:bg-amber-600/60 border border-amber-400/60 text-amber-100 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'กำลังสับ...' : 'หมุนสับไพ่'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRotateButton('right');
          }}
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/40 text-amber-200 hover:text-amber-100 transition-all cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
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
        {/* Central Cosmic Core Icon & Multi-layer Glowing Aura Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {/* Outer Pulsing Aura Ring */}
          <div
            className={`w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-amber-400/30 bg-purple-950/30 backdrop-blur-xs flex items-center justify-center transition-all duration-300 ${
              isWheelActive
                ? 'scale-110 border-amber-400/60 shadow-[0_0_60px_rgba(234,179,8,0.5)]'
                : 'shadow-[0_0_30px_rgba(234,179,8,0.25)]'
            }`}
          >
            {/* Spinning Stardust Ring */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-dashed border-purple-400/50 animate-spin-slow flex items-center justify-center relative">
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1.5 left-1/2 -translate-x-1/2 animate-pulse" />
              <Sparkles className="w-3 h-3 text-purple-300 absolute -bottom-1.5 left-1/2 -translate-x-1/2 animate-pulse" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute top-1/2 -left-1.5 -translate-y-1/2 animate-pulse" />
              <Sparkles className="w-3 h-3 text-purple-300 absolute top-1/2 -right-1.5 -translate-y-1/2 animate-pulse" />

              {/* Inner Glowing Center Core */}
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400/30 via-purple-900/70 to-purple-950/95 border border-amber-400/70 flex items-center justify-center shadow-inner">
                <Compass className={`w-7 h-7 sm:w-10 sm:h-10 text-amber-400 transition-transform duration-300 ${isWheelActive ? 'animate-spin' : 'animate-spin-slow'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Rotatable Wheel Container - GPU Hardware-Accelerated Single Compositing Layer */}
        {(() => {
          const wheelScale = isShuffling || isSpinningFast
            ? 1.15
            : isDragging
              ? 1 + Math.min(0.12, Math.abs(velocityRef.current) * 0.12)
              : 1;

          return (
            <div
              style={{
                transform: `rotate(${rotationDeg}deg) scale(${wheelScale})`,
                transformOrigin: 'center center',
                willChange: 'transform',
                transition: isDragging
                  ? 'none'
                  : isShuffling
                    ? 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)'
                    : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {deck.map((card, idx) => {
                const isPicked = selectedCards.some((sc) => sc.card.id === card.id);
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
                    className={`w-13 h-20 xs:w-15 xs:h-23 sm:w-18 sm:h-28 md:w-20 md:h-32 rounded-lg cursor-pointer shadow-xl border bg-slate-900 flex flex-col items-center justify-center p-0.5 select-none transition-transform duration-150 ${
                      isPicked
                        ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_35px_rgba(234,179,8,0.95)]'
                        : isWheelActive
                          ? 'border-amber-300/80 shadow-[0_0_20px_rgba(234,179,8,0.5)]'
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
          );
        })()}
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
