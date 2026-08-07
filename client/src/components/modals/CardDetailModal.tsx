import React from 'react';
import type { TarotCard } from '../../features/tarot/data/tarotCards';
import { TarotArt } from '../common/TarotArt';
import { ModalShell } from '../common/ModalShell';
import { X, Sparkles, Heart, Briefcase, Coins, ShieldAlert, Compass } from 'lucide-react';

interface CardDetailModalProps {
  card: TarotCard | null;
  isReversed?: boolean;
  onClose: () => void;
  isFromList?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isReversed = false,
  onClose,
  isFromList = false,
}) => {
  return (
    <ModalShell
      isOpen={!!card}
      onClose={onClose}
      titleId="card-detail-title"
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[90vh] glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-y-auto overscroll-contain"
    >
      {/* Close / Back Header Buttons */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/20">
        {isFromList ? (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-amber-200 hover:text-amber-100 bg-slate-900 px-3 py-1.5 min-h-[36px] rounded-lg border border-amber-400/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>← กลับไปสารานุกรมไพ่</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดรายละเอียดไพ่"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {card && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full sm:w-56 aspect-[1/1.68] shrink-0 mx-auto">
            <TarotArt card={card} isReversed={isReversed} size="full" />
          </div>

          <div className="flex-1 flex flex-col gap-4 text-slate-100 font-prompt">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  {card.romanNumeral} - Major Arcana
                </span>
                <span className="text-xs text-purple-300">{card.element}</span>
              </div>
              <h2 id="card-detail-title" className="text-xl md:text-2xl font-bold text-amber-100 mt-1">
                {card.nameTh}
                {isReversed ? ' (กลับหัว)' : ''}
              </h2>
              <p className="text-xs text-slate-400">
                {card.nameEn} • {card.planetOrSign}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {card.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-slate-950/80 text-amber-200 px-2 py-0.5 rounded border border-slate-700"
                >
                  #{kw}
                </span>
              ))}
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  ความหมายเมื่อไพ่ตั้งหัว (Upright)
                </h4>
                <p className="text-slate-200 leading-relaxed">{card.uprightMeaning}</p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-rose-500/30">
                <h4 className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                  ความหมายเมื่อไพ่กลับหัว (Reversed)
                </h4>
                <p className="text-slate-200 leading-relaxed">{card.reversedMeaning}</p>
              </div>

              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  <strong className="text-pink-300">ความรัก:</strong> {card.love}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  <strong className="text-amber-300">การงาน:</strong> {card.work}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  <strong className="text-yellow-300">การเงิน:</strong> {card.finance}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  <strong className="text-cyan-300">คำแนะนำ:</strong> {card.advice}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
};
