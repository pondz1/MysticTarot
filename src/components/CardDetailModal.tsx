import React from 'react';
import type { TarotCard } from '../data/tarotCards';
import { TarotArt } from './TarotArt';
import { X, Sparkles, Heart, Briefcase, Coins, ShieldAlert, Compass } from 'lucide-react';

interface CardDetailModalProps {
  card: TarotCard | null;
  isReversed?: boolean;
  onClose: () => void;
  isFromList?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, isReversed = false, onClose, isFromList = false }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-y-auto">
        
        {/* Close / Back Header Buttons */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/20">
          {isFromList ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 bg-purple-950/80 px-3 py-1.5 rounded-lg border border-amber-400/30 transition-colors"
            >
              <span>← กลับไปสารานุกรมไพ่</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Card Visual Artwork */}
          <div className="w-full md:w-56 h-80 shrink-0 mx-auto">
            <TarotArt card={card} isReversed={isReversed} size="full" />
          </div>

          {/* Card Interpretations */}
          <div className="flex-1 flex flex-col gap-4 text-slate-100 font-prompt">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  {card.romanNumeral} - Major Arcana
                </span>
                <span className="text-xs text-purple-300">{card.element}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-serif-mystic text-gold-gradient mt-1">
                {card.nameTh}
              </h2>
              <p className="text-xs text-purple-300/80">{card.nameEn} • {card.planetOrSign}</p>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1.5">
              {card.keywords.map((kw, i) => (
                <span key={i} className="text-[11px] bg-purple-950/80 text-amber-200 px-2 py-0.5 rounded border border-purple-500/30">
                  #{kw}
                </span>
              ))}
            </div>

            {/* Meanings */}
            <div className="space-y-3 text-xs md:text-sm">
              <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  ความหมายเมื่อไพ่ตั้งหัว (Upright)
                </h4>
                <p className="text-slate-200">{card.uprightMeaning}</p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-rose-500/30">
                <h4 className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ความหมายเมื่อไพ่กลับหัว (Reversed)
                </h4>
                <p className="text-slate-200">{card.reversedMeaning}</p>
              </div>
            </div>

            {/* Life Aspects */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-amber-500/20 text-xs">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <p><strong className="text-pink-300">ความรัก:</strong> {card.love}</p>
              </div>

              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p><strong className="text-amber-300">การงาน:</strong> {card.work}</p>
              </div>

              <div className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p><strong className="text-yellow-300">การเงิน:</strong> {card.finance}</p>
              </div>

              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p><strong className="text-cyan-300">คำแนะนำ:</strong> {card.advice}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
