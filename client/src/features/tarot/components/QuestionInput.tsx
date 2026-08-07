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
    <div className="w-full max-w-2xl mx-auto my-3 sm:my-4 flex flex-col gap-2 sm:gap-2.5">
      <div className="flex justify-between items-center gap-2 px-1.5">
        <label
          htmlFor="tarot-question-input"
          className="text-xs sm:text-sm font-semibold text-amber-100/95 flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>ขั้นตอนที่ 2 · คำถามของคุณ</span>
        </label>

        <div className="flex items-center gap-2 shrink-0">
          {question ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setQuestion('')}
              aria-label="ล้างคำถาม"
              className="text-xs text-amber-200 hover:text-amber-50 cursor-pointer flex items-center gap-1.5 font-medium transition-colors bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 min-h-[36px] rounded-lg border border-slate-700"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ล้าง</span>
            </button>
          ) : (
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium text-right">
              ข้ามได้ · ระบบทำนายภาพรวม
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full">
        <textarea
          id="tarot-question-input"
          name="tarot-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
          placeholder="เช่น ความรักช่วง 3 เดือนนี้จะเป็นอย่างไร? ควรย้ายงานไหม?…"
          rows={3}
          className="w-full p-4 sm:p-5 min-h-[100px] sm:min-h-[120px] rounded-2xl bg-slate-950/80 border border-slate-700 hover:border-amber-400/40 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/30 transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Preset Suggestion Chips */}
      <div className="flex overflow-x-auto sm:flex-wrap items-center gap-2 pt-1 pb-1 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
        <span className="text-xs text-purple-300/70 font-medium mr-1 shrink-0">หัวข้อแนะนำ:</span>
        {PRESET_QUESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => setQuestion(item.prompt)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 hover:border-amber-400/60 text-purple-200 hover:text-amber-200 transition-all cursor-pointer shadow-sm shrink-0 font-medium"
            >
              <Icon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
