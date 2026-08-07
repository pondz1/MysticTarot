import React from 'react';
import { AlertCircle, Coins, Key, RefreshCw } from 'lucide-react';

interface AiErrorFallbackCardProps {
  errorMessage: string;
  onRetry?: () => void;
  onOpenCreditCenter?: () => void;
  onOpenSettings?: () => void;
}

/**
 * Shown only when an AI request fails.
 * Does not offer offline/generated text — that confused users who thought AI answered.
 */
export const AiErrorFallbackCard: React.FC<AiErrorFallbackCardProps> = ({
  errorMessage,
  onRetry,
  onOpenCreditCenter,
  onOpenSettings,
}) => {
  const looksLikeCredit =
    /credit|เครดิต|insufficient|quota|limit|หมด/i.test(errorMessage || '');

  return (
    <div
      role="alert"
      className="w-full max-w-xl mx-auto my-6 p-5 rounded-2xl bg-slate-950/95 border border-rose-500/45 shadow-2xl animate-fade-in text-left"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-400/35 text-rose-300 shrink-0">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-base font-bold text-rose-100">
            {looksLikeCredit ? 'เครดิต AI ไม่พอ หรือหมดแล้ว' : 'AI ตอบไม่ได้ในตอนนี้'}
          </h4>
          <p className="text-xs text-rose-200/85 mt-1 leading-relaxed">
            {errorMessage || 'เชื่อมต่อ AI ไม่สำเร็จ — ยังไม่มีคำทำนายจากรอบนี้'}
          </p>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            ระบบไม่ได้สร้างคำตอบสำรองแทน AI เพื่อไม่ให้สับสนกับผลจริง
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 font-medium mb-3 pt-2 border-t border-slate-800">
        เลือกทางแก้ แล้วลองใหม่อีกครั้ง:
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>ลองอีกครั้ง</span>
          </button>
        )}

        {onOpenCreditCenter && (
          <button
            type="button"
            onClick={onOpenCreditCenter}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Coins className="w-4 h-4" aria-hidden="true" />
            <span>เติมเครดิต AI</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Key className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>ใช้ API Key ของฉัน</span>
          </button>
        )}
      </div>
    </div>
  );
};
