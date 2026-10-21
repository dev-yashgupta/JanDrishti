import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi, setStoredToken, clearStoredToken } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { shouldUseMock } from '@/lib/apiHealth';
import { MOCK_CITIZEN, MOCK_AUTHORITY, MOCK_SUPERADMIN } from '@/services/mockData';
import type { LoginCredentials, RegisterData, User } from '@/types';

// Demo accounts for mock fallback
const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'citizen@demo.jandrishti.in': { password: 'Demo@1234', user: MOCK_CITIZEN },
  'authority@demo.jandrishti.in': { password: 'Demo@1234', user: MOCK_AUTHORITY },
  'admin@demo.jandrishti.in': { password: 'Demo@1234', user: MOCK_SUPERADMIN },
};

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, setUser, clearAuth, setLoading } =
    useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const useMock = await shouldUseMock();

        if (useMock) {
          // Mock login — check demo accounts
          const demo = DEMO_ACCOUNTS[credentials.email.toLowerCase()];
          if (!demo || demo.password !== credentials.password) {
            throw new Error('Invalid credentials. Use a demo account (see login page).');
          }
          const mockToken = `mock-jwt-${Date.now()}`;
          setStoredToken(mockToken);
          setAuth(demo.user, mockToken);
          addToast({ type: 'success', title: 'Welcome back! (Demo Mode)', message: `Logged in as ${demo.user.full_name}` });
        } else {
          // Real backend login
          const { user, tokens } = await authApi.login(credentials);
          setStoredToken(tokens.access_token);
          setAuth(user, tokens.access_token);
          addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${user.full_name}` });
        }

        // Route based on role
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'AUTHORITY') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
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
        const useMock = await shouldUseMock();

        if (useMock) {
          // Mock registration — create a local user object
          const newUser: User = {
            id: `user-${Date.now()}`,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            role: (data.role as 'CITIZEN' | 'AUTHORITY') || 'CITIZEN',
            preferred_language: data.preferred_language as 'en',
            city: data.city,
            state: data.state,
            is_active: true,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const mockToken = `mock-jwt-${Date.now()}`;
          setStoredToken(mockToken);
          setAuth(newUser, mockToken);
          addToast({ type: 'success', title: 'Account created! (Demo Mode)', message: 'Welcome to JanDrishti AI.' });
        } else {
          const { user, tokens } = await authApi.register(data);
          setStoredToken(tokens.access_token);
          setAuth(user, tokens.access_token);
          addToast({ type: 'success', title: 'Account created!', message: 'Welcome to JanDrishti AI.' });
        }

        router.push('/dashboard');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed.';
        addToast({ type: 'error', title: 'Registration failed', message: msg });
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, addToast, router]
  );

  const logout = useCallback(async () => {
    try {
      if (!(await shouldUseMock())) {
        await authApi.logout();
      }
    } catch {
      // ignore
    }
    clearStoredToken();
    clearAuth();
    addToast({ type: 'info', title: 'Logged out', message: 'See you again!' });
    router.push('/');
  }, [clearAuth, addToast, router]);

  const refreshUser = useCallback(async () => {
    try {
      if (await shouldUseMock()) return; // nothing to refresh in mock mode
      const me = await authApi.me();
      setUser(me);
    } catch {
      clearAuth();
    }
  }, [setUser, clearAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    isAuthority: user?.role === 'AUTHORITY' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  };
}
