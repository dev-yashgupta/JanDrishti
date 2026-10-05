'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReportCard } from '@/components/shared/ReportCard';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_REPORTS, MOCK_CATEGORIES } from '@/services/mockData';
import type { Report, ReportStatus, PriorityLevel } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const STATUS_OPTIONS: { value: ReportStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'REPORTED', label: 'Reported' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const PRIORITY_OPTIONS: { value: PriorityLevel | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Highest Priority' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'support', label: 'Most Supported' },
];

export function ExplorePage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('ALL');
  const [status, setStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);
  const [filtered, setFiltered] = useState<Report[]>(MOCK_REPORTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let results = [...MOCK_REPORTS];
      if (query) {
        const q = query.toLowerCase();
        results = results.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location?.city.toLowerCase().includes(q)
        );
      }
      if (categoryId !== 'ALL') results = results.filter(r => r.category_id === categoryId);
      if (status !== 'ALL') results = results.filter(r => r.status === status);
      if (priority !== 'ALL') results = results.filter(r => r.priority_level === priority);

      if (sortBy === 'priority') results.sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
      else if (sortBy === 'newest') results.sort((a, b) => b.created_at.localeCompare(a.created_at));
      else if (sortBy === 'oldest') results.sort((a, b) => a.created_at.localeCompare(b.created_at));
      else if (sortBy === 'support') results.sort((a, b) => b.support_count - a.support_count);

      setFiltered(results);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, categoryId, status, priority, sortBy]);

  const hasFilters = query || categoryId !== 'ALL' || status !== 'ALL' || priority !== 'ALL';

  function clearFilters() {
    setQuery(''); setCategoryId('ALL'); setStatus('ALL'); setPriority('ALL');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Explore Community Issues</h1>
            <DemoLabel />
          </div>
          <p className="text-slate-500 text-sm mb-6">Browse, search and filter civic problems reported across India.</p>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, description or city…"
                className="pl-9"
                aria-label="Search problems"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(v => !v)} className="gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="h-2 w-2 rounded-full bg-blue-600" />}
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger aria-label="Category filter"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {MOCK_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={v => setStatus(v as ReportStatus | 'ALL')}>
                <SelectTrigger aria-label="Status filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={priority} onValueChange={v => setPriority(v as PriorityLevel | 'ALL')}>
                <SelectTrigger aria-label="Priority filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger aria-label="Sort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {loading ? 'Searching…' : `${filtered.length} problem${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading problems…" className="py-20" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No problems found"
            description="Try adjusting your search or filters."
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
