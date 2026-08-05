import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageSquare, Send, Sparkles, AlertCircle, Bot, User, HelpCircle } from 'lucide-react';
import type { ChatMessage } from '../../types/tarot';

interface AiFollowUpChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  maxMessages?: number;
}

const PRESET_QUESTIONS = [
  '💡 ช่วยสรุปภาพรวมใน 1 ประโยคสั้นๆ',
  '⚠️ มีข้อควรระวังเรื่องอะไรเป็นพิเศษ?',
  '⏳ จังหวะเวลาหรือช่วงไหนเหมาะสมที่สุด?',
  '🎯 ขั้นตอนแรกที่ควรทำเพื่อแก้ปัญหาคืออะไร?',
];

export const AiFollowUpChat: React.FC<AiFollowUpChatProps> = ({
  chatHistory,
  onSendMessage,
  isSending,
  maxMessages = 5,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Count user messages sent so far
  const userMessageCount = chatHistory.filter((msg) => msg.role === 'user').length;
  const isLimitReached = userMessageCount >= maxMessages;
  const remainingCount = Math.max(0, maxMessages - userMessageCount);

  // Auto scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || isLimitReached) return;

    setInputText('');
    await onSendMessage(text);
  };

  const handleSelectPreset = (preset: string) => {
    if (isSending || isLimitReached) return;
    setInputText(preset);
  };

  return (
    <div className="mt-8 border-t border-amber-500/30 pt-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-900/60 border border-purple-400/40 text-amber-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif-mystic text-gold-gradient flex items-center gap-2">
              ถามตอบเจาะลึกกับหมอดู AI
            </h3>
            <p className="text-[11px] text-purple-200/70">
              สงสัยเรื่องใดเพิ่มเติม สามารถถามเจาะลึกต่อเนื่องจากผลไพ่ได้เลย
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="shrink-0 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLimitReached
                ? 'bg-red-950/80 border-red-500/50 text-red-300'
                : remainingCount === 1
                ? 'bg-amber-950/80 border-amber-400/50 text-amber-300 animate-pulse'
                : 'bg-purple-950/60 border-purple-400/30 text-purple-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isLimitReached
                ? 'ใช้สิทธิ์ถามในแชทครบ 5 / 5 ข้อความแล้ว'
                : `สิทธิ์ถามในแชท: ถามได้อีก ${remainingCount} / ${maxMessages} ข้อความ`}
            </span>
          </span>
        </div>
      </div>

      {/* Chat Messages List */}
      {chatHistory.length > 0 && (
        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {chatHistory.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-800 to-amber-600 flex items-center justify-center shrink-0 border border-amber-300/50 shadow-md">
                    <Bot className="w-4 h-4 text-amber-200" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-400/40 text-purple-50 rounded-tr-none'
                      : 'glass-panel-gold border border-amber-400/30 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert max-w-none font-prompt text-slate-200 text-xs md:text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                          strong: ({ children }) => (
                            <strong className="text-amber-300 font-semibold">{children}</strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="my-2 pl-3 border-l-2 border-amber-400 italic text-amber-200/90">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-purple-950 flex items-center justify-center shrink-0 border border-purple-400/40 text-purple-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Sending indicator */}
          {isSending && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-800 to-amber-600 flex items-center justify-center shrink-0 border border-amber-300/50 animate-spin">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div className="glass-panel-gold rounded-2xl rounded-tl-none px-4 py-3 border border-amber-400/30 text-xs text-amber-200 flex items-center gap-2 animate-pulse">
                <span>หมอดู AI กำลังพิจารณาไพ่และคำถามเจาะลึกของคุณ...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {/* Preset Suggestion Chips */}
      {!isLimitReached && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 mb-2 font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>คำถามเจาะลึกที่ผู้ใช้นิยมถาม:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isSending}
                className="px-3 py-1.5 rounded-xl text-xs bg-purple-950/70 hover:bg-purple-900 border border-amber-400/25 hover:border-amber-400/60 text-amber-100/90 hover:text-amber-200 transition-all cursor-pointer disabled:opacity-50 text-left"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form or Limit Alert */}
      {isLimitReached ? (
        <div className="p-4 rounded-xl bg-purple-950/80 border border-amber-400/30 flex items-start gap-3 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">
              คุณได้ใช้สิทธิ์ถามตอบเจาะลึกครบ {maxMessages} ข้อความสำหรับรอบนี้แล้ว
            </p>
            <p className="text-purple-200/80 mt-0.5">
              หากต้องการถามคำถามเรื่องใหม่ หรือต้องการดูดวงประเด็นอื่น แนะนำให้กดปุ่ม "เริ่มดูดวงรอบใหม่" เพื่อเปิดไพ่รับพลังงานจักรวาลรอบถัดไป
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์คำถามเจาะลึกเพิ่มเติมจากผลทำนาย..."
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-amber-400/40 text-slate-100 text-xs sm:text-sm placeholder-purple-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shrink-0"
          >
            <span>ส่งคำถาม</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
