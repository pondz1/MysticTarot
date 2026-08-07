import React, { type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { cn } from '../../lib/utils';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  ariaLabel?: string;
  children: ReactNode;
  maxWidthClass?: string;
  panelClassName?: string;
  zClass?: string;
  closeOnBackdrop?: boolean;
  enableA11y?: boolean;
  /** API compat — centering always via Radix fixed + translate */
  align?: 'center' | 'start';
  scrollPanel?: boolean;
}

function resolveZ(zClass: string): { overlay: string; content: string } {
  if (zClass.includes('100')) {
    return { overlay: 'z-[100]', content: 'z-[101]' };
  }
  if (zClass.includes('60')) {
    return { overlay: 'z-[60]', content: 'z-[61]' };
  }
  return { overlay: 'z-50', content: 'z-50' };
}

/**
 * Radix Dialog shell — portal + true center.
 * Theme surface (glass-panel-gold, borders) comes from panelClassName only.
 */
export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  titleId,
  ariaLabel = 'Dialog',
  children,
  maxWidthClass = 'max-w-lg',
  panelClassName = '',
  zClass = 'z-50',
  closeOnBackdrop = true,
  enableA11y = true,
  scrollPanel = true,
}) => {
  const { overlay, content } = resolveZ(zClass);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      modal
    >
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (!enableA11y) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (!closeOnBackdrop) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (!closeOnBackdrop) e.preventDefault();
        }}
        aria-describedby={undefined}
        aria-labelledby={titleId}
        overlayClassName={cn(overlay, 'bg-black/75 backdrop-blur-[2px]')}
        className={cn(
          content,
          'w-[calc(100vw-1.5rem)] sm:w-full max-w-[calc(100vw-1.5rem)]',
          maxWidthClass,
          scrollPanel
            ? 'max-h-[min(90dvh,90vh)] overflow-y-auto overscroll-contain'
            : 'max-h-[min(90dvh,90vh)] overflow-hidden',
          // Layout only — do NOT set bg/border here (would fight glass-panel-gold)
          'outline-none',
          // Default mystic panel if caller forgets panelClassName
          !panelClassName.includes('glass-panel') &&
            'glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl',
          panelClassName
        )}
      >
        <DialogTitle className="sr-only">{ariaLabel}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
};
