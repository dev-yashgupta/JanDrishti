'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/shared/StatCard';
import { ReportCard } from '@/components/shared/ReportCard';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useReports, useCitizenDashboard } from '@/hooks/useReports';
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export function CitizenDashboard() {
  const { user } = useAuthStore();
  const { reports, loading: reportsLoading, fetchReports } = useReports({ my: true } as never);
  const { summary, loading: summaryLoading, fetchSummary } = useCitizenDashboard();

  useEffect(() => {
    fetchReports();
    fetchSummary();
  }, []);

  const loading = reportsLoading || summaryLoading;

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.full_name?.split(' ')[0] ?? 'Citizen'}
            </h1>
            <p className="text-slate-500">Here&apos;s an overview of your reported problems.</p>
          </div>
          <Link href="/report">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> Report a Problem
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Reports"  value={summary?.total_my_reports ?? '—'} icon={<FileText className="h-5 w-5 text-blue-600" />} />
          <StatCard title="Pending"        value={summary?.pending ?? '—'}           icon={<Clock className="h-5 w-5 text-slate-400" />}   colorClass="text-slate-700" />
          <StatCard title="In Progress"    value={summary?.in_progress ?? '—'}       icon={<Clock className="h-5 w-5 text-amber-500" />}   colorClass="text-amber-600" />
          <StatCard title="Resolved"       value={summary?.resolved ?? '—'}          icon={<CheckCircle className="h-5 w-5 text-green-500" />} colorClass="text-green-600" />
          <StatCard title="High Priority"  value={summary?.high_priority ?? '—'}     icon={<AlertTriangle className="h-5 w-5 text-orange-500" />} colorClass="text-orange-600" />
        </div>

        {/* Reports list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">My Reports</h2>
            <Link href="/reports" className="text-sm text-blue-700 hover:underline">View all →</Link>
          </div>

          {loading ? (
            <LoadingSpinner size="lg" label="Loading your reports…" className="py-16" />
          ) : !reports?.items.length ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white">
              <p className="text-4xl mb-3">📝</p>
              <h3 className="font-semibold text-slate-700 mb-1">No reports yet</h3>
              <p className="text-sm text-slate-400 mb-4">Help your community by reporting a civic problem.</p>
              <Link href="/report"><Button>Report Your First Problem</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.items.slice(0, 5).map(r => <ReportCard key={r.id} report={r} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
