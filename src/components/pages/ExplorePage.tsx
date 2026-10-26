'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useReports, useCategories } from '@/hooks/useReports';
import type { ReportStatus, PriorityLevel, Report } from '@/types';
import { displayId, truncate } from '@/lib/utils';
import { Search, Plus, MapPin, Layers, ArrowRight, FilterX, AlertCircle } from 'lucide-react';

const PRIORITY_THEME: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: '#D92D20', bg: 'rgba(217, 45, 32, 0.08)', border: 'rgba(217, 45, 32, 0.25)' },
  HIGH:     { color: '#F04438', bg: 'rgba(240, 68, 56, 0.08)', border: 'rgba(240, 68, 56, 0.25)' },
  MEDIUM:   { color: '#F79009', bg: 'rgba(247, 144, 9, 0.08)', border: 'rgba(247, 144, 9, 0.25)' },
  LOW:      { color: '#12B76A', bg: 'rgba(18, 183, 106, 0.08)', border: 'rgba(18, 183, 106, 0.25)' },
};

export function ExplorePage() {
  const [query, setQuery]             = useState('');
  const [categoryId, setCategoryId]   = useState('ALL');
  const [status, setStatus]           = useState<ReportStatus | 'ALL'>('ALL');
  const [priority, setPriority]       = useState<PriorityLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy]           = useState('priority');

  const { reports, loading, fetchReports } = useReports();
  const { categories, fetchCategories }    = useCategories();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchReports({
        search: query.trim() || undefined,
        category_id: categoryId !== 'ALL' ? categoryId : undefined,
        status: status !== 'ALL' ? status : undefined,
        priority_level: priority !== 'ALL' ? priority : undefined,
        sort_by: sortBy as 'priority' | 'newest' | 'oldest' | 'most_reported',
        page: 1,
        per_page: 30,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [query, categoryId, status, priority, sortBy, fetchReports]);

  function resetFilters() {
    setQuery('');
    setCategoryId('ALL');
    setStatus('ALL');
    setPriority('ALL');
    setSortBy('priority');
  }

  const items: Report[] = reports?.items ?? [];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Community Problems
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Full civic incident registry with multi-parameter filtering and transparent prioritization.
            </p>
          </div>
          <Link href="/report" className="self-start md:self-auto">
            <button className="px-4 py-2.5 bg-[#155EEF] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/25 transition flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Report Problem</span>
            </button>
          </Link>
        </div>

        {/* Filter & Search Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)] mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search query */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search description, locality, or keyword..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#155EEF] focus:bg-white transition text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category Select */}
          <div>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#155EEF] focus:bg-white transition text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Select */}
          <div>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as PriorityLevel | 'ALL')}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#155EEF] focus:bg-white transition text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (81-100)</option>
              <option value="HIGH">High (61-80)</option>
              <option value="MEDIUM">Medium (31-60)</option>
              <option value="LOW">Low (0-30)</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ReportStatus | 'ALL')}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#155EEF] focus:bg-white transition text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">AI Analyzed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Content State: Loading, Empty, or Grid */}
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Searching community problem registry..." />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E4E7EC] p-8 shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <FilterX className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching community problems found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try clearing your filters or search keywords to view the broader civic log.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(p => {
              const theme = PRIORITY_THEME[p.priority_level] || PRIORITY_THEME.LOW;
              const displayLoc = p.location
                ? `${p.location.locality ? p.location.locality + ', ' : ''}${p.location.city || 'Gurugram'}`
                : 'Gurugram, Haryana';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_12px_24px_-4px_rgba(16,24,40,0.08)] transition-all duration-200 p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Priority Pill & ID */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: theme.color,
                          backgroundColor: theme.bg,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {p.priority_level} ({p.priority_score})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        {displayId(p.id)}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div>
                      <span className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wide">
                        {p.category?.name || 'Civic Infrastructure'}
                      </span>
                      <Link href={`/reports/${p.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#155EEF] transition-colors cursor-pointer">
                          {p.title}
                        </h3>
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Location */}
                    <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{displayLoc}</span>
                    </div>
                  </div>

                  {/* Card Footer: Clustered Count & View Dossier CTA */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#0E9384]" />
                      <span>{p.support_count || 1} supporters / clustered</span>
                    </span>
                    <Link href={`/reports/${p.id}`}>
                      <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#155EEF] rounded-lg text-xs font-bold transition flex items-center gap-1">
                        <span>View Dossier</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
