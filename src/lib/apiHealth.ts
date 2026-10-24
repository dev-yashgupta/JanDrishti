/**
 * Determines whether to hit the real backend API or use local fallback data.
 *
 * Rules (in order):
 *   NEXT_PUBLIC_USE_MOCK=true   → always mock
 *   NEXT_PUBLIC_USE_MOCK=false  → always real  (default)
 *   unset                       → real API; falls back to mock only on network error
 */

export function isMockForced(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

export function isRealForced(): boolean {
  // false OR unset → try real
  return process.env.NEXT_PUBLIC_USE_MOCK !== 'true';
}
