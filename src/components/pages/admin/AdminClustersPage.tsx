'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useClusters } from '@/hooks/useReports';
import { clustersApi } from '@/services/api';
import { formatDate, timeAgo } from '@/lib/utils';
import type { ProblemCluster, Report } from '@/types';
import { GitBranch, MapPin, ThumbsUp, FileText, ChevronDown, ChevronUp, Brain } from 'lucide-react';

function ClusterCard({ cluster }: { cluster: ProblemCluster }) {
  const [expanded, setExpanded]   = useState(false);
  const [reports, setReports]     = useState<Report[]>([]);
  const [loadingRep, setLoadingRep] = useState(false);

  async function toggleExpand() {
    if (!expanded && reports.length === 0) {
      setLoadingRep(true);
      try {
        const data = await clustersApi.get(cluster.id);
        if ('reports' in data) setReports((data as { reports: Report[] }).reports);
      } finally { setLoadingRep(false); }
    }
    setExpanded(v => !v);
  }

  return (
    <Card className="border-l-4 border-l-purple-400">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <GitBranch className="h-4 w-4 text-purple-500 shrink-0" />
            {cluster.category && <CategoryBadge category={cluster.category} />}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge level={cluster.priority_level} score={cluster.priority_score} showScore />
            <StatusBadge status={cluster.status} />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">{cluster.title}</h2>

        {cluster.summary && (
          <div className="flex gap-2 rounded-md bg-blue-50 border border-blue-100 p-3 mb-4 text-sm text-blue-800">
            <Brain className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <p>{cluster.summary}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
          {cluster.location && (
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{cluster.location.city}, {cluster.location.state}</span>
          )}
          <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{cluster.report_count} reports</span>
          <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5" />{cluster.total_support} supporters</span>
          <span>Updated {timeAgo(cluster.updated_at)}</span>
        </div>

        <button onClick={toggleExpand} className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide' : 'View'} individual reports
        </button>

        {expanded && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {loadingRep ? <LoadingSpinner size="sm" label="Loading…" /> : reports.map(r => (
              <Link key={r.id} href={`/admin/problems/${r.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm">
                  <div>
                    <p className="font-medium text-slate-800 line-clamp-1">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.location?.city} · {formatDate(r.created_at)} · {r.support_count} supporters</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminClustersPage() {
  const { clusters, loading, fetchClusters } = useClusters();
  useEffect(() => { fetchClusters(); }, []);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Problem Clusters</h1>
        <p className="text-slate-500 text-sm mb-4">Groups of similar reports in the same area — detected by AI similarity analysis.</p>
        <div className="rounded-md bg-purple-50 border border-purple-100 p-3 text-sm text-purple-800 mb-6">
          <Brain className="inline h-4 w-4 mr-1.5 text-purple-500" />
          Clusters form when reports share text similarity &gt;55% and are within 2 km.
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading clusters…" className="py-20" />
        ) : !clusters?.items.length ? (
          <div className="text-center py-16 text-slate-400">
            <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No clusters yet. They form automatically as similar reports come in.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {clusters.items.map(c => <ClusterCard key={c.id} cluster={c} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
