import { lazy, type ComponentType } from 'react';

/**
 * Enhanced React.lazy wrapper that automatically reloads the page once
 * if a dynamic module fails to fetch (e.g. when a new deployment replaces build hashes).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: any }>
) {
  return lazy(async () => {
    const pageHasBeenReloaded = sessionStorage.getItem('mystic_chunk_retry');

    try {
      const component = await factory();
      sessionStorage.removeItem('mystic_chunk_retry');
      return component as { default: T };
    } catch (error) {
      console.warn('[lazyWithRetry] Dynamic import failed:', error);
      if (!pageHasBeenReloaded) {
        sessionStorage.setItem('mystic_chunk_retry', 'true');
        window.location.reload();
        // Return a pending promise so React Suspense waits for page reload
        return new Promise<{ default: T }>(() => {});
      }
      sessionStorage.removeItem('mystic_chunk_retry');
      throw error;
    }
  });
}
