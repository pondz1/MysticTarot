import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check, RefreshCw, Save, Feather, Moon } from 'lucide-react';
import type { ChatMessage } from '../types/tarot';
import { AiFollowUpChat } from './AiFollowUpChat';

interface ReadingResultProps {
  resultText: string;
  isAnalyzing: boolean;
  onNewReading: () => void;
  onSaveReading: () => void;
  isSaved?: boolean;
  chatHistory?: ChatMessage[];
  onSendFollowUp?: (text: string) => Promise<void>;
  isSendingFollowUp?: boolean;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
}

export const ReadingResult: React.FC<ReadingResultProps> = ({
  resultText,
  isAnalyzing,
  onNewReading,
  onSaveReading,
  isSaved = false,
  chatHistory = [],
  onSendFollowUp,
  isSendingFollowUp = false,
  onOpenSettings,
  onOpenCreditCenter,
}) => {
  const [copied, setCopied] = useState(false);

  // Copy result text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      {/* Loading state during AI analysis (only when no text has arrived yet) */}
      {isAnalyzing && !resultText && (
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

      {/* Live Streaming or Finished Analysis Result */}
      {resultText && (
        <div className="relative glass-panel-gold rounded-2xl p-6 md:p-8 border border-amber-400/40 shadow-2xl overflow-hidden">
          
          {/* Scroll Header Decorative Frame */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/30 pb-4 mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <Feather className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold font-serif-mystic text-gold-gradient truncate">
                บทวิเคราะห์คำทำนายไพ่ยิปซี
              </h2>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={onSaveReading}
                disabled={isSaved}
                className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[36px] rounded-lg text-xs font-medium bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-100 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title="บันทึกคำทำนายลงประวัติ"
              >
                <Save className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกคำทำนาย'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[36px] rounded-lg text-xs font-medium bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title="คัดลอกข้อความคำทำนาย"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                )}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Content via ReactMarkdown & remarkGfm */}
          <div className="prose prose-invert max-w-none font-prompt text-slate-200 text-xs md:text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="text-base md:text-lg font-bold font-serif-mystic text-gold-gradient mt-6 mb-3 pb-1 border-b border-amber-500/30 flex items-center gap-2">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base md:text-lg font-bold font-serif-mystic text-gold-gradient mt-6 mb-3 pb-1 border-b border-amber-500/30 flex items-center gap-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm md:text-base font-bold text-amber-200 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-2 leading-relaxed text-slate-200">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="text-amber-200 font-semibold">
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 pl-4 border-l-4 border-amber-400 bg-amber-500/10 py-2.5 px-4 rounded-r-xl italic text-amber-200/95 shadow-sm">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 ml-4 list-disc space-y-1 text-slate-200">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 ml-4 list-decimal space-y-1 text-slate-200">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                hr: () => (
                  <hr className="my-4 border-amber-500/20" />
                ),
                table: ({ children }) => (
                  <div className="my-4 overflow-x-auto rounded-xl border border-amber-500/30 bg-slate-950/70 p-2 shadow-inner">
                    <table className="w-full text-xs md:text-sm text-left text-slate-200 border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-amber-500/20 text-amber-200 font-bold border-b border-amber-500/30 border-amber-500/30">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-amber-300 font-semibold border-b border-amber-500/30">
                    {children}
                  </th>
                ),
                tr: ({ children }) => (
                  <tr className="border-b border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                    {children}
                  </tr>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 align-top">
                    {children}
                  </td>
                ),
              }}
            >
              {resultText}
            </ReactMarkdown>

            {/* Active Streaming Indicator */}
            {isAnalyzing && (
              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>หมอดู AI กำลังร่ายบททำนายเพิ่มเติม...</span>
              </div>
            )}
          </div>

          {/* AI Follow-up Chat Section */}
          {onSendFollowUp && (
            <AiFollowUpChat
              chatHistory={chatHistory}
              onSendMessage={onSendFollowUp}
              isSending={isSendingFollowUp}
              maxMessages={5}
              onOpenSettings={onOpenSettings}
              onOpenCreditCenter={onOpenCreditCenter}
            />
          )}

          {/* Footer Action to start new reading */}
          <div className="mt-8 pt-6 border-t border-amber-400/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-400/80" aria-hidden="true" />
              <span>คำทำนายถูกบันทึกในประวัติอัตโนมัติเมื่อใช้ AI</span>
            </p>

            <button
              type="button"
              onClick={onNewReading}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>เริ่มทำนายรอบใหม่</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
