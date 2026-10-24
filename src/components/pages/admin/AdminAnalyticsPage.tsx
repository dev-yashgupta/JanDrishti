'use client';
import { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CategoryBarChart, ReportsTimelineChart, PriorityDonutChart, StatusPieChart, CityBarChart } from '@/components/charts/AnalyticsCharts';
import { useAdminDashboard } from '@/hooks/useReports';
import { BarChart3, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export function AdminAnalyticsPage() {
  const { summary, analytics, loading, fetchAll } = useAdminDashboard();
  useEffect(() => { fetchAll(); }, []);

  if (loading && !analytics) {
    return <AppShell><LoadingSpinner size="lg" label="Loading analytics…" className="h-[60vh]" /></AppShell>;
  }

  const a = analytics;
  const s = summary;

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-500 text-sm mb-8">Platform-wide insights from live data.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Reports"    value={s?.total_reports.toLocaleString() ?? '—'} icon={<BarChart3 className="h-5 w-5 text-blue-600" />} />
          <StatCard title="Avg Resolution"   value={s ? `${s.avg_resolution_days}d` : '—'}    icon={<Clock className="h-5 w-5 text-slate-400" />}   subtitle="days average" />
          <StatCard title="Resolved (Month)" value={s?.resolved_this_month ?? '—'}             icon={<TrendingUp className="h-5 w-5 text-green-500" />} colorClass="text-green-600" />
          <StatCard title="Critical Open"    value={s?.critical ?? '—'}                         icon={<AlertTriangle className="h-5 w-5 text-red-500" />} colorClass="text-red-600" />
        </div>

        {a && (
          <>
            <Card className="mb-6">
              <CardHeader className="pb-2"><CardTitle className="text-base">Reports Over Time (last 28 days)</CardTitle></CardHeader>
              <CardContent><ReportsTimelineChart data={a.reports_over_time} /></CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Reports by Category</CardTitle></CardHeader>
                <CardContent><CategoryBarChart data={a.by_category} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
                <CardContent><StatusPieChart data={a.by_status} /></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Priority Distribution</CardTitle></CardHeader>
                <CardContent><PriorityDonutChart data={a.by_priority} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Reports by City</CardTitle></CardHeader>
                <CardContent><CityBarChart data={a.by_city} /></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Category Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 pr-4 font-semibold text-slate-500">Category</th>
                        <th className="text-right py-2 pr-4 font-semibold text-slate-500">Reports</th>
                        <th className="text-right py-2 font-semibold text-slate-500">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.by_category.map(c => {
                        const total = a.by_category.reduce((sum, x) => sum + x.count, 0);
                        const pct = total ? Math.round((c.count / total) * 100) : 0;
                        return (
                          <tr key={c.category} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                                {c.category}
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 text-right font-medium">{c.count}</td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 bg-slate-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                                </div>
                                <span className="text-slate-500 w-8 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
