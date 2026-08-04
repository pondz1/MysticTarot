import React from 'react';
import { Sparkles, Settings, BookOpen, History } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenCardList: () => void;
  onOpenHistory: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenCardList,
  onOpenHistory,
  hasCustomKey
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 glass-panel backdrop-blur-md px-3 sm:px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">

        {/* Brand Logo */}
        <div
          role="button"
          tabIndex={0}
          aria-label="MYSTIC TAROT AI - เลื่อนกลับด้านบน"
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-purple-900 to-amber-600 border border-amber-400/40 shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base md:text-xl font-bold font-serif-mystic text-gold-gradient tracking-wide leading-none whitespace-nowrap">
              MYSTIC TAROT AI
            </h1>
            <p className="hidden sm:block text-[10px] text-purple-300/80 tracking-widest uppercase font-light mt-0.5">
              ดูดวงไพ่ยิปซีด้วยพลัง AI
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">

          {/* Browse Tarot Database */}
          <button
            type="button"
            onClick={onOpenCardList}
            aria-label="สารานุกรมไพ่ยิปซี 22 ใบ"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-purple-200 bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/60 hover:border-amber-400/50 transition-all shadow-sm shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            title="สารานุกรมไพ่ยิปซี 22 ใบ"
          >
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">สารานุกรมไพ่</span>
          </button>

          {/* History Modal Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            aria-label="ประวัติการดูดวง"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-purple-200 bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/60 hover:border-amber-400/50 transition-all shadow-sm shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
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
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-amber-100 bg-gradient-to-r from-amber-900/90 to-purple-900/90 border border-amber-400/50 hover:border-amber-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all shadow-sm shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            title="ตั้งค่าเชื่อมต่อ AI"
          >
            <Settings className="w-4 h-4 text-amber-300 animate-spin-slow shrink-0" />
            <span className="whitespace-nowrap text-xs">AI</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
