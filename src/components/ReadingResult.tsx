import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Save, Feather, Moon } from 'lucide-react';

interface ReadingResultProps {
  resultText: string;
  isAnalyzing: boolean;
  onNewReading: () => void;
  onSaveReading: () => void;
  isSaved?: boolean;
}

export const ReadingResult: React.FC<ReadingResultProps> = ({
  resultText,
  isAnalyzing,
  onNewReading,
  onSaveReading,
  isSaved = false
}) => {
  const [copied, setCopied] = useState(false);

  // Copy result text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse markdown-like headers for beautiful display
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base md:text-lg font-bold font-serif-mystic text-gold-gradient mt-6 mb-3 pb-1 border-b border-amber-500/30 flex items-center gap-2">
            <span>{line.replace('## ', '')}</span>
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm md:text-base font-bold text-amber-200 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 text-xs md:text-sm my-1 leading-relaxed">
            {renderBoldText(line.replace(/^[\*\-]\s+/, ''))}
          </li>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-4 border-amber-500/20" />;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs md:text-sm text-slate-200 my-1.5 leading-relaxed">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  // Format **bold** text inline
  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-amber-200 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      {/* Loading state during AI analysis */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center p-12 glass-panel-gold rounded-2xl text-center border border-amber-400/50 shadow-2xl animate-pulse">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-amber-500 to-indigo-600 animate-spin blur-md" />
            <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center border border-amber-300">
              <Sparkles className="w-8 h-8 text-amber-300 animate-bounce" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold font-serif-mystic text-gold-gradient mb-2">
            หมอดู AI กำลังเปิดคัมภีร์วิเคราะห์ชะตา...
          </h3>
          <p className="text-xs text-purple-300/80 max-w-md">
            กำลังสื่อสารกับพลังงานไพ่ยิปซีเพื่อถอดรหัสสารแห่งอนาคต โปรดรอสักครู่
          </p>
        </div>
      )}

      {/* Finished Analysis Result */}
      {!isAnalyzing && resultText && (
        <div className="relative glass-panel-gold rounded-2xl p-6 md:p-8 border border-amber-400/40 shadow-2xl overflow-hidden">
          
          {/* Scroll Header Decorative Frame */}
          <div className="flex items-center justify-between border-b border-amber-400/30 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg md:text-xl font-bold font-serif-mystic text-gold-gradient">
                บทวิเคราะห์คำทำนาย (Mystic AI Oracle Reading)
              </h2>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSaveReading}
                disabled={isSaved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-100 disabled:opacity-50 transition-all cursor-pointer"
                title="บันทึกคำทำนายลงเครื่อง"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600/30 hover:bg-amber-600/60 border border-amber-400/40 text-amber-100 transition-all cursor-pointer"
                title="คัดลอกคำทำนาย"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-invert max-w-none font-prompt">
            {renderFormattedMarkdown(resultText)}
          </div>

          {/* Footer Action to start new reading */}
          <div className="mt-8 pt-6 border-t border-amber-400/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-purple-300/70 italic flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              "โชคชะตาไม่ได้สลักไว้บนก้อนหิน แต่อยู่ในมือของคุณ"
            </p>

            <button
              type="button"
              onClick={onNewReading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-purple-700 text-slate-950 hover:text-white border border-amber-300 hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>เริ่มดูดวงรอบใหม่</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
