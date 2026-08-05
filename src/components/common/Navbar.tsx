import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Settings,
  History,
  Compass,
  Home,
  Star,
  Phone,
  Calendar,
  Palette,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenHistory,
  hasCustomKey,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 glass-panel backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">

        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="MYSTICVERSE - หน้าแรก"
          className="flex items-center gap-2 cursor-pointer group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
          onClick={() => {
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-purple-900 via-amber-700 to-purple-600 border border-amber-400/40 shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base md:text-xl font-bold font-serif-mystic text-gold-gradient tracking-tight leading-none whitespace-nowrap">
              MYSTICVERSE
            </h1>
            <p className="hidden sm:block text-[9px] text-amber-300/80 tracking-widest uppercase font-light mt-0.5">
              ศูนย์รวมศาสตร์ดูดวง & โหราศาสตร์ AI
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Visible on md breakpoint and above) */}
        <nav className="hidden md:flex items-center gap-1.5 py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
        </nav>

        {/* Action Controls & Mobile Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* History Modal Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer min-h-[36px]"
            title="ประวัติการทำนาย"
          >
            <History className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">ประวัติ</span>
          </button>

          {/* API Settings Modal */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-100 bg-gradient-to-r from-amber-950 to-purple-950 border border-amber-400/50 hover:border-amber-300 transition-all shrink-0 cursor-pointer min-h-[36px]"
            title="ตั้งค่าเชื่อมต่อ AI"
          >
            <Settings className="w-4 h-4 text-amber-300 animate-spin-slow shrink-0" />
            <span className="text-xs font-semibold">AI</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle (Visible below md) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 hover:text-white transition-colors min-h-[36px] min-w-[36px] cursor-pointer"
            aria-label="เปิดเมนูนำทาง"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-amber-500/20 mt-2.5 pt-3 pb-2 px-1 space-y-2 bg-slate-950/95 rounded-b-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      item.active
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-md'
                        : 'text-slate-300 bg-slate-900 border border-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
