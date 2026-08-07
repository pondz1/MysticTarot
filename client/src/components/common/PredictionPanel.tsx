import React from 'react';
import { Check, Copy, Feather } from 'lucide-react';
import { PredictionMarkdown } from './PredictionMarkdown';

interface PredictionLoadingProps {
  message?: string;
  detail?: string;
}

/** Quiet loading state shared by prediction modules */
export const PredictionLoading: React.FC<PredictionLoadingProps> = ({
  message = 'กำลังวิเคราะห์คำทำนาย…',
  detail = 'โปรดรอสักครู่',
}) => (
  <div
    role="status"
    className="flex flex-col items-center justify-center p-10 sm:p-12 rounded-2xl border border-slate-700 bg-slate-950/80 text-center space-y-2"
  >
    <div
      className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-amber-400/80 animate-spin"
      aria-hidden="true"
    />
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
    className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/35 text-violet-200 text-xs font-medium"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.7)]" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

interface PredictionPanelProps {
  title: string;
  /** Prefer passing markdown text for unified typography */
  markdown?: string;
  isStreaming?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  /** Extra header actions (e.g. save) — rendered before copy */
  headerActions?: React.ReactNode;
  /** Optional footer below content (chat, new reading, etc.) */
  footer?: React.ReactNode;
  /** Fallback when not using markdown prop */
  children?: React.ReactNode;
  streamingLabel?: string;
  className?: string;
  /** Visual density */
  compact?: boolean;
}

/**
 * Unified prediction result chrome used across the whole product.
 * Layout: title bar · markdown body · streaming · footer
 */
export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  title,
  markdown,
  isStreaming = false,
  onCopy,
  copied = false,
  headerActions,
  footer,
  children,
  streamingLabel,
  className = '',
  compact = false,
}) => (
  <article
    className={`relative rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 overflow-hidden animate-fade-in shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)] ${
      compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6 md:p-7'
    } ${className}`}
  >
    {/* soft top accent */}
    <div
      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
      aria-hidden="true"
    />
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 pb-4 mb-5">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 shrink-0">
          <Feather className="w-4.5 h-4.5 text-amber-300" aria-hidden="true" />
        </span>
        <h2 className="text-base sm:text-lg font-bold text-amber-50 truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap justify-end">
        {headerActions}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 hover:border-amber-400/45 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="คัดลอกข้อความคำทำนาย"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
            )}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
          </button>
        )}
      </div>
    </header>

    <div aria-live="polite" aria-busy={isStreaming}>
      {markdown != null ? (
        <PredictionMarkdown content={markdown} compact={compact} />
      ) : (
        children
      )}
      {isStreaming && <PredictionStreamingBadge label={streamingLabel} />}
    </div>

    {footer && (
      <footer className="mt-6 pt-5 border-t border-amber-500/15">{footer}</footer>
    )}
  </article>
);

interface PrimaryAnalyzeButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
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
        <span
          className="w-4 h-4 rounded-full border-2 border-slate-800/40 border-t-slate-900 animate-spin"
          aria-hidden="true"
        />
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
