import React from 'react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import {
  PrimaryAnalyzeButton,
  analyzeButtonLabel,
} from '../../../components/common/PredictionPanel';
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
}) => {
  return (
    <div className="relative z-20 rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/40 space-y-5">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
      >
        <div className="space-y-1.5">
          <label htmlFor="thai-birth-date" className="block text-xs font-semibold text-slate-400">
            วันเกิด (ค.ศ.)
          </label>
          <input
            id="thai-birth-date"
            name="birth-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full h-[46px] px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus-visible:border-rose-400 focus-visible:ring-1 focus-visible:ring-rose-400/40 text-sm font-mono"
          />
        </div>
        <div>
          <CustomSelect
            label="เกิดตรงกับวัน"
            options={DAYS_OF_WEEK.map((d, idx) => ({
              value: idx,
              label: `${d.nameTh} (${d.element})`,
            }))}
            value={dayIndex}
            onChange={(val) => setDayIndex(Number(val))}
            accentColor="rose"
          />
        </div>
        <PrimaryAnalyzeButton
          type="submit"
          loading={isLoading}
          fullWidth
          label={analyzeButtonLabel(useAi, 'กราฟชีวิต')}
        />
      </form>
    </div>
  );
};
