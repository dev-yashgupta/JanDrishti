'use client';
import { useState, useCallback, useRef } from 'react';
import { reportsApi, dashboardApi, categoriesApi, clustersApi } from '@/services/api';
import type {
  Report, ReportFilters, PaginatedResponse, Category,
  DashboardSummary, CitizenDashboardSummary, AnalyticsData, ProblemCluster,
} from '@/types';

// ── Reports ───────────────────────────────────────────────────

export function useReports(initialFilters?: ReportFilters) {
  const [reports, setReports] = useState<PaginatedResponse<Report> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters || {});

  // Keep filters accessible inside the callback without adding it as a dep
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchReports = useCallback(async (overrideFilters?: ReportFilters) => {
    setLoading(true);
    const appliedFilters = overrideFilters ?? filtersRef.current;
    try {
      const result = await reportsApi.list(appliedFilters);
      setReports(result);
    } catch {
      // Silently fail — 401 is handled globally in api.ts
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable — never recreated

  const updateFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    const merged = { ...filtersRef.current, ...newFilters, page: 1 };
    setFilters(merged);
    fetchReports(merged);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable

  return { reports, loading, filters, fetchReports, updateFilters, setFilters };
}

// ── Single report ─────────────────────────────────────────────

export function useReport(id: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const result = await reportsApi.get(id);
      setReport(result);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  // id is stable per page render — safe dep
  }, [id]);

  return { report, loading, notFound, fetchReport };
}

// ── Categories ────────────────────────────────────────────────

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await categoriesApi.list());
    } finally {
      setLoading(false);
    }
  }, []); // stable

  return { categories, loading, fetchCategories };
}

// ── Admin dashboard ───────────────────────────────────────────

export function useAdminDashboard() {
  const [summary, setSummary]   = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading]   = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.analytics(),
      ]);
      setSummary(s);
      setAnalytics(a);
    } finally {
      setLoading(false);
    }
  }, []); // stable

  return { summary, analytics, loading, fetchAll };
}

// ── Citizen dashboard ─────────────────────────────────────────

export function useCitizenDashboard() {
  const [summary, setSummary] = useState<CitizenDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await dashboardApi.citizenSummary());
    } finally {
      setLoading(false);
    }
  }, []); // stable

  return { summary, loading, fetchSummary };
}

// ── Clusters ──────────────────────────────────────────────────

export function useClusters() {
  const [clusters, setClusters] = useState<PaginatedResponse<ProblemCluster> | null>(null);
  const [loading, setLoading]   = useState(false);

  const fetchClusters = useCallback(async (filters?: ReportFilters) => {
    setLoading(true);
    try {
      setClusters(await clustersApi.list(filters));
    } finally {
      setLoading(false);
    }
  }, []); // stable

  return { clusters, loading, fetchClusters };
}
