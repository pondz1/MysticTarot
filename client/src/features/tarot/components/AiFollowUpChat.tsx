import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, Bot, User, HelpCircle } from 'lucide-react';
import type { ChatMessage } from '../types/tarot';
import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';
import { PredictionMarkdown } from '../../../components/common/PredictionMarkdown';

interface AiFollowUpChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  maxMessages?: number;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
}

const PRESET_QUESTIONS = [
  'สรุปภาพรวมใน 1 ประโยค',
  'มีข้อควรระวังเรื่องอะไร?',
  'จังหวะเวลาไหนเหมาะสม?',
  'ขั้นตอนแรกที่ควรทำคืออะไร?',
];

export const AiFollowUpChat: React.FC<AiFollowUpChatProps> = ({
  chatHistory,
  onSendMessage,
  isSending,
  maxMessages = 5,
  onOpenSettings,
  onOpenCreditCenter,
}) => {
  const [inputText, setInputText] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userMessageCount = chatHistory.filter((msg) => msg.role === 'user').length;
  const isLimitReached = userMessageCount >= maxMessages;
  const remainingCount = Math.max(0, maxMessages - userMessageCount);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending, chatError]);

  const sendWithErrorHandler = async (text: string) => {
    try {
      setChatError(null);
      await onSendMessage(text);
    } catch (err: unknown) {
      console.error('Follow-up chat AI call failed:', err);
      setLastFailedText(text);
      const message =
        err instanceof Error
          ? err.message
          : 'ไม่สามารถส่งคำถามไปยัง AI ได้ในขณะนี้';
      setChatError(message);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || isLimitReached) return;

    setInputText('');
    await sendWithErrorHandler(text);
  };

  const handleSelectPreset = async (preset: string) => {
    if (isSending || isLimitReached) return;
    setInputText('');
    await sendWithErrorHandler(preset);
  };

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 shrink-0">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-100">ถามต่อจากคำทำนาย</h3>
            <p className="text-[11px] text-slate-500">เจาะลึกผลไพ่รอบนี้ได้สูงสุด {maxMessages} คำถาม</p>
          </div>
        </div>

        <span
          className={`shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isLimitReached
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : remainingCount === 1
                ? 'bg-amber-950/40 border-amber-500/35 text-amber-200'
                : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
        >
          {isLimitReached
            ? `ครบ ${maxMessages}/${maxMessages} คำถามแล้ว`
            : `ถามได้อีก ${remainingCount}/${maxMessages}`}
        </span>
      </div>

      {chatHistory.length > 0 && (
        <div
          className="space-y-3 mb-5 max-h-[420px] overflow-y-auto pr-1 overscroll-contain"
          aria-live="polite"
          aria-relevant="additions"
        >
          {chatHistory.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-amber-300" aria-hidden="true" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tr-sm'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  ) : !msg.content ? (
                    <div className="flex items-center gap-2 text-slate-400 italic py-1" role="status">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400/80" aria-hidden="true" />
                      <span>กำลังตอบ…</span>
                    </div>
                  ) : (
                    <PredictionMarkdown content={msg.content} compact />
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-slate-700 text-slate-400">
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}

          {isSending && chatHistory[chatHistory.length - 1]?.role === 'user' && (
            <div className="flex gap-2.5 justify-start items-center" role="status">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-800 bg-slate-950/80 text-xs text-slate-400">
                กำลังพิจารณาคำถาม…
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {chatError && (
        <div className="mb-4">
          <AiErrorFallbackCard
            errorMessage={chatError}
            onRetry={lastFailedText ? () => sendWithErrorHandler(lastFailedText) : undefined}
            onOpenCreditCenter={onOpenCreditCenter}
            onOpenSettings={onOpenSettings}
          />
        </div>
      )}

      {!isLimitReached && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 font-medium">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>คำถามยอดนิยม</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isSending}
                className="px-3 py-2 min-h-[40px] rounded-xl text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer disabled:opacity-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLimitReached ? (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex items-start gap-3 text-slate-300 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-100">
              ใช้สิทธิ์ถามครบ {maxMessages} ข้อความสำหรับรอบนี้แล้ว
            </p>
            <p className="text-slate-500 mt-0.5">
              กด「เริ่มทำนายรอบใหม่」ด้านล่างหากต้องการเปิดไพ่และถามเรื่องใหม่
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
          <label htmlFor="follow-up-input" className="sr-only">
            คำถามเจาะลึกเพิ่มเติม
          </label>
          <input
            id="follow-up-input"
            name="follow-up"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์คำถามเพิ่มเติม…"
            disabled={isSending}
            autoComplete="off"
            className="flex-1 min-w-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span className="hidden xs:inline sm:inline">ส่ง</span>
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
};
