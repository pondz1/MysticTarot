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
   * When false, keep dialog mounted but disable Esc / focus trap
   * (use while a nested modal is open on top).
   * Body scroll lock stays until isOpen becomes false.
   */
  enableA11y?: boolean;
  /**
   * Vertical alignment of the panel inside the viewport.
   * - center: short dialogs
   * - start: tall dialogs (avoids re-center jump when content height changes)
   */
  align?: 'center' | 'start';
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
  align = 'start',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(isOpen, onClose, dialogRef, { trapFocus: enableA11y });

  if (!isOpen) return null;

  const alignClass = align === 'center' ? 'items-center' : 'items-start';

  return (
    <div
      className={`fixed inset-0 ${zClass} overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm`}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      {/*
        items-start + top padding: tall content (QR 2:3) won't re-center on re-render.
        animate-fade-in removed from shell — re-mount animation on parent re-render felt like jump.
      */}
      <div
        className={`flex min-h-full ${alignClass} justify-center p-3 sm:p-4 pt-6 sm:pt-10 pb-10`}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-label={!titleId ? ariaLabel : undefined}
          tabIndex={-1}
          className={`relative w-full ${maxWidthClass} outline-none ${panelClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
