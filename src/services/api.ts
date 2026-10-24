// ============================================================
// API Service Layer — abstracts all HTTP calls to the backend
// Falls back gracefully when backend is unavailable (mock mode)
// ============================================================

import { API_BASE_URL } from '@/lib/constants';
import type {
  User, AuthTokens, LoginCredentials, RegisterData,
  Report, ReportCreateData, ReportFilters,
  Category, PaginatedResponse, DashboardSummary,
  CitizenDashboardSummary, AnalyticsData, ProblemCluster,
  ClusterDetail, Notification, StatusHistory, Comment,
  AIConfig,
} from '@/types';

// ── Token storage ────────────────────────────────────────────
const TOKEN_KEY = 'jd_access_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Called automatically on any 401 — wipes token + Zustand state */
function handleUnauthorized() {
  clearStoredToken();
  // Clear Zustand auth state without importing the store (avoids circular deps)
  // The store's persist key is 'jd-auth'
  try {
    localStorage.removeItem('jd-auth');
  } catch { /* ignore */ }
  // Redirect to login only if we are in a browser and not already there
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

// ── Base fetch wrapper ───────────────────────────────────────
interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (auth) {
    const token = getStoredToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Request failed' }));

    // 401 = token invalid or expired → clear auth and redirect
    if (res.status === 401) {
      handleUnauthorized();
    }

    throw new APIError(errorData.detail || 'Request failed', res.status, errorData.errors);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class APIError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errors = errors;
  }
}

// ── Auth API ─────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterData) =>
    request<{ user: User; tokens: AuthTokens }>('/auth/register', { method: 'POST', body: data, auth: false }),

  login: (data: LoginCredentials) =>
    request<{ user: User; tokens: AuthTokens }>('/auth/login', { method: 'POST', body: data, auth: false }),

  me: () => request<User>('/auth/me'),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

// ── Reports API ───────────────────────────────────────────────
export const reportsApi = {
  create: (data: ReportCreateData) =>
    request<Report>('/reports', { method: 'POST', body: data }),

  list: (filters?: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
    }
    return request<PaginatedResponse<Report>>(`/reports?${params}`);
  },

  get: (id: string) => request<Report>(`/reports/${id}`),

  update: (id: string, data: Partial<ReportCreateData>) =>
    request<Report>(`/reports/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    request<void>(`/reports/${id}`, { method: 'DELETE' }),

  support: (id: string) =>
    request<{ support_count: number }>(`/reports/${id}/support`, { method: 'POST' }),

  changeStatus: (id: string, new_status: string, note?: string) =>
    request<Report>(`/reports/${id}/status`, { method: 'PATCH', body: { new_status, note } }),

  assign: (id: string, data: { assigned_to_id: string; department?: string; due_date?: string; notes?: string }) =>
    request<Report>(`/reports/${id}/assign`, { method: 'POST', body: data }),

  getStatusHistory: (id: string) =>
    request<StatusHistory[]>(`/reports/${id}/history`),

  addComment: (id: string, data: { content: string; is_internal: boolean }) =>
    request<Comment>(`/reports/${id}/comments`, { method: 'POST', body: data }),

  getComments: (id: string) =>
    request<Comment[]>(`/reports/${id}/comments`),

  myReports: () =>
    request<PaginatedResponse<Report>>('/reports?my=true'),
};

// ── Categories API ────────────────────────────────────────────
export const categoriesApi = {
  list: () => request<Category[]>('/categories', { auth: false }),
  get: (id: string) => request<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) =>
    request<Category>('/categories', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: data }),
};

// ── Dashboard API ─────────────────────────────────────────────
export const dashboardApi = {
  summary: () => request<DashboardSummary>('/dashboard/summary'),
  citizenSummary: () => request<CitizenDashboardSummary>('/dashboard/citizen-summary'),
  analytics: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return request<AnalyticsData>(`/dashboard/analytics?${params}`);
  },
};

// ── Clusters API ──────────────────────────────────────────────
export const clustersApi = {
  list: (filters?: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
    }
    return request<PaginatedResponse<ProblemCluster>>(`/clusters?${params}`);
  },
  get: (id: string) => request<ClusterDetail>(`/clusters/${id}`),
};

// ── Notifications API ─────────────────────────────────────────
export const notificationsApi = {
  list: () => request<Notification[]>('/notifications'),
  markRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'PATCH' }),
};

// ── Users API (admin) ─────────────────────────────────────────
export const usersApi = {
  list: (params?: { search?: string; role?: string; page?: number; per_page?: number }) => {
    const qp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qp.set(k, String(v)); });
    return request<PaginatedResponse<User>>(`/users?${qp}`);
  },
  get: (id: string) => request<User>(`/users/${id}`),
  update: (id: string, data: Partial<User>) =>
    request<User>(`/users/${id}`, { method: 'PATCH', body: data }),
  deactivate: (id: string) =>
    request<User>(`/users/${id}/deactivate`, { method: 'PATCH' }),
  activate: (id: string) =>
    request<User>(`/users/${id}/activate`, { method: 'PATCH' }),
};

// ── AI Config API (super admin) ───────────────────────────────
export const aiConfigApi = {
  get: () => request<AIConfig>('/admin/ai-config'),
  update: (data: AIConfig) => request<AIConfig>('/admin/ai-config', { method: 'PUT', body: data }),
};

// ── File upload ───────────────────────────────────────────────
export async function uploadMedia(reportId: string, file: File): Promise<{ url: string; id: string }> {
  const token = getStoredToken();
  const form = new FormData();
  form.append('file', file);
  form.append('report_id', reportId);

  const res = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) throw new APIError('File upload failed', res.status);
  return res.json();
}

// ── Nearby problems ───────────────────────────────────────────
export function getNearbyProblems(lat: number, lng: number, radiusKm = 5) {
  return request<Report[]>(`/problems/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
}
