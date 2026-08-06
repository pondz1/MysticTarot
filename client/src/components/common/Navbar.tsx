import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Settings,
  History,
  Compass,
  Home,
  Star,
  Calendar,
  Palette,
  Menu,
  X,
  Hash,
  Coins,
} from 'lucide-react';

import { MODULE_THEMES } from '../../constants/moduleThemes';

interface NavbarProps {
  onOpenSettings: (defaultTab?: 'credit' | 'custom') => void;
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
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetchCredits();

    const handleCreditsUpdate = (e: CustomEvent<number>) => {
      setCredits(e.detail);
    };

    window.addEventListener('user_credits_updated', handleCreditsUpdate as EventListener);
    return () => {
      window.removeEventListener('user_credits_updated', handleCreditsUpdate as EventListener);
    };
  }, []);

  const fetchCredits = async () => {
    try {
      const { getSessionId } = await import('../../services/ai/aiClient');
      const res = await fetch('/api/user/credits', {
        headers: { 'X-Session-ID': getSessionId() },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch {
      // ignore offline
    }
  };


  const isHomeActive = location.pathname === '/';
  const isTarotActive = location.pathname.startsWith('/tarot');
  const isHoroscopeActive = location.pathname.startsWith('/horoscope');
  const isNumerologyActive = location.pathname.startsWith('/numerology');
  const isThaiAstrologyActive = location.pathname.startsWith('/thai-astrology');
  const isFengShuiActive = location.pathname.startsWith('/feng-shui');

  const navItems = [
    {
      label: 'หน้าแรก',
      path: '/',
      active: isHomeActive,
      icon: Home,
      theme: MODULE_THEMES.home,
    },
    {
      label: 'ไพ่ยิปซี',
      path: '/tarot',
      active: isTarotActive,
      icon: Compass,
      theme: MODULE_THEMES.tarot,
    },
    {
      label: '12 ราศี',
      path: '/horoscope',
      active: isHoroscopeActive,
      icon: Star,
      theme: MODULE_THEMES.horoscope,
    },
    {
      label: 'เลขศาสตร์',
      path: '/numerology',
      active: isNumerologyActive,
      icon: Hash,
      theme: MODULE_THEMES.numerology,
    },
    {
      label: 'กราฟชีวิต',
      path: '/thai-astrology',
      active: isThaiAstrologyActive,
      icon: Calendar,
      theme: MODULE_THEMES['thai-astrology'],
    },
    {
      label: 'ฮวงจุ้ย',
      path: '/feng-shui',
      active: isFengShuiActive,
      icon: Palette,
      theme: MODULE_THEMES['feng-shui'],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 glass-panel backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">

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

        <nav className="hidden md:flex items-center gap-1.5 py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  item.active
                    ? `${item.theme.activeNavStyle} font-semibold`
                    : 'text-slate-300 bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.theme.iconColor} shrink-0`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Credits Balance Pill -> Opens Credit Tab */}
          <button
            type="button"
            onClick={() => onOpenSettings('credit')}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 hover:from-amber-500/25 hover:to-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)] hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] transition-all cursor-pointer min-h-[36px]"
            title="เครดิตใช้งาน AI คงเหลือ (คลิกเพื่อดูรายละเอียดระบบ Credit)"
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
            <span className="whitespace-nowrap font-medium text-amber-200">
              {credits !== null ? `${credits} CR` : 'Credit'}
            </span>
          </button>

          <div className="h-4 w-px bg-slate-800/80 mx-0.5 hidden sm:block" />

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all cursor-pointer min-h-[36px]"
            title="ประวัติการทำนาย"
          >
            <History className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">ประวัติ</span>
          </button>

          {/* AI Settings Button -> Opens Custom API Key Tab */}
          <button
            type="button"
            onClick={() => onOpenSettings('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[36px] ${
              hasCustomKey
                ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] font-semibold hover:bg-purple-900/80'
                : 'text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700'
            }`}
            title="ตั้งค่า AI ( Custom API Key / โมเดล )"
          >
            <Settings className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">ตั้งค่า AI</span>
            {hasCustomKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-0.5" title="ใช้งาน Custom API Key" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="เปิดเมนูนำทาง"
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

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
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      item.active
                        ? `${item.theme.activeNavStyle} shadow-md`
                        : 'text-slate-300 bg-slate-900 border-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border ${item.theme.badgeBg}`}>
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
