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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-2xl p-4 mt-2 flex flex-col items-center gap-3 text-center border border-amber-400/30 bg-slate-950/90"
    >
      <div className="flex items-center gap-1.5 text-emerald-300/90 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        <span>
          เลือกครบ {selectedCount}/{targetCount} ใบ
        </span>
      </div>

      <div className="w-full flex items-center justify-center p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1">
        <button
          type="button"
          onClick={() => setUseAi(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            useAi
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>AI (ใช้เครดิต)</span>
        </button>

        <button
          type="button"
          onClick={() => setUseAi(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            !useAi
              ? 'bg-slate-700 text-amber-100 font-bold border border-slate-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>มาตรฐาน (ฟรี)</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base active:scale-[0.99] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {useAi ? (
          <>
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span>ดูคำทำนายด้วย AI</span>
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            <span>ดูคำทำนายมาตรฐาน</span>
          </>
        )}
      </button>

      <p className="text-[11px] text-slate-600">แตะไพ่ใบอื่นเพื่อสลับก่อนยืนยันได้</p>
    </motion.div>
  );
};
