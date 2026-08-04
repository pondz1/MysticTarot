import React from 'react';
import type { SavedReading } from '../types/tarot';
import { X, History, Trash2, ExternalLink } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReadings: SavedReading[];
  onLoadReading: (reading: SavedReading) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedReadings,
  onLoadReading,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-bold font-serif-mystic text-gold-gradient">
              ประวัติการเปิดไพ่และคำทำนายที่บันทึกไว้
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {savedReadings.length === 0 ? (
            <div className="text-center py-12 text-purple-300/70 text-xs">
              ยังไม่มีประวัติคำทำนายที่บันทึกไว้
            </div>
          ) : (
            savedReadings.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl glass-panel border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-amber-300 border border-purple-500/30">
                      {item.spreadMode === 'single' ? 'ไพ่ 1 ใบ' : 'ไพ่ 3 ใบ'}
                    </span>
                    <span className="text-[11px] text-purple-300 ml-2">{item.timestamp}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadReading(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 font-bold bg-amber-600/30 px-3.5 py-1.5 rounded-lg border border-amber-400/40"
                  >
                    <span>ดูผลทำนาย</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-amber-100 font-medium line-clamp-1">
                  คำถาม: {item.question || 'ภาพรวมชะตาประจำวัน'}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-purple-200/80">
                  <span>ไพ่ที่ได้:</span>
                  {item.drawnCards.map((c, i) => (
                    <span key={i} className="font-serif-mystic text-amber-200">
                      {c.card.nameTh.split(' (')[0]} {i < item.drawnCards.length - 1 ? '•' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedReadings.length > 0 && (
          <div className="mt-4 pt-3 border-t border-amber-500/20 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-500/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างประวัติทั้งหมด</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
