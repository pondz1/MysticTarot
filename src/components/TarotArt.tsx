import React from 'react';
import type { TarotCard } from '../data/tarotCards';
import {
  Sun, Moon, Compass, Crown, Shield, Heart, Sparkles, Feather,
  Wand2, BookOpen, Flame, Scale, Anchor, Eye, Skull, Star, Music, Award, HelpCircle
} from 'lucide-react';

interface TarotArtProps {
  card: TarotCard;
  isReversed?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const TarotArt: React.FC<TarotArtProps> = ({ card, isReversed = false }) => {
  // Select icon based on card.iconSymbol
  const renderIcon = () => {
    switch (card.iconSymbol) {
      case 'sun-cloud': return <Sun className="w-12 h-12 text-amber-300 animate-pulse" />;
      case 'wand': return <Wand2 className="w-12 h-12 text-amber-300" />;
      case 'moon-stars': return <Moon className="w-12 h-12 text-blue-200" />;
      case 'crown-heart': return <Crown className="w-12 h-12 text-emerald-300" />;
      case 'shield-crown': return <Shield className="w-12 h-12 text-red-300" />;
      case 'book-open': return <BookOpen className="w-12 h-12 text-amber-200" />;
      case 'heart-sparkles': return <Heart className="w-12 h-12 text-pink-300" />;
      case 'swords': return <Compass className="w-12 h-12 text-cyan-300" />;
      case 'infinity-lion': return <Sparkles className="w-12 h-12 text-amber-300" />;
      case 'lantern': return <Feather className="w-12 h-12 text-slate-300" />;
      case 'wheel': return <Award className="w-12 h-12 text-purple-300" />;
      case 'scale-sword': return <Scale className="w-12 h-12 text-amber-200" />;
      case 'upside-down-person': return <Anchor className="w-12 h-12 text-teal-300" />;
      case 'skeleton-rose': return <Skull className="w-12 h-12 text-purple-200" />;
      case 'angel-cups': return <Flame className="w-12 h-12 text-blue-300" />;
      case 'horns-flame': return <Flame className="w-12 h-12 text-rose-400" />;
      case 'lightning-tower': return <Sparkles className="w-12 h-12 text-yellow-400" />;
      case 'big-star': return <Star className="w-12 h-12 text-sky-200" />;
      case 'crescent-moon': return <Moon className="w-12 h-12 text-indigo-300" />;
      case 'radiant-sun': return <Sun className="w-14 h-14 text-yellow-300 animate-spin-slow" />;
      case 'angel-trumpet': return <Music className="w-12 h-12 text-amber-300" />;
      case 'world-wreath': return <Eye className="w-12 h-12 text-emerald-300" />;
      default: return <HelpCircle className="w-12 h-12 text-amber-300" />;
    }
  };

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-b ${card.colorTheme} shadow-2xl flex flex-col justify-between p-3 select-none ${isReversed ? 'rotate-180' : ''}`}>
      {/* If generated artwork image exists, display full image */}
      {card.imageUrl ? (
        <div className="absolute inset-0 z-0">
          <img
            src={card.imageUrl}
            alt={card.nameEn}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>
      ) : (
        /* Mystical Pattern Overlay */
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      )}

      {/* Outer Gold Border Framing */}
      <div className="absolute inset-1 border border-amber-300/30 rounded-lg pointer-events-none z-10" />
      <div className="absolute inset-2 border border-amber-400/20 rounded-md pointer-events-none z-10" />

      {/* Card Header (Roman Numeral & Element) */}
      <div className="relative z-10 flex justify-between items-center text-amber-200 px-1 pt-1">
        <span className="font-serif-mystic font-bold text-sm tracking-widest text-shadow drop-shadow-md">{card.romanNumeral}</span>
        <span className="text-[10px] uppercase font-light tracking-wider bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/40 backdrop-blur-xs">
          {card.element.split(' ')[0]}
        </span>
      </div>

      {/* Card Central Art Illustration (Shown when no image) */}
      {!card.imageUrl && (
        <div className="relative z-10 my-auto flex flex-col items-center justify-center p-2">
          <div className="absolute w-24 h-24 rounded-full bg-amber-400/10 blur-xl animate-pulse" />
          <div className="relative p-4 rounded-full bg-black/30 border border-amber-400/40 shadow-inner flex items-center justify-center">
            {renderIcon()}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1 max-w-[90%]">
            {card.keywords.slice(0, 2).map((kw, i) => (
              <span key={i} className="text-[9px] bg-black/60 text-amber-100/90 px-1.5 py-0.5 rounded border border-amber-500/30">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer (Thai & English Name) */}
      <div className="relative z-10 text-center bg-black/75 backdrop-blur-sm p-1.5 rounded-b-md border-t border-amber-400/30 mt-auto">
        <p className="font-serif-mystic text-xs font-bold text-amber-200 truncate">{card.nameEn}</p>
        <p className="text-[10px] text-amber-100/90 truncate">{card.nameTh.split(' (')[1]?.replace(')', '') || card.nameTh}</p>
      </div>

      {/* Reversed Indicator Badge if reversed */}
      {isReversed && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-rose-950/90 text-rose-200 border border-rose-500/60 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-lg z-20 rotate-180">
          ไพ่กลับหัว
        </div>
      )}
    </div>
  );
};
