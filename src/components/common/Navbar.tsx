import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Settings, History, Compass, Home, Star, Phone, Calendar, Palette } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenHistory,
  hasCustomKey
}) => {
  const location = useLocation();

  const isHomeActive = location.pathname === '/';
  const isTarotActive = location.pathname.startsWith('/tarot') || location.pathname.startsWith('/reading');
  const isHoroscopeActive = location.pathname.startsWith('/horoscope');
  const isNumerologyActive = location.pathname.startsWith('/numerology');
  const isThaiAstrologyActive = location.pathname.startsWith('/thai-astrology');
  const isFengShuiActive = location.pathname.startsWith('/feng-shui');

  const navItems = [
    { label: 'หน้าแรก', path: '/', active: isHomeActive, icon: Home },
    { label: 'ไพ่ยิปซี', path: '/tarot', active: isTarotActive, icon: Compass },
    { label: '12 ราศี', path: '/horoscope', active: isHoroscopeActive, icon: Star },
    { label: 'เลขศาสตร์', path: '/numerology', active: isNumerologyActive, icon: Phone },
    { label: 'กราฟชีวิต', path: '/thai-astrology', active: isThaiAstrologyActive, icon: Calendar },
    { label: 'ฮวงจุ้ย', path: '/feng-shui', active: isFengShuiActive, icon: Palette },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 glass-panel backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">

        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="MYSTICVERSE - หน้าแรก"
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-purple-900 via-amber-700 to-purple-600 border border-amber-400/40 shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-200 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs xs:text-sm sm:text-base md:text-xl font-bold font-serif-mystic text-gold-gradient tracking-tight leading-none whitespace-nowrap">
              MYSTICVERSE
            </h1>
            <p className="hidden sm:block text-[9px] text-amber-300/80 tracking-widest uppercase font-light mt-0.5">
              ศูนย์รวมศาสตร์ดูดวง & โหราศาสตร์ AI
            </p>
          </div>
        </Link>

        {/* Navigation Action Buttons / Page Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  item.active
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-[0_0_10px_rgba(234,179,8,0.2)] font-semibold'
                    : 'text-slate-300 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}

          {/* History Modal Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shrink-0 cursor-pointer"
            title="ประวัติการทำนาย"
          >
            <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden lg:inline whitespace-nowrap">ประวัติ</span>
          </button>

          {/* API Settings Modal */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="relative flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-amber-100 bg-gradient-to-r from-amber-950 to-purple-950 border border-amber-400/50 hover:border-amber-300 transition-all shrink-0 whitespace-nowrap cursor-pointer"
            title="ตั้งค่าเชื่อมต่อ AI"
          >
            <Settings className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
            <span className="text-xs">AI</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
