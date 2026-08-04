import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-amber-500/20 bg-slate-950/80 backdrop-blur-md py-6 sm:py-8 text-xs text-purple-300/70">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 gap-4 text-center sm:text-left">
        {/* Brand Info */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-amber-400/30 flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="font-semibold text-purple-200 text-xs sm:text-sm">Mystic Tarot AI</p>
            <p className="text-[11px] text-purple-300/60 leading-tight mt-0.5">
              ขับเคลื่อนด้วยพลังแห่งไพ่ยิปซีและปัญญาประดิษฐ์จักรวาล
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-[11px] sm:text-xs text-purple-400/60 font-mono text-center sm:text-right">
          © 2026 Mystic Tarot AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
