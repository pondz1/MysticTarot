import React from 'react';
import { AlertTriangle, Coins, RefreshCw } from 'lucide-react';
import type { AiCompletionMeta } from '../../services/ai/aiClient';

interface AiResultMetaBarProps {
  meta: AiCompletionMeta | null | undefined;
  className?: string;
}

/**
 * Compact status strip under a prediction: credits used, truncated, cache hit.
 */
export const AiResultMetaBar: React.FC<AiResultMetaBarProps> = ({ meta, className = '' }) => {
  if (!meta) return null;

  const chips: { key: string; icon: React.ReactNode; label: string; tone: string }[] = [];

  if (typeof meta.creditsDeducted === 'number' && meta.creditsDeducted > 0) {
    chips.push({
      key: 'credits',
      icon: <Coins className="w-3.5 h-3.5" aria-hidden="true" />,
      label: `ใช้ ${meta.creditsDeducted} Credit`,
      tone: 'border-amber-400/35 bg-amber-500/10 text-amber-100',
    });
  }

  if (meta.cached) {
    chips.push({
      key: 'cached',
      icon: <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />,
      label: 'ผลจาก cache (ไม่หักซ้ำ)',
      tone: 'border-sky-400/35 bg-sky-500/10 text-sky-100',
    });
  }

  if (meta.truncated || meta.finishReason === 'length') {
    chips.push({
      key: 'truncated',
      icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
      label: 'คำตอบอาจถูกตัดเพราะยาวเกินงบ',
      tone: 'border-rose-400/35 bg-rose-500/10 text-rose-100',
    });
  }

  if (meta.partial && !meta.truncated) {
    chips.push({
      key: 'partial',
      icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
      label: 'ผลบางส่วน (เชื่อมต่อสะดุดหรือยกเลิกกลางทาง)',
      tone: 'border-orange-400/35 bg-orange-500/10 text-orange-100',
    });
  }

  if (chips.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 mt-3 ${className}`}
      role="status"
      aria-label="สถานะผลทำนาย"
    >
      {chips.map((c) => (
        <span
          key={c.key}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${c.tone}`}
        >
          {c.icon}
          {c.label}
        </span>
      ))}
    </div>
  );
};
