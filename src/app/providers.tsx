'use client';
import { useEffect } from 'react';
import { I18nProvider } from '@/contexts/I18nContext';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { useAuthStore } from '@/store/authStore';
import { authApi, getStoredToken, clearStoredToken } from '@/services/api';

/**
 * TokenGuard — runs once on mount.
 *
 * If localStorage has a token, verify it against /api/auth/me.
 * If the backend rejects it (401 or network error), wipe the token
 * and Zustand auth state so the user sees a clean login page instead
 * of an "Invalid or expired token" runtime error on every page.
 *
 * This catches stale mock tokens from previous sessions.
 */
function TokenGuard() {
  const { clearAuth, setUser } = useAuthStore();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    // Reject obviously fake tokens (mock-jwt-* from previous demo sessions)
    if (token.startsWith('mock-jwt-') || token.startsWith('mock-')) {
      clearStoredToken();
      clearAuth();
      return;
    }

    // Validate against the real backend
    authApi.me()
      .then((user) => {
        // Token is valid — refresh the user object in Zustand
        setUser(user);
      })
      .catch(() => {
        // Token rejected by backend — wipe everything silently
        clearStoredToken();
        clearAuth();
      });
  // Run only once on mount — no deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <TokenGuard />
      {children}
      <ToastContainer />
    </I18nProvider>
  );
}
