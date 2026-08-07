/**
 * Typed in-app credit balance bus.
 * Prefer AuthContext.updateCredits / publishCredits over raw window events.
 */

type CreditsListener = (credits: number) => void;

const listeners = new Set<CreditsListener>();

export function subscribeCredits(listener: CreditsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishCredits(credits: number): void {
  const safe = Math.max(0, Math.floor(Number(credits) || 0));
  for (const listener of listeners) {
    try {
      listener(safe);
    } catch (e) {
      console.warn('[creditEvents] listener error:', e);
    }
  }

  // Backward-compatible bridge for any remaining window listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: safe }));
  }
}
