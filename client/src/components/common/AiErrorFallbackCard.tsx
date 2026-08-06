import React from 'react';
import { AlertCircle, Coins, Key, RefreshCw, Sparkles } from 'lucide-react';

interface AiErrorFallbackCardProps {
  errorMessage: string;
  onRetry?: () => void;
  onUseOfflineFallback?: () => void;
  onOpenCreditCenter?: () => void;
  onOpenSettings?: () => void;
}

export const AiErrorFallbackCard: React.FC<AiErrorFallbackCardProps> = ({
  errorMessage,
  onRetry,
  onUseOfflineFallback,
  onOpenCreditCenter,
  onOpenSettings,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-6 p-5 rounded-2xl bg-gradient-to-b from-purple-950/90 via-purple-950/80 to-purple-950/70 border border-rose-500/50 shadow-2xl backdrop-blur-md animate-fade-in text-left">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 shrink-0">
          <AlertCircle className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h4 className="text-base font-bold text-rose-200 font-serif-mystic">
            ไม่สามารถประมวลผลคำขอ AI ได้ในขณะนี้
          </h4>
          <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
            {errorMessage || 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาตรวจสอบและเลือกทางแก้ไขด้านล่าง'}
          </p>
        </div>
      </div>

      <div className="text-[11px] text-purple-300 font-medium mb-3 pt-2 border-t border-rose-900/40">
        💡 คุณสามารถเลือกทางแก้ไข หรือสลับไปใช้การทำนายคลาสสิก (Offline) ได้ทันที:
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onOpenCreditCenter && (
          <button
            type="button"
            onClick={onOpenCreditCenter}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-purple-950 shadow-md transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>เติม เครดิต (Credit Center)</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-900/80 hover:bg-purple-800 border border-purple-500/40 text-amber-200 transition-all cursor-pointer"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>สลับไปใช้ Custom API Key</span>
          </button>
        )}

        {onUseOfflineFallback && (
          <button
            type="button"
            onClick={onUseOfflineFallback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-950 border border-amber-400/40 text-purple-200 hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>อ่านคำทำนายคลาสสิก (Offline)</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:text-white transition-all cursor-pointer ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ลองใหม่อีกครั้ง</span>
          </button>
        )}
      </div>
    </div>
  );
};
