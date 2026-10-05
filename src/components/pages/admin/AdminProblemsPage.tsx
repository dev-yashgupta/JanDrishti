'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ReportCard } from '@/components/shared/ReportCard';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MOCK_REPORTS, MOCK_CATEGORIES } from '@/services/mockData';
import type { Report, ReportStatus, PriorityLevel } from '@/types';
import { Search, SlidersHorizontal, X, Download } from 'lucide-react';

export function AdminProblemsPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [status, setStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState('priority');
  const [results, setResults] = useState<Report[]>(MOCK_REPORTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      let data = [...MOCK_REPORTS];
      if (query) { const q = query.toLowerCase(); data = data.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.location?.city.toLowerCase().includes(q)); }
      if (categoryId !== 'ALL') data = data.filter(r => r.category_id === categoryId);
      if (status !== 'ALL') data = data.filter(r => r.status === status);
      if (priority !== 'ALL') data = data.filter(r => r.priority_level === priority);
      if (sortBy === 'priority') data.sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
      else if (sortBy === 'newest') data.sort((a, b) => b.created_at.localeCompare(a.created_at));
      else if (sortBy === 'support') data.sort((a, b) => b.support_count - a.support_count);
      setResults(data);
      setLoading(false);
    }, 150);
    return () => clearTimeout(t);
  }, [query, categoryId, status, priority, sortBy]);

  const hasFilters = query || categoryId !== 'ALL' || status !== 'ALL' || priority !== 'ALL';
  function clearFilters() { setQuery(''); setCategoryId('ALL'); setStatus('ALL'); setPriority('ALL'); }

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Problems</h1>
            <DemoLabel />
            <span className="text-sm text-slate-400">({results.length} shown)</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export</Button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, description, city…" className="pl-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {MOCK_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
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
                <SelectItem value="support">Most Supported</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <LoadingSpinner size="lg" label="Loading…" className="py-20" />
        ) : results.length === 0 ? (
          <EmptyState icon="🔍" title="No problems match your filters" action={{ label: 'Clear Filters', onClick: clearFilters }} />
        ) : (
          <div className="space-y-3">
            {results.map(r => <ReportCard key={r.id} report={r} isAdmin />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
