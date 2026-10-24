'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/shared/StatCard';
import { ReportCard } from '@/components/shared/ReportCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CategoryBarChart, ReportsTimelineChart, PriorityDonutChart } from '@/components/charts/AnalyticsCharts';
import { useAdminDashboard, useReports } from '@/hooks/useReports';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, FileText, MapPin, ArrowRight } from 'lucide-react';

export function AdminDashboardPage() {
  const { summary, analytics, loading, fetchAll } = useAdminDashboard();
  const { reports: criticalReports, fetchReports: fetchCritical } = useReports();

  useEffect(() => {
    fetchAll();
    fetchCritical({ priority_level: 'CRITICAL', sort_by: 'priority', per_page: 5 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !summary) {
    return <AppShell><LoadingSpinner size="lg" label="Loading dashboard…" className="h-[60vh]" /></AppShell>;
  }

  const s = summary;

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Authority Dashboard</h1>
            <p className="text-slate-500 text-sm">Real-time civic problem overview.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/map"><Button variant="outline" size="sm" className="gap-1.5"><MapPin className="h-4 w-4" /> Map View</Button></Link>
            <Link href="/admin/analytics"><Button variant="outline" size="sm" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Analytics</Button></Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Problems"    value={s?.total_reports.toLocaleString() ?? '—'}    icon={<FileText className="h-5 w-5 text-blue-600" />} />
          <StatCard title="Unresolved"        value={s?.unresolved.toLocaleString() ?? '—'}       icon={<Clock className="h-5 w-5 text-slate-400" />}   colorClass="text-slate-700" />
          <StatCard title="Critical"          value={s?.critical ?? '—'}                           icon={<AlertTriangle className="h-5 w-5 text-red-500" />}    colorClass="text-red-600" />
          <StatCard title="High Priority"     value={s?.high_priority ?? '—'}                      icon={<AlertTriangle className="h-5 w-5 text-orange-400" />} colorClass="text-orange-600" />
          <StatCard title="In Progress"       value={s?.in_progress ?? '—'}                        icon={<Clock className="h-5 w-5 text-amber-500" />}   colorClass="text-amber-600" />
          <StatCard title="Resolved (Month)"  value={s?.resolved_this_month ?? '—'}                icon={<CheckCircle className="h-5 w-5 text-green-500" />}   colorClass="text-green-600" />
        </div>

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base">Reports Over Time</CardTitle></CardHeader>
              <CardContent><ReportsTimelineChart data={analytics.reports_over_time} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Priority Distribution</CardTitle></CardHeader>
              <CardContent><PriorityDonutChart data={analytics.by_priority} /></CardContent>
            </Card>
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Problems by Category</CardTitle></CardHeader>
              <CardContent><CategoryBarChart data={analytics.by_category} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Key Metrics</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-2">
                {[
                  { label: 'Reports Today',      value: s?.reports_today ?? '—',                          color: 'text-blue-700' },
                  { label: 'Avg Resolution Time', value: s ? `${s.avg_resolution_days} days` : '—',       color: 'text-slate-700' },
                  { label: 'Unresolved Rate',     value: s ? `${Math.round((s.unresolved / s.total_reports) * 100)}%` : '—', color: 'text-orange-600' },
                  { label: 'Critical / Total',    value: s ? `${s.critical} / ${s.total_reports}` : '—', color: 'text-red-600' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{m.label}</span>
                    <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Critical problems */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Critical Problems
            </h2>
            <Link href="/admin/problems?priority=CRITICAL">
              <Button variant="ghost" size="sm" className="gap-1 text-slate-500">View all <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
          {criticalReports?.items.length === 0 ? (
            <p className="text-slate-400 text-sm">No critical problems at this time.</p>
          ) : (
            <div className="space-y-3">
              {criticalReports?.items.map(r => <ReportCard key={r.id} report={r} isAdmin />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
