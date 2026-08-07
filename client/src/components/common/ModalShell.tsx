import React, { useRef, type ReactNode } from 'react';
import { useModalA11y } from '../../hooks/useModalA11y';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible name — use titleId pointing at visible heading, or ariaLabel */
  titleId?: string;
  ariaLabel?: string;
  children: ReactNode;
  /** Panel max width class, e.g. max-w-lg */
  maxWidthClass?: string;
  /** Extra classes on the dialog panel */
  panelClassName?: string;
  /** Backdrop z-index class */
  zClass?: string;
  /** Close when clicking backdrop (default true) */
  closeOnBackdrop?: boolean;
  /**
   * When false, keep dialog mounted but disable Esc / focus trap / body lock
   * (use while a nested modal is open on top).
   */
  enableA11y?: boolean;
}

/**
 * Shared modal chrome: dialog role, aria-modal, focus trap, Esc, scroll lock, overscroll contain.
 */
export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  titleId,
  ariaLabel,
  children,
  maxWidthClass = 'max-w-lg',
  panelClassName = '',
  zClass = 'z-50',
  closeOnBackdrop = true,
  enableA11y = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(isOpen && enableA11y, onClose, dialogRef);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zClass} flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto overscroll-contain`}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={!titleId ? ariaLabel : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClass} my-auto outline-none ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
