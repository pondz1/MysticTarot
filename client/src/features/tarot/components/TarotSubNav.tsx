import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, BookOpen } from 'lucide-react';

export const TarotSubNav: React.FC = () => {
  const location = useLocation();

  const isReadingActive =
    location.pathname === '/tarot' || location.pathname.startsWith('/tarot/reading');
  const isEncyclopediaActive = location.pathname.startsWith('/tarot/encyclopedia');

  const base =
    'flex-1 flex items-center justify-center gap-2 h-10 px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';
  const active = 'bg-amber-500/15 text-amber-100 border border-amber-400/35';
  const idle = 'text-slate-500 border border-transparent hover:text-slate-200 hover:bg-slate-900/80';

  return (
    <nav
      aria-label="เมนูไพ่ยิปซี"
      className="flex items-center justify-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800 my-2 sm:my-3 max-w-md mx-auto w-full"
    >
      <Link to="/tarot" className={`${base} ${isReadingActive ? active : idle}`}>
        <Compass
          className={`w-4 h-4 shrink-0 ${isReadingActive ? 'text-amber-300' : 'text-slate-600'}`}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap">ทำนายไพ่</span>
      </Link>

      <Link to="/tarot/encyclopedia" className={`${base} ${isEncyclopediaActive ? active : idle}`}>
        <BookOpen
          className={`w-4 h-4 shrink-0 ${isEncyclopediaActive ? 'text-amber-300' : 'text-slate-600'}`}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap">สารานุกรม</span>
      </Link>
    </nav>
  );
};
