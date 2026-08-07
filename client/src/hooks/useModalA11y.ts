import { useEffect, useRef, useCallback, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );
}

/** Nested modals: only unlock body when the last modal closes. */
let bodyLockCount = 0;

function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (bodyLockCount === 0) {
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount += 1;
}

function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) {
    document.body.style.overflow = '';
  }
}

export type UseModalA11yOptions = {
  /**
   * When false, keep body scroll-lock / open state but disable Esc + focus trap
   * (nested modal on top). Does NOT restore focus — that only runs when isOpen becomes false.
   */
  trapFocus?: boolean;
};

/**
 * Modal accessibility: Escape to close, focus trap, restore focus, body scroll lock.
 *
 * Important: focus restore runs only when `isOpen` goes false — not when `trapFocus`
 * toggles. Nested modals previously restored focus and jumped the page scroll upward.
 */
export function useModalA11y(
  isOpen: boolean,
  onClose: () => void,
  dialogRef: RefObject<HTMLElement | null>,
  options: UseModalA11yOptions = {}
) {
  const trapFocus = options.trapFocus !== false;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || !trapFocus) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = getFocusable(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialogRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [isOpen, trapFocus, onClose, dialogRef]
  );

  // Body scroll lock for full open lifetime (refcounted for nested modals)
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev && typeof prev.focus === 'function') {
        try {
          // preventScroll avoids the page jumping upward when focus returns
          prev.focus({ preventScroll: true });
        } catch {
          // element may be gone
        }
      }
    };
  }, [isOpen]);

  // Focus trap + Esc only while this layer is the active topmost dialog
  useEffect(() => {
    if (!isOpen || !trapFocus) return;

    const focusTimer = window.setTimeout(() => {
      const root = dialogRef.current;
      if (!root) return;
      // Don't steal focus if something inside is already focused
      if (root.contains(document.activeElement)) return;
      const focusable = getFocusable(root);
      const preferred =
        root.querySelector<HTMLElement>('[data-modal-initial-focus]') || focusable[0] || root;
      try {
        preferred.focus({ preventScroll: true });
      } catch {
        preferred.focus();
      }
    }, 0);

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
      // Do NOT restore focus here — nested modal would jump scroll
    };
  }, [isOpen, trapFocus, handleKeyDown, dialogRef]);
}

/** True when user prefers reduced motion (safe for confetti / decorative animation). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
