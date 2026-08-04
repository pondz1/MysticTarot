import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../data/tarotCards';
import type { DrawnCard } from '../../types/tarot';
import { Zap, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface AutoDeckViewProps {
  deck: TarotCard[];
  selectedCards: DrawnCard[];
  targetCount: number;
  isAnalyzing: boolean;
  isShuffling: boolean;
  onAutoPick: () => void;
  onReset: () => void;
}

export const AutoDeckView: React.FC<AutoDeckViewProps> = ({
  selectedCards,
  targetCount,
  isAnalyzing,
  isShuffling,
  onAutoPick,
  onReset,
}) => {
  const isSelectionComplete = selectedCards.length === targetCount;

  return (
    <div className="w-full flex flex-col items-center py-6 select-none">
      {/* Title */}
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>พิธีกรรมเปิดไพ่ตามสิริมงคลจักรวาล</span>
        </span>
        <p className="text-xs text-purple-200/80 mt-1 max-w-sm">
          {isSelectionComplete
            ? 'จักรวาลคัดสรรไพ่เรียบร้อย! ตรวจสอบรายการไพ่และกดยืนยันด้านล่าง'
            : 'ตั้งจิตอธิษฐานนึกถึงคำถาม แล้วแตะปุ่มด้านล่างเพื่อให้จักรวาลส่งมอบไพ่'}
        </p>
      </div>

      {/* Cosmic Auto Pick Button */}
      <div className="my-4 flex flex-col items-center justify-center">
        {!isSelectionComplete ? (
          <motion.button
            type="button"
            disabled={isShuffling || isAnalyzing}
            onClick={onAutoPick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-slate-950 font-bold text-sm border border-amber-200 shadow-[0_0_30px_rgba(234,179,8,0.6)] disabled:opacity-40 transition-all cursor-pointer"
          >
            <Sparkles className={`w-5 h-5 ${isShuffling ? 'animate-spin text-slate-950' : 'text-slate-950 fill-slate-950'}`} />
            <span>{isShuffling ? 'กำลังสื่อสารกับจักรวาล...' : 'กดให้จักรวาลเลือกไพ่ให้'}</span>
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/80 border border-amber-400/50 text-amber-200 text-xs font-bold shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>จักรวาลส่งมอบไพ่ครบ {targetCount} ใบแล้ว</span>
            </div>

            {!isAnalyzing && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                <span>ให้จักรวาลเลือกให้ใหม่</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Cards Display Grid */}
      {isSelectionComplete && (
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl px-4 mt-2">
          {selectedCards.map((sc, idx) => (
            <motion.div
              key={sc.card.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative w-20 h-32 sm:w-24 sm:h-38 rounded-xl border border-amber-400/60 bg-slate-900 overflow-hidden shadow-lg flex flex-col items-center justify-center"
            >
              <img src="/cards/card_back.jpg" alt="Back" className="w-full h-full object-cover rounded-xl" />
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 fill-slate-950 text-amber-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
