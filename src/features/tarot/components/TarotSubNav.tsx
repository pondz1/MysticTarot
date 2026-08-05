import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, BookOpen } from 'lucide-react';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

export const TarotSubNav: React.FC = () => {
  const location = useLocation();
  const theme = MODULE_THEMES.tarot;

  const isReadingActive = location.pathname === '/tarot' || location.pathname.startsWith('/tarot/reading');
  const isEncyclopediaActive = location.pathname.startsWith('/tarot/encyclopedia');

  return (
    <nav 
      aria-label="เมนูไพ่ยิปซี" 
      className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 backdrop-blur-md my-2 sm:my-4 shadow-xl max-w-md mx-auto w-full"
    >
      <Link
        to="/tarot"
        className={`flex-1 flex items-center justify-center gap-2 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          isReadingActive
            ? `${theme.activeNavStyle} shadow-md`
            : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:text-slate-200 hover:bg-slate-800/80'
        }`}
      >
        <Compass className={`w-4 h-4 ${isReadingActive ? 'text-amber-300' : 'text-slate-400'} shrink-0`} />
        <span className="whitespace-nowrap">ทำนายดวงไพ่ยิปซี</span>
      </Link>

      <Link
        to="/tarot/encyclopedia"
        className={`flex-1 flex items-center justify-center gap-2 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          isEncyclopediaActive
            ? `${theme.activeNavStyle} shadow-md`
            : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:text-slate-200 hover:bg-slate-800/80'
        }`}
      >
        <BookOpen className={`w-4 h-4 ${isEncyclopediaActive ? 'text-amber-300' : 'text-slate-400'} shrink-0`} />
        <span className="whitespace-nowrap">สารานุกรมไพ่ 78 ใบ</span>
      </Link>
    </nav>
  );
};
