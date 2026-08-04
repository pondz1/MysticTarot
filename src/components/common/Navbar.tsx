import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Settings, BookOpen, History, Compass } from 'lucide-react';

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

  const isReadingActive = location.pathname === '/';
  const isEncyclopediaActive = location.pathname.startsWith('/encyclopedia');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 glass-panel backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">

        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="MYSTIC TAROT AI - ไปที่หน้าทำนายไพ่"
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl min-w-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-purple-900 to-amber-600 border border-amber-400/40 shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-200 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs xs:text-sm sm:text-base md:text-xl font-bold font-serif-mystic text-gold-gradient tracking-tight leading-none whitespace-nowrap">
              MYSTIC TAROT AI
            </h1>
            <p className="hidden sm:block text-[10px] text-purple-300/80 tracking-widest uppercase font-light mt-0.5">
              ดูดวงไพ่ยิปซีด้วยพลัง AI
            </p>
          </div>
        </Link>

        {/* Navigation Action Buttons / Page Tabs */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">

          {/* Reading Page Tab */}
          <Link
            to="/"
            aria-label="หน้าทำนายไพ่"
            className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
              isReadingActive
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                : 'text-purple-200 bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/60 hover:border-amber-400/50'
            }`}
            title="หน้าทำนายไพ่ยิปซี"
          >
            <Compass className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">ทำนายไพ่</span>
          </Link>

          {/* Encyclopedia Full-Page Tab */}
          <Link
            to="/encyclopedia"
            aria-label="สารานุกรมไพ่ยิปซี 22 ใบ"
            className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
              isEncyclopediaActive
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                : 'text-purple-200 bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/60 hover:border-amber-400/50'
            }`}
            title="สารานุกรมไพ่ยิปซี 22 ใบ"
          >
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">สารานุกรมไพ่</span>
          </Link>

          {/* History Modal Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            aria-label="ประวัติการดูดวง"
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-purple-200 bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/60 hover:border-amber-400/50 transition-all shadow-sm shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            title="ประวัติการดูดวง"
          >
            <History className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">ประวัติทำนาย</span>
          </button>

          {/* API Settings Modal */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="ตั้งค่าเชื่อมต่อ AI"
            className="relative flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-amber-100 bg-gradient-to-r from-amber-900/90 to-purple-900/90 border border-amber-400/50 hover:border-amber-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all shadow-sm shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            title="ตั้งค่าเชื่อมต่อ AI"
          >
            <Settings className="w-4 h-4 text-amber-300 animate-spin-slow shrink-0" />
            <span className="whitespace-nowrap text-xs hidden xs:inline">AI</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
