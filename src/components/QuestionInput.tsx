import React from 'react';
import { HelpCircle, Heart, Briefcase, Coins, Stethoscope, Sparkles, X } from 'lucide-react';

interface QuestionInputProps {
  question: string;
  setQuestion: (q: string) => void;
  disabled?: boolean;
}

const PRESET_QUESTIONS = [
  { icon: Heart, label: 'ความรักความสัมพันธ์', prompt: 'แนวโน้มความรักความสัมพันธ์ของฉันในอนาคตอันใกล้นี้จะเป็นอย่างไร?' },
  { icon: Briefcase, label: 'การงานและอาชีพ', prompt: 'ทิศทางการงาน อุปสรรค และโอกาสเติบโตในสายอาชีพช่วงนี้เป็นอย่างไร?' },
  { icon: Coins, label: 'การเงินและโชคลาภ', prompt: 'สภาพคล่องทางการเงิน รายรับ-รายจ่าย และโชคลาภของฉันเป็นอย่างไร?' },
  { icon: Stethoscope, label: 'สุขภาพและจิตใจ', prompt: 'สภาวะพลังงาน สุขภาพกายและจิตใจที่ควรระวังในตอนนี้?' },
  { icon: Sparkles, label: 'ดวงประจำวันนี้', prompt: 'ขอคำทำนายและสารเตือนใจสำหรับดวงชะตาประจำวันนี้' }
];

export const QuestionInput: React.FC<QuestionInputProps> = ({ question, setQuestion, disabled }) => {
  return (
    <div className="w-full max-w-xl mx-auto my-2 sm:my-3 flex flex-col gap-1.5 sm:gap-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-semibold text-purple-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>กรอกคำถามของคุณ</span>
        </label>
        <span className="text-[10px] sm:text-[11px] text-purple-400/70">
          (ไม่กรอก = ทำนายภาพรวม)
        </span>
      </div>

      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
          placeholder="เช่น เรื่องความรักกับคนปัจจุบันจะเป็นอย่างไร? ควรย้ายงานใหม่ดีไหม?..."
          rows={2}
          className="w-full pl-3.5 pr-24 py-2.5 sm:pl-4 sm:pr-28 sm:py-3 rounded-xl glass-panel text-xs sm:text-sm text-slate-100 placeholder-slate-400/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all resize-none shadow-inner"
        />
        {question && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setQuestion('')}
            className="absolute top-2 right-2.5 sm:top-2.5 sm:right-3 text-[10px] sm:text-[11px] text-amber-300 hover:text-amber-100 cursor-pointer flex items-center gap-1 font-medium transition-colors bg-purple-950/90 hover:bg-purple-900 px-2 py-0.5 rounded-md border border-amber-400/40 shadow-xs z-10"
          >
            <X className="w-3 h-3 text-amber-300" />
            <span>ล้างคำถาม</span>
          </button>
        )}
      </div>

      {/* Preset Suggestion Chips */}
      <div className="flex overflow-x-auto sm:flex-wrap items-center gap-1.5 pt-1 pb-1 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
        <span className="text-[10px] text-purple-300/60 mr-0.5 shrink-0">หัวข้อแนะนำ:</span>
        {PRESET_QUESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => setQuestion(item.prompt)}
              className="flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 hover:border-amber-400/50 text-purple-200 hover:text-amber-200 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Icon className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
