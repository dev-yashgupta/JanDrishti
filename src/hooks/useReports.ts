import { useState, useCallback } from 'react';
import { reportsApi } from '@/services/api';
import { MOCK_REPORTS, mockPaginated } from '@/services/mockData';
import { useToast } from './useToast';
import type { Report, ReportFilters, PaginatedResponse } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true; // default mock in dev

export function useReports(initialFilters?: ReportFilters) {
  const toast = useToast();
  const [reports, setReports] = useState<PaginatedResponse<Report> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters || {});

  const fetchReports = useCallback(
    async (overrideFilters?: ReportFilters) => {
      setLoading(true);
      const appliedFilters = overrideFilters ?? filters;
      try {
        if (USE_MOCK) {
          let data = [...MOCK_REPORTS];
          if (appliedFilters.search) {
            const q = appliedFilters.search.toLowerCase();
            data = data.filter(
              (r) =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.category?.name.toLowerCase().includes(q)
            );
          }
          if (appliedFilters.category_id)
            data = data.filter((r) => r.category_id === appliedFilters.category_id);
          if (appliedFilters.status)
            data = data.filter((r) => r.status === appliedFilters.status);
          if (appliedFilters.priority_level)
            data = data.filter((r) => r.priority_level === appliedFilters.priority_level);
          if (appliedFilters.city)
            data = data.filter((r) => r.location?.city === appliedFilters.city);

          // Sorting
          if (appliedFilters.sort_by === 'priority') {
            data.sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
          } else if (appliedFilters.sort_by === 'oldest') {
            data.sort((a, b) => a.created_at.localeCompare(b.created_at));
          } else {
            data.sort((a, b) => b.created_at.localeCompare(a.created_at));
          }

          setReports(mockPaginated(data, appliedFilters.page || 1, appliedFilters.per_page || 10));
        } else {
          const result = await reportsApi.list(appliedFilters);
          setReports(result);
        }
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    },
    [filters, toast]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<ReportFilters>) => {
      const merged = { ...filters, ...newFilters, page: 1 };
      setFilters(merged);
      fetchReports(merged);
    },
    [filters, fetchReports]
  );

  return { reports, loading, filters, fetchReports, updateFilters, setFilters };
}

export function useReport(id: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        const found = MOCK_REPORTS.find((r) => r.id === id);
        setReport(found ?? null);
      } else {
        const result = await reportsApi.get(id);
        setReport(result);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { report, loading, fetchReport };
}
