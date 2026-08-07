import React, { useState } from 'react';
import { RefreshCw, Save, Moon } from 'lucide-react';
import type { ChatMessage } from '../types/tarot';
import { AiFollowUpChat } from './AiFollowUpChat';
import {
  PredictionLoading,
  PredictionPanel,
} from '../../../components/common/PredictionPanel';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-2 sm:px-4">
      {isAnalyzing && !resultText && (
        <PredictionLoading
          message="กำลังวิเคราะห์คำทำนาย…"
          detail="โปรดรอสักครู่ ระบบกำลังประมวลผลจากไพ่ที่คุณเลือก"
        />
      )}

      {resultText && (
        <PredictionPanel
          title="บทวิเคราะห์คำทำนาย"
          markdown={resultText}
          isStreaming={isAnalyzing}
          onCopy={handleCopy}
          copied={copied}
          headerActions={
            <button
              type="button"
              onClick={onSaveReading}
              disabled={isSaved}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title="บันทึกคำทำนายลงประวัติ"
            >
              <Save className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกคำทำนาย'}</span>
            </button>
          }
          footer={
            <div className="space-y-6">
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

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-amber-400/80" aria-hidden="true" />
                  <span>คำทำนายถูกบันทึกในประวัติอัตโนมัติเมื่อใช้ AI</span>
                </p>

                <button
                  type="button"
                  onClick={onNewReading}
                  className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>เริ่มทำนายรอบใหม่</span>
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};
