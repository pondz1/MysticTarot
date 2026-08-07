import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0a0914]/80 py-6 sm:py-8 text-xs text-slate-500 mb-14 md:mb-0">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400/80" aria-hidden="true" />
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="font-semibold text-slate-300 text-xs sm:text-sm">MysticVerse</p>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
              ศูนย์รวมศาสตร์ทำนาย · AI — เพื่อความบันเทิงและข้อคิด ไม่ใช่คำแนะนำทางการแพทย์หรือการเงิน
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <nav aria-label="ลิงก์ท้ายหน้า" className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-[11px]">
            <Link to="/tarot" className="text-slate-500 hover:text-amber-200 transition-colors">
              ไพ่ยิปซี
            </Link>
            <Link to="/tarot/encyclopedia" className="text-slate-500 hover:text-amber-200 transition-colors">
              สารานุกรม
            </Link>
            <Link to="/horoscope" className="text-slate-500 hover:text-amber-200 transition-colors">
              12 ราศี
            </Link>
            <Link to="/" className="text-slate-500 hover:text-amber-200 transition-colors">
              หน้าแรก
            </Link>
          </nav>
          <p className="text-[11px] sm:text-xs text-slate-600">© 2026 MysticVerse</p>
        </div>
      </div>
    </footer>
  );
};
