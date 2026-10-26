'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi, usersApi, setStoredToken, clearStoredToken } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import type { LoginCredentials, RegisterData, User } from '@/types';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, setUser, clearAuth, setLoading } =
    useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const { user, tokens } = await authApi.login(credentials);
        setStoredToken(tokens.access_token);
        setAuth(user, tokens.access_token);
        addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${user.full_name}` });

        if (user.role === 'SUPER_ADMIN' || user.role === 'AUTHORITY') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid email or password.';
        addToast({ type: 'error', title: 'Login failed', message: msg });
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, addToast, router]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      try {
        const { user, tokens } = await authApi.register(data);
        setStoredToken(tokens.access_token);
        setAuth(user, tokens.access_token);
        addToast({ type: 'success', title: 'Account created!', message: 'Welcome to JanDrishti AI.' });
        router.push('/dashboard');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        addToast({ type: 'error', title: 'Registration failed', message: msg });
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, addToast, router]
  );

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearStoredToken();
    clearAuth();
    addToast({ type: 'info', title: 'Logged out' });
    router.push('/');
  }, [clearAuth, addToast, router]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      clearAuth();
    }
  }, [setUser, clearAuth]);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      setLoading(true);
      try {
        const targetId = user?.id || 'me';
        const updated = await usersApi.update(targetId, data);
        setUser(updated);
        addToast({ type: 'success', title: 'Profile updated', message: 'Your personal details have been saved.' });
        return { success: true, user: updated };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update profile.';
        addToast({ type: 'error', title: 'Update failed', message: msg });
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [user, setUser, setLoading, addToast]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    isAuthority: user?.role === 'AUTHORITY' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  };
}
