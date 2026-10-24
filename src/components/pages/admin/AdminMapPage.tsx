'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useReports, useCategories } from '@/hooks/useReports';
import type { PriorityLevel, ReportStatus } from '@/types';

const ProblemsMap = dynamic(() => import('@/components/maps/ProblemsMapInner'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" label="Loading map…" className="h-[600px]" />,
});

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e',
};

export function AdminMapPage() {
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus]     = useState<ReportStatus | 'ALL'>('ALL');

  const { reports, fetchReports }    = useReports();
  const { categories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchCategories();
    fetchReports({ per_page: 100 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReports({
      priority_level: filterPriority !== 'ALL' ? filterPriority : undefined,
      category_id:    filterCategory !== 'ALL' ? filterCategory : undefined,
      status:         filterStatus   !== 'ALL' ? filterStatus   : undefined,
      per_page: 100,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPriority, filterCategory, filterStatus]);

  const displayed = (reports?.items ?? []).filter(r => r.location?.latitude && r.location?.longitude);
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  displayed.forEach(r => { if (r.priority_level in counts) counts[r.priority_level as keyof typeof counts]++; });

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Map View</h1>

        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={filterPriority} onValueChange={v => setFilterPriority(v as PriorityLevel | 'ALL')}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(p => <SelectItem key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v as ReportStatus | 'ALL')}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {['ALL','REPORTED','UNDER_REVIEW','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED'].map(s => (
                <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g,' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-slate-500 self-center">{displayed.length} problems shown</div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {(['CRITICAL','HIGH','MEDIUM','LOW'] as const).map(l => (
            <div key={l} className="flex items-center gap-1.5 text-xs">
              <span className="h-3 w-3 rounded-full inline-block border border-white shadow" style={{ background: PRIORITY_COLORS[l] }} />
              <span className="text-slate-600">{l} ({counts[l]})</span>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ProblemsMap reports={displayed} height="600px" zoom={5} />
          </CardContent>
        </Card>
        <p className="text-xs text-slate-400 mt-2">© OpenStreetMap contributors · Click a marker to view details</p>
      </div>
    </AppShell>
  );
}
