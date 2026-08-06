import React from 'react';
import { Calendar, Search } from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';

interface BirthdateZodiacFinderProps {
  birthDay: number;
  setBirthDay: (day: number) => void;
  birthMonth: number;
  setBirthMonth: (month: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  primaryBtnStyle: string;
}

const MONTH_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `วันที่ ${i + 1}`,
}));

const MONTH_OPTIONS = MONTH_NAMES.map((m, idx) => ({
  value: idx + 1,
  label: m,
}));

export const BirthdateZodiacFinder: React.FC<BirthdateZodiacFinderProps> = ({
  birthDay,
  setBirthDay,
  birthMonth,
  setBirthMonth,
  onSubmit,
  primaryBtnStyle,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-4 animate-scale-up"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
        <Calendar className="w-4 h-4 text-amber-400" />
        <span>ระบุวันเกิดของคุณเพื่อค้นหาราศีอัตโนมัติ:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <CustomSelect
            label="วันที่เกิด:"
            options={DAY_OPTIONS}
            value={birthDay}
            onChange={(val) => setBirthDay(Number(val))}
            accentColor="amber"
          />
        </div>

        <div>
          <CustomSelect
            label="เดือนเกิด:"
            options={MONTH_OPTIONS}
            value={birthMonth}
            onChange={(val) => setBirthMonth(Number(val))}
            accentColor="amber"
          />
        </div>

        <button
          type="submit"
          className={`h-[46px] rounded-xl sm:rounded-2xl ${primaryBtnStyle} font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer`}
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาราศีทันที</span>
        </button>
      </div>
    </form>
  );
};
