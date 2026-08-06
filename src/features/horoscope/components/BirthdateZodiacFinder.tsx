import React from 'react';
import { Calendar, Search } from 'lucide-react';

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">วันที่เกิด:</label>
          <select
            value={birthDay}
            onChange={(e) => setBirthDay(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                วันที่ {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">เดือนเกิด:</label>
          <select
            value={birthMonth}
            onChange={(e) => setBirthMonth(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={`sm:mt-5 p-2.5 rounded-xl ${primaryBtnStyle} font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer`}
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาราศีทันที</span>
        </button>
      </div>
    </form>
  );
};
