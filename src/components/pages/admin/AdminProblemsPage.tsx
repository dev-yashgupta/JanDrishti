'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ReportCard } from '@/components/shared/ReportCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReports, useCategories } from '@/hooks/useReports';
import type { ReportStatus, PriorityLevel } from '@/types';
import { Search, X } from 'lucide-react';

export function AdminProblemsPage() {
  const [query, setQuery]         = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [status, setStatus]       = useState<ReportStatus | 'ALL'>('ALL');
  const [priority, setPriority]   = useState<PriorityLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy]       = useState('priority');

  const { reports, loading, fetchReports } = useReports();
  const { categories, fetchCategories }    = useCategories();

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchReports({
        search: query || undefined,
        category_id: categoryId !== 'ALL' ? categoryId : undefined,
        status: status !== 'ALL' ? status : undefined,
        priority_level: priority !== 'ALL' ? priority : undefined,
        sort_by: sortBy as 'priority' | 'newest' | 'oldest' | 'most_reported',
        page: 1,
        per_page: 20,
      });
    }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryId, status, priority, sortBy]);

  const hasFilters = query || categoryId !== 'ALL' || status !== 'ALL' || priority !== 'ALL';
  function clearFilters() { setQuery(''); setCategoryId('ALL'); setStatus('ALL'); setPriority('ALL'); }

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Problems</h1>
            <span className="text-sm text-slate-400">({reports?.total ?? 0} total)</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, description, city…" className="pl-9" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={v => setStatus(v as ReportStatus | 'ALL')}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {['ALL','REPORTED','UNDER_REVIEW','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'].map(s => (
                  <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g,' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={v => setPriority(v as PriorityLevel | 'ALL')}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(p => (
                  <SelectItem key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Highest Priority</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="most_reported">Most Supported</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading…" className="py-20" />
        ) : !reports?.items.length ? (
          <EmptyState icon="🔍" title="No problems match your filters"
            action={{ label: 'Clear Filters', onClick: clearFilters }} />
        ) : (
          <div className="space-y-3">
            {reports.items.map(r => <ReportCard key={r.id} report={r} isAdmin />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
