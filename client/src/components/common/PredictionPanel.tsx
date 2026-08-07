import React from 'react';
import { Check, Copy, Feather } from 'lucide-react';

interface PredictionLoadingProps {
  message?: string;
  detail?: string;
}

/** Quiet loading state shared by non-tarot prediction modules */
export const PredictionLoading: React.FC<PredictionLoadingProps> = ({
  message = 'กำลังวิเคราะห์คำทำนาย…',
  detail = 'โปรดรอสักครู่',
}) => (
  <div
    role="status"
    className="flex flex-col items-center justify-center p-10 rounded-2xl border border-slate-700 bg-slate-950/80 text-center space-y-2"
  >
    <div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-amber-400/80 animate-spin" aria-hidden="true" />
    <h4 className="text-base font-semibold text-slate-100">{message}</h4>
    <p className="text-xs text-slate-500">{detail}</p>
  </div>
);

interface PredictionStreamingBadgeProps {
  label?: string;
}

export const PredictionStreamingBadge: React.FC<PredictionStreamingBadgeProps> = ({
  label = 'กำลังเขียนคำทำนายต่อ…',
}) => (
  <div
    role="status"
    className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-medium"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

interface PredictionPanelProps {
  title: string;
  isStreaming?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  children: React.ReactNode;
  streamingLabel?: string;
}

/** Outer chrome for AI/classic prediction markdown results */
export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  title,
  isStreaming = false,
  onCopy,
  copied = false,
  children,
  streamingLabel,
}) => (
  <div className="relative rounded-2xl p-5 sm:p-6 md:p-7 border border-slate-700/90 bg-slate-950/70 overflow-hidden space-y-4 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div className="flex items-center gap-2 min-w-0">
        <Feather className="w-5 h-5 text-amber-400/90 shrink-0" aria-hidden="true" />
        <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate">{title}</h3>
      </div>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="คัดลอกข้อความคำทำนาย"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          )}
          <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
        </button>
      )}
    </div>

    <div className="prose prose-invert max-w-none font-prompt text-slate-200 text-sm leading-relaxed" aria-live="polite" aria-busy={isStreaming}>
      {children}
      {isStreaming && <PredictionStreamingBadge label={streamingLabel} />}
    </div>
  </div>
);

interface PrimaryAnalyzeButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  /** e.g. ดูคำทำนายด้วย AI / ดูคำทำนายมาตรฐาน */
  label: string;
  loadingLabel?: string;
  className?: string;
  fullWidth?: boolean;
}

export const PrimaryAnalyzeButton: React.FC<PrimaryAnalyzeButtonProps> = ({
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  label,
  loadingLabel = 'กำลังวิเคราะห์…',
  className = '',
  fullWidth = false,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className}`}
  >
    {loading ? (
      <>
        <span className="w-4 h-4 rounded-full border-2 border-slate-800/40 border-t-slate-900 animate-spin" aria-hidden="true" />
        <span>{loadingLabel}</span>
      </>
    ) : (
      <span>{label}</span>
    )}
  </button>
);

export function analyzeButtonLabel(useAi: boolean, subject?: string): string {
  if (useAi) {
    return subject ? `ดูคำทำนายด้วย AI · ${subject}` : 'ดูคำทำนายด้วย AI';
  }
  return subject ? `ดูคำทำนายมาตรฐาน · ${subject}` : 'ดูคำทำนายมาตรฐาน';
}
