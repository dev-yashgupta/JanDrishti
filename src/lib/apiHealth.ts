/**
 * Backend health detection — checks if the FastAPI backend is reachable.
 * Used to decide between real API calls and mock data fallback.
 */

import { API_BASE_URL } from '@/lib/constants';

let _cached: boolean | null = null;
let _checking = false;

export function isMockMode(): boolean {
  // Explicit override via env var
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return true;
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'false') return false;
  // Default: try real backend, fall back to mock
  return false;
}

export async function checkBackendHealth(): Promise<boolean> {
  if (_cached !== null) return _cached;
  if (_checking) return false;
  _checking = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeout);
    _cached = resp.ok;
    return _cached;
  } catch {
    _cached = false;
    return false;
  } finally {
    _checking = false;
  }
}

export function resetHealthCache() {
  _cached = null;
}

/** Returns true if we should use mock data (no backend or explicit override) */
export async function shouldUseMock(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return true;
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'false') return false;
  // Auto-detect
  const healthy = await checkBackendHealth();
  return !healthy;
}
