import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SavedReading, HistoryCategory } from '../../types';
import { getSpreadConfig } from '../../features/tarot/data/tarotSpreads';
import {
  X,
  History,
  Trash2,
  ExternalLink,
  Sparkles,
  Star,
  Hash,
  Calendar,
  Compass,
  Copy,
  Check,
  ArrowLeft,
  MessageSquare,
  Coins,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReadings: SavedReading[];
  onLoadReading: (reading: SavedReading) => void;
  onClearHistory: () => void;
  onDeleteReading?: (id: string) => void;
}

const CATEGORY_CONFIG: Record<
  HistoryCategory,
  { label: string; icon: React.FC<{ className?: string }>; badgeStyle: string; borderColor: string }
> = {
  tarot: {
    label: 'ไพ่ยิปซี',
    icon: Sparkles,
    badgeStyle: 'bg-purple-950/80 text-amber-300 border-purple-500/40',
    borderColor: 'hover:border-amber-400/50 border-amber-500/20',
  },
  horoscope: {
    label: '12 ราศี',
    icon: Star,
    badgeStyle: 'bg-indigo-950/80 text-purple-300 border-indigo-500/40',
    borderColor: 'hover:border-purple-400/50 border-purple-500/20',
  },
  numerology: {
    label: 'ตัวเลขมงคล',
    icon: Hash,
    badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    borderColor: 'hover:border-cyan-400/50 border-cyan-500/20',
  },
  'thai-astrology': {
    label: 'ดวงไทยโบราณ',
    icon: Calendar,
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    borderColor: 'hover:border-amber-400/50 border-amber-500/20',
  },
  'feng-shui': {
    label: 'ฮวงจุ้ย',
    icon: Compass,
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    borderColor: 'hover:border-emerald-400/50 border-emerald-500/20',
  },
};

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedReadings,
  onLoadReading,
  onClearHistory,
  onDeleteReading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | HistoryCategory>('all');
  const [activeReading, setActiveReading] = useState<SavedReading | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getItemCategory = (item: SavedReading): HistoryCategory => {
    return item.category || 'tarot';
  };

  const filteredReadings = savedReadings.filter((item) => {
    if (selectedCategory === 'all') return true;
    return getItemCategory(item) === selectedCategory;
  });

  const formatDate = (timestamp: number | string) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    return date.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCreditBadge = (creditsUsed?: number) => {
    if (creditsUsed === 0) {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>0 CR (Custom Key)</span>
        </span>
      );
    }
    const val = typeof creditsUsed === 'number' ? creditsUsed : 1;
    return (
      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold inline-flex items-center gap-1">
        <Coins className="w-3 h-3 text-amber-400" />
        <span>{val} Credit{val > 1 ? 's' : ''}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] glass-panel-gold rounded-2xl p-4 sm:p-6 border border-amber-400/50 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            {activeReading ? (
              <button
                type="button"
                onClick={() => setActiveReading(null)}
                className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับ</span>
              </button>
            ) : (
              <>
                <History className="w-5 h-5 text-amber-300" />
                <h2 className="text-base sm:text-lg font-bold font-serif-mystic text-gold-gradient">
                  ประวัติการทำนายด้วย AI ทั้งหมด
                </h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeReading && activeReading.resultText && (
              <button
                type="button"
                onClick={() => handleCopyText(activeReading.resultText || '')}
                className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 font-bold bg-amber-600/30 px-2.5 py-1 rounded-lg border border-amber-400/40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View 1: Detailed Single AI Prediction View */}
        {activeReading ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {/* Header info card */}
            <div className="p-4 rounded-xl glass-panel border border-amber-500/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const cat = getItemCategory(activeReading);
                    const cfg = CATEGORY_CONFIG[cat];
                    const IconComp = cfg.icon;
                    return (
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${cfg.badgeStyle}`}>
                        <IconComp className="w-3 h-3 shrink-0" />
                        <span>{cfg.label}</span>
                      </span>
                    );
                  })()}
                  {renderCreditBadge(activeReading.creditsUsed)}
                  <span className="text-xs text-purple-300">{formatDate(activeReading.timestamp)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLoadReading(activeReading);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 font-bold bg-amber-600/40 hover:bg-amber-600/60 px-3 py-1 rounded-lg border border-amber-400/50 transition-all"
                >
                  <span>เปิดในหน้าทำนาย</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-amber-200">
                {activeReading.title || activeReading.question || 'คำทำนาย AI'}
              </h3>

              {activeReading.subtitle && (
                <p className="text-xs text-purple-200/90">{activeReading.subtitle}</p>
              )}

              {/* Drawn cards list if Tarot */}
              {activeReading.drawnCards && activeReading.drawnCards.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-purple-500/20 text-xs text-purple-200">
                  <span className="font-semibold text-amber-300">ไพ่ที่ได้:</span>
                  {activeReading.drawnCards.map((c, i) => (
                    <span key={i} className="font-serif-mystic text-amber-100 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                      {c.card.nameTh.split(' (')[0]} {c.isReversed ? '(กลับหัว)' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown AI Content */}
            <div className="p-4 sm:p-6 rounded-xl bg-slate-950/90 border border-amber-500/30 text-slate-100 text-sm leading-relaxed space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h2 className="text-base font-bold text-amber-300 mt-4 mb-2 border-b border-amber-500/30 pb-1">{children}</h2>,
                  h2: ({ children }) => <h2 className="text-base font-bold text-amber-300 mt-4 mb-2 border-b border-amber-500/30 pb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold text-purple-300 mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 leading-relaxed text-slate-200">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-amber-400 pl-3 py-2 my-3 text-amber-200 bg-purple-950/40 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1 text-slate-200">{children}</ul>,
                  li: ({ children }) => <li className="pl-1">{children}</li>,
                }}
              >
                {activeReading.resultText || 'ไม่มีรายละเอียดคำทำนาย'}
              </ReactMarkdown>

              {/* Chat history if available */}
              {activeReading.chatHistory && activeReading.chatHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-purple-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-purple-300" />
                    <span>ประวัติคำถาม-ตอบเพิ่มเติม:</span>
                  </h4>
                  <div className="space-y-2">
                    {activeReading.chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-purple-950/80 border border-purple-500/30 text-purple-200 ml-4'
                            : 'bg-slate-900 border border-amber-500/20 text-slate-100 mr-4'
                        }`}
                      >
                        <span className="font-bold block mb-1 text-[11px] text-amber-300">
                          {msg.role === 'user' ? 'ผู้ถาม' : 'AI หมอดู'}
                        </span>
                        {msg.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* View 2: History List with Category Filter Tabs */
          <>
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-purple-950/60 text-purple-300 hover:text-white border border-purple-500/30'
                }`}
              >
                ทั้งหมด ({savedReadings.length})
              </button>

              {(Object.keys(CATEGORY_CONFIG) as HistoryCategory[]).map((catKey) => {
                const cfg = CATEGORY_CONFIG[catKey];
                const IconComp = cfg.icon;
                const count = savedReadings.filter((item) => getItemCategory(item) === catKey).length;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === catKey
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'bg-purple-950/60 text-purple-300 hover:text-white border border-purple-500/30'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span>{cfg.label} ({count})</span>
                  </button>
                );
              })}
            </div>

            {/* History Items List */}
            <div className="flex-1 overflow-y-auto space-y-3 p-1">
              {filteredReadings.length === 0 ? (
                <div className="text-center py-16 text-purple-300/70 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto animate-pulse" />
                  <p>ยังไม่มีประวัติคำทำนาย AI ที่บันทึกไว้ในหมวดนี้</p>
                </div>
              ) : (
                filteredReadings.map((item) => {
                  const cat = getItemCategory(item);
                  const cfg = CATEGORY_CONFIG[cat];
                  const IconComp = cfg.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl glass-panel border ${cfg.borderColor} transition-all flex flex-col gap-2 relative group`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${cfg.badgeStyle}`}>
                            <IconComp className="w-3 h-3 shrink-0" />
                            <span>{cfg.label}</span>
                          </span>
                          {item.spreadMode && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-amber-300 border border-purple-500/30 font-mono">
                              {getSpreadConfig(item.spreadMode).titleTh}
                            </span>
                          )}
                          {renderCreditBadge(item.creditsUsed)}
                          <span className="text-[11px] text-purple-300/80">{formatDate(item.timestamp)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveReading(item)}
                            className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 font-bold bg-amber-600/30 hover:bg-amber-600/50 px-3 py-1.5 rounded-lg border border-amber-400/40 transition-all cursor-pointer"
                          >
                            <span>ดูผลทำนาย AI</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteReading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteReading(item.id);
                              }}
                              className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-200 hover:bg-rose-950/80 transition-all cursor-pointer"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-amber-100 font-medium line-clamp-1">
                        {item.title || item.question || 'คำทำนายดวงชะตา'}
                      </p>

                      {item.subtitle && (
                        <p className="text-xs text-purple-300/90 line-clamp-1">{item.subtitle}</p>
                      )}

                      {/* Tarot card pills if available */}
                      {item.drawnCards && item.drawnCards.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-purple-200/80 pt-0.5">
                          <span>ไพ่ที่ได้:</span>
                          {item.drawnCards.map((c, i) => (
                            <span key={i} className="font-serif-mystic text-amber-200">
                              {c.card.nameTh.split(' (')[0]} {i < (item.drawnCards?.length || 0) - 1 ? '•' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {savedReadings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-500/20 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 px-3 py-1.5 rounded-lg border border-rose-500/40 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างประวัติทั้งหมด ({savedReadings.length})</span>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
