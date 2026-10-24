'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReportCard } from '@/components/shared/ReportCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReports, useCategories } from '@/hooks/useReports';
import type { ReportStatus, PriorityLevel } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export function ExplorePage() {
  const [query, setQuery]         = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [status, setStatus]       = useState<ReportStatus | 'ALL'>('ALL');
  const [priority, setPriority]   = useState<PriorityLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy]       = useState('priority');
  const [showFilters, setShowFilters] = useState(false);

  const { reports, loading, fetchReports } = useReports();
  const { categories, fetchCategories }    = useCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

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

  function clearFilters() {
    setQuery(''); setCategoryId('ALL'); setStatus('ALL'); setPriority('ALL');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Explore Community Issues</h1>
          <p className="text-slate-500 text-sm mb-6">Browse, search and filter civic problems reported across India.</p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, description or city…" className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(v => !v)} className="gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="h-2 w-2 rounded-full bg-blue-600" />}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={v => setStatus(v as ReportStatus | 'ALL')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['ALL','REPORTED','UNDER_REVIEW','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'].map(s => (
                    <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g,' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={v => setPriority(v as PriorityLevel | 'ALL')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_reported">Most Supported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
              <X className="h-3 w-3" /> Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${reports?.total ?? 0} problem${reports?.total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading problems…" className="py-20" />
        ) : !reports?.items.length ? (
          <EmptyState icon="🔍" title="No problems found"
            description="Try adjusting your search or filters."
            action={{ label: 'Clear Filters', onClick: clearFilters }} />
        ) : (
          <div className="space-y-3">
            {reports.items.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
