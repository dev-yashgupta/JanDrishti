'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ReportCard } from '@/components/shared/ReportCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useReports } from '@/hooks/useReports';
import { PlusCircle } from 'lucide-react';

export function ReportsListPage() {
  const { reports, loading, fetchReports } = useReports({ my: true } as never);
  useEffect(() => { fetchReports(); }, []);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
          <Link href="/report"><Button className="gap-2"><PlusCircle className="h-4 w-4" /> New Report</Button></Link>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading reports…" className="py-20" />
        ) : !reports?.items.length ? (
          <EmptyState icon="📝" title="No reports yet"
            description="Report a civic problem in your community to get started."
            action={{ label: 'Report a Problem', onClick: () => window.location.href = '/report' }} />
        ) : (
          <div className="space-y-3">
            {reports.items.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
