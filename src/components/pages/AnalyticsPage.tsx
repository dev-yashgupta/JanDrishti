'use client';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  CategoryBarChart,
  ReportsTimelineChart,
  PriorityDonutChart,
  CityBarChart
} from '@/components/charts/AnalyticsCharts';
import { useAdminDashboard } from '@/hooks/useReports';
import { BarChart3, TrendingUp, PieChart as PieIcon, MapPin, Activity } from 'lucide-react';

export function AnalyticsPage() {
  const { summary, analytics, loading, fetchAll } = useAdminDashboard();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const a = analytics;
  const s = summary;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold text-[#0E9384] uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Visual Analytics</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Civic Data Analytics & Trend Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quantitative insights into category volumes, priority distribution, resolution speeds, and geographic hotspots.
          </p>
        </div>

        {/* 4 KPI Cards at top */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{s?.total_reports.toLocaleString() ?? '12,480'}</div>
            <div className="text-[10px] text-[#155EEF] font-semibold mt-0.5">Gross Ingested</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{s ? `${s.avg_resolution_days} Days` : '3.4 Days'}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Municipal SLA Average</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved This Month</div>
            <div className="text-2xl font-black text-[#12B76A] mt-1">{s?.resolved_this_month?.toLocaleString() ?? '486'}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Verified Work Orders</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Open</div>
            <div className="text-2xl font-black text-[#D92D20] mt-1">{s?.critical ?? '18'}</div>
            <div className="text-[10px] text-red-600 font-semibold mt-0.5">Score 81 - 100 Priority</div>
          </div>
        </div>

        {loading && !a ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Computing civic telemetry charts…" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Reports by Category */}
            <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reports by Category</h3>
                  <p className="text-[11px] text-slate-500">Distribution of problems across civic sectors</p>
                </div>
                <span className="text-xs font-mono text-[#155EEF] bg-blue-50 px-2.5 py-1 rounded-md font-bold">
                  {a?.by_category.length || 10} Sectors
                </span>
              </div>
              <div className="h-64">
                {a && <CategoryBarChart data={a.by_category} />}
              </div>
            </div>

            {/* Chart 2: Problems by Priority Tier */}
            <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Problems by Priority Tier</h3>
                  <p className="text-[11px] text-slate-500">Calculated priority breakdown (0-100)</p>
                </div>
                <span className="text-xs font-mono text-[#D92D20] bg-red-50 px-2.5 py-1 rounded-md font-bold">
                  Severity Matrix
                </span>
              </div>
              <div className="h-64">
                {a && <PriorityDonutChart data={a.by_priority} />}
              </div>
            </div>

            {/* Chart 3: Ingestion vs Resolution Trends */}
            <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ingestion Trends Over Time</h3>
                  <p className="text-[11px] text-slate-500">Intake volume and reporting throughput</p>
                </div>
                <span className="text-xs font-mono text-[#12B76A] bg-emerald-50 px-2.5 py-1 rounded-md font-bold">
                  Throughput
                </span>
              </div>
              <div className="h-64">
                {a && <ReportsTimelineChart data={a.reports_over_time} />}
              </div>
            </div>

            {/* Chart 4: Top Affected Locations */}
            <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Top Affected Locations</h3>
                  <p className="text-[11px] text-slate-500">Municipalities with highest grievance density</p>
                </div>
                <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md font-bold">
                  Concentration
                </span>
              </div>
              <div className="h-64">
                {a && <CityBarChart data={a.by_city} />}
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
