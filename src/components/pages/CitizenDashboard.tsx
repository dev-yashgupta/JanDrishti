'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useReports, useCitizenDashboard } from '@/hooks/useReports';
import type { ReportStatus, Report } from '@/types';
import { formatDate, displayId } from '@/lib/utils';
import { Plus, ArrowRight, FileText, CheckCircle2, Clock, Activity, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#D92D20',
  HIGH:     '#F04438',
  MEDIUM:   '#F79009',
  LOW:      '#12B76A',
};

const STATUS_PILL_STYLES: Record<string, string> = {
  REPORTED:     'bg-blue-50 text-[#155EEF] border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-[#F79009] border-amber-200',
  VERIFIED:     'bg-purple-50 text-purple-700 border-purple-200',
  ASSIGNED:     'bg-indigo-50 text-indigo-700 border-indigo-200',
  IN_PROGRESS:  'bg-blue-50 text-[#155EEF] border-blue-200',
  RESOLVED:     'bg-emerald-50 text-[#12B76A] border-emerald-200',
  CLOSED:       'bg-slate-100 text-slate-600 border-slate-200',
};

export function CitizenDashboard() {
  const { user } = useAuthStore();
  const { reports, loading: reportsLoading, fetchReports } = useReports({ my: true } as never);
  const { summary, loading: summaryLoading, fetchSummary } = useCitizenDashboard();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchReports({ per_page: 50 });
    fetchSummary();
  }, [fetchReports, fetchSummary]);

  const loading = reportsLoading || summaryLoading;
  const items: Report[] = reports?.items ?? [];

  const filteredItems = items.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const submittedCount = summary?.total_my_reports ?? items.length;
  const reviewCount = summary?.pending ?? items.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'REPORTED').length;
  const progressCount = summary?.in_progress ?? items.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  const resolvedCount = summary?.resolved ?? items.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

  const greetingName = user?.full_name || 'Citizen';

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-[#E4E7EC]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Good morning, <span>{greetingName}</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                Citizen Mode
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is what&apos;s happening in your ward and across your submitted reports.
            </p>
          </div>

          <Link href="/report" className="self-start md:self-auto">
            <button className="px-4 py-2 bg-[#155EEF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/25">
              <Plus className="h-4 w-4" />
              <span>Report a Problem</span>
            </button>
          </Link>
        </div>

        {/* Citizen 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reports Submitted
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {submittedCount}
            </div>
            <div className="text-[10px] text-[#155EEF] mt-0.5 font-medium">
              Recorded in ledger
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </div>
            <div className="text-2xl font-black text-[#F79009] mt-1">
              {reviewCount}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
              Assigned to engineer
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              In Progress
            </div>
            <div className="text-2xl font-black text-[#155EEF] mt-1">
              {progressCount}
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-medium">
              Field crew active
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Resolved
            </div>
            <div className="text-2xl font-black text-[#12B76A] mt-1">
              {resolvedCount}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
              Verified by community
            </div>
          </div>
        </div>

        {/* My Reports Table Card */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)] mt-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4E7EC] gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Filed Reports</h3>
              <p className="text-xs text-slate-500">Live track status and municipal response times for your filed problems.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-[#E4E7EC] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#155EEF] text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Reports</option>
                <option value="REPORTED">Submitted</option>
                <option value="VERIFIED">AI Analyzed</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <LoadingSpinner size="md" label="Loading your filed reports…" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No reports found</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">
                {statusFilter !== 'ALL'
                  ? 'No reports match the selected status filter.'
                  : 'You have not submitted any civic reports yet.'}
              </p>
              <Link href="/report">
                <button className="px-3.5 py-1.5 bg-[#155EEF] text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition">
                  Submit a Report
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Title & ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date Reported</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Priority Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(p => {
                    const color = PRIORITY_COLORS[p.priority_level] || '#155EEF';
                    const pillStyle = STATUS_PILL_STYLES[p.status] || 'bg-slate-100 text-slate-600 border-slate-200';
                    const score = p.priority_score ?? (p.ai_analysis?.priority_score || 50);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <Link href={`/reports/${p.id}`} className="font-bold text-slate-800 line-clamp-1 hover:text-[#155EEF] transition-colors">
                            {p.title}
                          </Link>
                          <div className="text-[10px] text-slate-400 font-mono">{displayId(p.id)}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {p.category?.name || 'Civic'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 truncate max-w-[130px]">
                          {p.location?.locality || p.location?.city || 'Gurugram'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold" style={{ color }}>{score}</span>
                          <span className="text-[10px] text-slate-400"> / 100</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pillStyle}`}>
                            {p.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/reports/${p.id}`}>
                            <button className="text-[#155EEF] font-bold hover:underline inline-flex items-center gap-1">
                              <span>View Details</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
