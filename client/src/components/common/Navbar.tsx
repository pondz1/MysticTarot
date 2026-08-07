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
  MoreHorizontal,
} from 'lucide-react';

import { MODULE_THEMES } from '../../constants/moduleThemes';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenSettings: (defaultTab?: 'credit' | 'custom') => void;
  onOpenCreditCenter?: () => void;
  onOpenHistory: () => void;
  hasCustomKey: boolean;
}

type NavItem = {
  label: string;
  path: string;
  active: boolean;
  icon: React.FC<{ className?: string }>;
  theme: (typeof MODULE_THEMES)[keyof typeof MODULE_THEMES];
};

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenCreditCenter,
  onOpenHistory,
  hasCustomKey,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { credits } = useAuth();

  const isHomeActive = location.pathname === '/';
  const isTarotActive = location.pathname.startsWith('/tarot');
  const isHoroscopeActive = location.pathname.startsWith('/horoscope');
  const isNumerologyActive = location.pathname.startsWith('/numerology');
  const isThaiAstrologyActive = location.pathname.startsWith('/thai-astrology');
  const isFengShuiActive = location.pathname.startsWith('/feng-shui');

  const navItems: NavItem[] = [
    { label: 'หน้าแรก', path: '/', active: isHomeActive, icon: Home, theme: MODULE_THEMES.home },
    { label: 'ไพ่ยิปซี', path: '/tarot', active: isTarotActive, icon: Compass, theme: MODULE_THEMES.tarot },
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

  const primaryBottom = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);
  const isMoreActive = moreItems.some((i) => i.active);

  // Close sheet on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body when full mobile menu open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const openCredits = () => {
    if (onOpenCreditCenter) onOpenCreditCenter();
    else onOpenSettings('credit');
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-amber-500 focus:text-slate-950 focus:font-semibold"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0914]/92 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <Link
            to="/"
            aria-label="MYSTICVERSE - หน้าแรก"
            className="flex items-center gap-2 cursor-pointer group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative p-1.5 sm:p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base md:text-lg font-bold font-serif-mystic text-amber-50 tracking-tight leading-none whitespace-nowrap">
                MYSTICVERSE
              </span>
              <p className="hidden sm:block text-[9px] text-slate-500 tracking-wide mt-0.5">
                ศาสตร์ทำนาย · AI
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 py-0.5" aria-label="เมนูหลัก">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    item.active
                      ? `${item.theme.activeNavStyle} font-semibold`
                      : 'text-slate-400 bg-transparent border-transparent hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${item.active ? item.theme.iconColor : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Utility actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={openCredits}
              className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label={
                credits !== null
                  ? `เครดิต AI คงเหลือ ${credits} หน่วย เปิดศูนย์เครดิต`
                  : 'เปิดศูนย์เครดิต AI'
              }
              title="เครดิตใช้จ่ายการทำนายด้วย AI"
            >
              <Coins className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap font-medium tabular-nums">
                {credits !== null ? (
                  <>
                    <span className="hidden sm:inline">เครดิต </span>
                    {credits}
                  </>
                ) : (
                  'เครดิต'
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="ประวัติการทำนาย"
              title="ประวัติการทำนาย"
            >
              <History className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline whitespace-nowrap">ประวัติ</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenSettings('custom')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                hasCustomKey
                  ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 font-semibold hover:bg-purple-900/80'
                  : 'text-slate-300 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              aria-label={
                hasCustomKey
                  ? 'ตั้งค่า AI — กำลังใช้ API Key ของคุณ'
                  : 'ตั้งค่า AI หรือใส่ API Key ของคุณ'
              }
              title="ตั้งค่าโมเดล AI หรือใช้ API Key ของคุณ"
            >
              <Settings className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">ตั้งค่า AI</span>
              {hasCustomKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-0.5" aria-hidden="true" />
              )}
            </button>

            {/* Mobile: open full menu sheet */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="เปิดเมนูทั้งหมด"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden flex items-center justify-center p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full menu sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="เมนูนำทาง">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              aria-label="ปิดเมนู"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-slate-800 bg-[#0c0b16] p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-100">เมนู</h2>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="ปิดเมนู"
                  className="p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 p-3 min-h-[48px] rounded-xl text-xs font-semibold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        item.active
                          ? item.theme.activeNavStyle
                          : 'text-slate-300 bg-slate-900/80 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${item.theme.iconColor}`} aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full flex items-center gap-2.5 p-3 min-h-[48px] rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800"
                >
                  <History className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  ประวัติการทำนาย
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSettings('custom');
                  }}
                  className="w-full flex items-center gap-2.5 p-3 min-h-[48px] rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800"
                >
                  <Settings className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  ตั้งค่า AI
                  {hasCustomKey && (
                    <span className="ml-auto text-[10px] text-purple-300 font-medium">ใช้ API Key ของคุณ</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openCredits();
                  }}
                  className="w-full flex items-center gap-2.5 p-3 min-h-[48px] rounded-xl text-xs font-semibold text-amber-100 bg-amber-500/10 border border-amber-500/30"
                >
                  <Coins className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  เครดิต AI
                  {credits !== null && (
                    <span className="ml-auto tabular-nums font-bold">{credits} หน่วย</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar — thumb zone */}
      <nav
        aria-label="เมนูลัดมือถือ"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/5 bg-[#0a0914]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 gap-0.5 px-1 pt-1 pb-1 max-w-lg mx-auto">
          {primaryBottom.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-lg text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  item.active ? 'text-amber-200' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${item.active ? item.theme.iconColor : 'text-slate-500'}`}
                  aria-hidden="true"
                />
                <span className="truncate max-w-full px-0.5">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-lg text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isMoreActive || isMobileMenuOpen ? 'text-amber-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MoreHorizontal
              className={`w-5 h-5 ${isMoreActive || isMobileMenuOpen ? 'text-amber-400' : 'text-slate-500'}`}
              aria-hidden="true"
            />
            <span>เพิ่มเติม</span>
          </button>
        </div>
      </nav>
    </>
  );
};
