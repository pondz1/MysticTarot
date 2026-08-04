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
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 glass-panel backdrop-blur-md px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="relative p-2 rounded-xl bg-gradient-to-tr from-purple-900 to-amber-600 border border-amber-400/40 shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold font-serif-mystic text-gold-gradient tracking-wide leading-tight">
              MYSTIC TAROT AI
            </h1>
            <p className="text-[10px] text-purple-300/80 tracking-widest uppercase font-light">
              ดูดวงไพ่ยิปซีด้วยพลัง AI
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Browse Tarot Database */}
          <button
            onClick={onOpenCardList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-200 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/60 hover:border-amber-400/40 transition-all shadow-sm"
            title="สารานุกรมไพ่ยิปซี 22 ใบ"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">สารานุกรมไพ่</span>
          </button>

          {/* History Modal Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-200 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/60 hover:border-amber-400/40 transition-all shadow-sm"
            title="ประวัติการดูดวง"
          >
            <History className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">ประวัติทำนาย</span>
          </button>

          {/* API Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-100 bg-gradient-to-r from-amber-900/80 to-purple-900/80 border border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all shadow-sm"
            title="ตั้งค่า OpenAI API Key"
          >
            <Settings className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>ตั้งค่า AI</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
