import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

interface DeckConfirmationProps {
  selectedCount: number;
  targetCount: number;
  useAi: boolean;
  setUseAi: (useAi: boolean) => void;
  onConfirm: () => void;
  isAnalyzing: boolean;
}

export const DeckConfirmation: React.FC<DeckConfirmationProps> = ({
  selectedCount,
  targetCount,
  useAi,
  setUseAi,
  onConfirm,
  isAnalyzing,
}) => {
  if (selectedCount !== targetCount || isAnalyzing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg glass-panel-gold rounded-2xl p-4 mt-2 flex flex-col items-center gap-3 text-center border border-amber-400/60 shadow-xl"
    >
      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>เลือกไพ่ครบถ้วน ({selectedCount} / {targetCount} ใบ)</span>
      </div>

      <div className="w-full flex items-center justify-center p-1 rounded-xl bg-black/60 border border-purple-500/40 gap-1">
        <button
          type="button"
          onClick={() => setUseAi(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            useAi
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>วิเคราะห์ด้วย AI</span>
        </button>

        <button
          type="button"
          onClick={() => setUseAi(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            !useAi
              ? 'bg-purple-800 text-amber-200 font-bold border border-amber-400/40 shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>คำทำนายมาตรฐาน</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 border border-amber-200 active:scale-[0.98] transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {useAi ? (
          <>
            <Sparkles className="w-5 h-5 text-purple-950 fill-purple-950" aria-hidden="true" />
            <span>ดูคำทำนายด้วย AI</span>
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5 text-purple-950" aria-hidden="true" />
            <span>ดูคำทำนายมาตรฐาน</span>
          </>
        )}
      </button>

      <p className="text-[11px] text-slate-500">
        แตะไพ่ใบอื่นในสำรับเพื่อสลับก่อนยืนยันได้
      </p>
    </motion.div>
  );
};
