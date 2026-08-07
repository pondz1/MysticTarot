import React from 'react';
import { Check } from 'lucide-react';

export type ReadingStep = 1 | 2 | 3 | 4;

interface ReadingProgressStepsProps {
  currentStep: ReadingStep;
  /** When true, steps 1–2 are complete (cards already drawn) */
  cardsDrawn?: boolean;
  /** When true, step 4 is active (analyzing or result ready) */
  hasResult?: boolean;
}

const STEPS: { id: ReadingStep; label: string; shortLabel: string }[] = [
  { id: 1, label: 'เลือกรูปแบบ', shortLabel: 'รูปแบบ' },
  { id: 2, label: 'ตั้งคำถาม', shortLabel: 'คำถาม' },
  { id: 3, label: 'เลือกไพ่', shortLabel: 'เลือกไพ่' },
  { id: 4, label: 'คำทำนาย', shortLabel: 'ผลลัพธ์' },
];

export const ReadingProgressSteps: React.FC<ReadingProgressStepsProps> = ({
  currentStep,
  cardsDrawn = false,
  hasResult = false,
}) => {
  const getStepState = (stepId: ReadingStep): 'complete' | 'current' | 'upcoming' => {
    if (stepId < currentStep) return 'complete';
    if (stepId === currentStep) return 'current';
    // After cards drawn, 1–3 complete when on result
    if (cardsDrawn && stepId <= 3 && hasResult) return 'complete';
    return 'upcoming';
  };

  return (
    <nav
      aria-label="ขั้นตอนการทำนายไพ่ยิปซี"
      className="w-full max-w-lg mx-auto mb-4 sm:mb-6 px-2"
    >
      <ol className="grid grid-cols-4 gap-1 sm:gap-2">
        {STEPS.map((step) => {
          const state = getStepState(step.id);
          const isComplete = state === 'complete';
          const isCurrent = state === 'current';

          return (
            <li key={step.id} className="flex flex-col items-center gap-1 min-w-0">
              <div
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold border transition-colors ${
                  isComplete
                    ? 'bg-amber-500/90 border-amber-400 text-slate-950'
                    : isCurrent
                      ? 'bg-amber-500/15 border-amber-400 text-amber-100'
                      : 'bg-slate-900/80 border-slate-700 text-slate-500'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium truncate max-w-full text-center ${
                  isCurrent
                    ? 'text-amber-100'
                    : isComplete
                      ? 'text-amber-200/60'
                      : 'text-slate-500'
                }`}
              >
                <span className="sm:hidden">{step.shortLabel}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
