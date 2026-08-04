import React, { useState } from 'react';
import { TAROT_CARDS } from '../data/tarotCards';
import type { TarotCard } from '../data/tarotCards';
import { TarotArt } from './TarotArt';
import { X, BookOpen, Search } from 'lucide-react';

interface CardListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: TarotCard) => void;
}

export const CardListModal: React.FC<CardListModalProps> = ({ isOpen, onClose, onSelectCard }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCards = TAROT_CARDS.filter(
    (c) =>
      c.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg md:text-xl font-bold font-serif-mystic text-gold-gradient">
              สารานุกรมไพ่ยิปซี Major Arcana (22 ใบ)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4 shrink-0">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อไพ่ (ภาษาไทย/อังกฤษ) หรือคีย์เวิร์ด..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-purple-500/40 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-1">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectCard(card)}
              className="group cursor-pointer flex flex-col items-center p-2 rounded-xl glass-panel hover:glass-panel-gold border border-amber-500/20 hover:border-amber-400/60 transition-all hover:scale-105"
            >
              <div className="w-full h-44 mb-2">
                <TarotArt card={card} size="sm" />
              </div>
              <p className="text-xs font-bold text-amber-200 text-center truncate w-full">
                {card.nameTh.split(' (')[0]}
              </p>
              <p className="text-[10px] text-purple-300/70 text-center truncate w-full">
                {card.nameEn}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
