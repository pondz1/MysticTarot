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
  Calendar,
  Palette,
  Menu,
  X,
  Hash,
  Coins,
} from 'lucide-react';

import { MODULE_THEMES } from '../../constants/moduleThemes';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenSettings: (defaultTab?: 'credit' | 'custom') => void;
  onOpenCreditCenter?: () => void;
  onOpenHistory: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenCreditCenter,
  onOpenHistory,
  hasCustomKey,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { credits } = useAuth();


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

          {/* Credits — plain language for beginners */}
          <button
            type="button"
            onClick={() => {
              if (onOpenCreditCenter) onOpenCreditCenter();
              else onOpenSettings('credit');
            }}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 transition-colors cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label={
              credits !== null
                ? `เครดิต AI คงเหลือ ${credits} หน่วย เปิดศูนย์เครดิต`
                : 'เปิดศูนย์เครดิต AI'
            }
            title="เครดิตใช้จ่ายการทำนายด้วย AI — คลิกเพื่อเติมหรือดูรายละเอียด"
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap font-medium">
              {credits !== null ? (
                <>
                  <span className="hidden sm:inline">เครดิต AI </span>
                  <span className="tabular-nums">{credits}</span>
                </>
              ) : (
                <span>เครดิต AI</span>
              )}
            </span>
          </button>

          <div className="h-4 w-px bg-slate-800/80 mx-0.5 hidden sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="ประวัติการทำนาย"
            title="ประวัติการทำนาย"
          >
            <History className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline whitespace-nowrap">ประวัติ</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenSettings('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              hasCustomKey
                ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 font-semibold hover:bg-purple-900/80'
                : 'text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700'
            }`}
            aria-label={
              hasCustomKey
                ? 'ตั้งค่า AI — กำลังใช้ API Key ของคุณ'
                : 'ตั้งค่า AI หรือใส่ API Key ของคุณ'
            }
            title="ตั้งค่าโมเดล AI หรือใช้ API Key ของคุณ (ไม่หักเครดิต)"
          >
            <Settings className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline whitespace-nowrap">ตั้งค่า AI</span>
            {hasCustomKey && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-0.5"
                title="ใช้งาน API Key ของคุณ"
                aria-hidden="true"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 min-h-[40px] min-w-[40px] rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
