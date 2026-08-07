import { useCallback, useEffect, useRef } from 'react';

/**
 * Manages AbortController for AI requests:
 * - start() aborts any in-flight request and returns a fresh signal
 * - aborts on unmount
 */
export function useAiAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const start = useCallback((): AbortSignal => {
    abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }, [abort]);

  useEffect(() => () => abort(), [abort]);

  return { start, abort };
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof Error && err.name === 'AbortError') ||
    (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError')
  );
}
