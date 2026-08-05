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
      <div className="flex justify-between items-center px-1.5">
        <label className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-purple-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>กรอกคำถามของคุณ</span>
        </label>
        
        <div className="flex items-center gap-2">
          {question ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setQuestion('')}
              aria-label="ล้างคำถาม"
              className="text-xs text-amber-300 hover:text-amber-100 cursor-pointer flex items-center gap-1.5 font-medium transition-colors bg-purple-950/90 hover:bg-purple-900 px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-xs"
            >
              <X className="w-3.5 h-3.5 text-amber-300" />
              <span>ล้างคำถาม</span>
            </button>
          ) : (
            <span className="text-xs text-purple-300/70 font-medium">
              (หากไม่กรอก ระบบจะทำนายภาพรวมให้)
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
          placeholder="พิมพ์คำถามหรือเรื่องที่ต้องการดูดวงอย่างละเอียด เช่น เรื่องความรักกับคนปัจจุบันช่วง 3 เดือนนี้จะเป็นอย่างไร? ควรย้ายงานใหม่ตอนนี้ดีไหม?..."
          rows={3}
          className="w-full p-4 sm:p-5 min-h-[110px] sm:min-h-[135px] rounded-2xl bg-purple-950/50 backdrop-blur-xl border border-amber-400/40 hover:border-amber-400/70 text-sm sm:text-base text-amber-50 placeholder-slate-400/70 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all resize-y shadow-inner leading-relaxed"
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
