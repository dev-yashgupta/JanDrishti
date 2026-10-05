'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { MOCK_CLUSTERS, MOCK_REPORTS } from '@/services/mockData';
import { formatDate, timeAgo } from '@/lib/utils';
import { GitBranch, MapPin, ThumbsUp, FileText, ChevronDown, ChevronUp, Brain } from 'lucide-react';

function ClusterCard({ cluster }: { cluster: typeof MOCK_CLUSTERS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const clusterReports = MOCK_REPORTS.filter(r => r.cluster_id === cluster.id);

  return (
    <Card className="border-l-4 border-l-purple-400">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <GitBranch className="h-4 w-4 text-purple-500 shrink-0" />
            {cluster.category && <CategoryBadge category={cluster.category} />}
            <DemoLabel />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge level={cluster.priority_level} score={cluster.priority_score} showScore />
            <StatusBadge status={cluster.status} />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">{cluster.title}</h2>

        {/* AI summary */}
        {cluster.summary && (
          <div className="flex gap-2 rounded-md bg-blue-50 border border-blue-100 p-3 mb-4 text-sm text-blue-800">
            <Brain className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <p>{cluster.summary}</p>
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
          {cluster.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {cluster.location.city}, {cluster.location.state}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {cluster.report_count} reports
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5" />
            {cluster.total_support} supporters
          </span>
          <span>Updated {timeAgo(cluster.updated_at)}</span>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide' : 'View'} individual reports ({clusterReports.length})
        </button>

        {/* Expanded report list */}
        {expanded && clusterReports.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {clusterReports.map(r => (
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
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Problem Clusters</h1>
          <DemoLabel />
        </div>
        <p className="text-slate-500 text-sm mb-6">
          Groups of similar reports in the same area — detected by AI similarity analysis.
        </p>

        <div className="rounded-md bg-purple-50 border border-purple-100 p-3 text-sm text-purple-800 mb-6">
          <Brain className="inline h-4 w-4 mr-1.5 text-purple-500" />
          Clusters are formed when reports have text similarity &gt; 75% and are within 2 km of each other.
        </div>

        <div className="space-y-5">
          {MOCK_CLUSTERS.map(c => <ClusterCard key={c.id} cluster={c} />)}
        </div>
      </div>
    </AppShell>
  );
}
