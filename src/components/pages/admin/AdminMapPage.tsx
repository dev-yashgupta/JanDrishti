'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MOCK_REPORTS, MOCK_CATEGORIES } from '@/services/mockData';
import type { PriorityLevel, ReportStatus } from '@/types';

const ProblemsMap = dynamic(() => import('@/components/maps/ProblemsMapInner'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" label="Loading map…" className="h-[600px]" />,
});

export function AdminMapPage() {
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');

  const displayed = MOCK_REPORTS.filter(r => {
    if (filterPriority !== 'ALL' && r.priority_level !== filterPriority) return false;
    if (filterCategory !== 'ALL' && r.category_id !== filterCategory) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return r.location?.latitude && r.location?.longitude;
  });

  const priorityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  displayed.forEach(r => priorityCounts[r.priority_level]++);

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-full">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Map View</h1>
          <DemoLabel />
        </div>

        {/* Filters */}
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
              {MOCK_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
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
          {[
            { level: 'CRITICAL', color: '#dc2626', count: priorityCounts.CRITICAL },
            { level: 'HIGH',     color: '#f97316', count: priorityCounts.HIGH },
            { level: 'MEDIUM',   color: '#eab308', count: priorityCounts.MEDIUM },
            { level: 'LOW',      color: '#22c55e', count: priorityCounts.LOW },
          ].map(l => (
            <div key={l.level} className="flex items-center gap-1.5 text-xs">
              <span className="h-3 w-3 rounded-full inline-block border border-white shadow" style={{ background: l.color }} />
              <span className="text-slate-600">{l.level} ({l.count})</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ProblemsMap reports={displayed} height="600px" zoom={5} />
          </CardContent>
        </Card>

        <p className="text-xs text-slate-400 mt-2">
          © OpenStreetMap contributors · Click a marker to view problem details
        </p>
      </div>
    </AppShell>
  );
}
