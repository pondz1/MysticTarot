import React from 'react';
import { HelpCircle, Heart, Briefcase, Coins, Stethoscope, Sparkles } from 'lucide-react';

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
    <div className="w-full max-w-xl mx-auto my-3 flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs uppercase tracking-widest font-semibold text-purple-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          กรอกสิ่งที่อยากรู้ / คำถามของคุณ
        </label>
        <span className="text-[11px] text-purple-400/70">
          (ไม่กรอก = ทำนายภาพรวม)
        </span>
      </div>

      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
          placeholder="เช่น เรื่องความรักกับคนปัจจุบันจะเป็นอย่างไร? ควรย้ายงานใหม่ดีไหม?..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-slate-100 placeholder-slate-400/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all resize-none shadow-inner"
        />
        {question && (
          <button
            type="button"
            onClick={() => setQuestion('')}
            className="absolute top-2 right-3 text-xs text-purple-400 hover:text-amber-300"
          >
            ล้างคำถาม
          </button>
        )}
      </div>

      {/* Preset Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-purple-300/60 mr-1">หัวข้อแนะนำ:</span>
        {PRESET_QUESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => setQuestion(item.prompt)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 hover:border-amber-400/50 text-purple-200 hover:text-amber-200 transition-all cursor-pointer shadow-sm"
            >
              <Icon className="w-3 h-3 text-amber-300" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
