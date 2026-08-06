import React from 'react';
import { Sparkles } from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { DAYS_OF_WEEK } from '../data/thaiAstrologyData';

interface ThaiAstrologyFormProps {
  birthDate: string;
  setBirthDate: (date: string) => void;
  dayIndex: number;
  setDayIndex: (index: number) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  useAi: boolean;
  cardBgStyle: string;
  primaryBtnStyle: string;
}

export const ThaiAstrologyForm: React.FC<ThaiAstrologyFormProps> = ({
  birthDate,
  setBirthDate,
  dayIndex,
  setDayIndex,
  onSubmit,
  isLoading,
  useAi,
  cardBgStyle,
  primaryBtnStyle,
}) => {
  return (
    <div className={`relative z-20 ${cardBgStyle} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">วัน/เดือน/ปี เกิด (ค.ศ.):</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full h-[46px] px-4 rounded-xl sm:rounded-2xl bg-slate-950/90 border border-slate-800 text-white focus:outline-none focus:border-rose-400 text-sm font-mono shadow-md"
          />
        </div>
        <div>
          <CustomSelect
            label="เกิดตรงกับวัน:"
            options={DAYS_OF_WEEK.map((d, idx) => ({
              value: idx,
              label: `${d.nameTh} (${d.element})`,
            }))}
            value={dayIndex}
            onChange={(val) => setDayIndex(Number(val))}
            accentColor="rose"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full h-[46px] px-6 rounded-xl sm:rounded-2xl ${primaryBtnStyle} font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{useAi ? 'คำนวณกราฟชีวิตด้วย AI' : 'คำนวณกราฟชีวิต'}</span>
        </button>
      </form>
    </div>
  );
};
