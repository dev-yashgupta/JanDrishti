'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AIAnalysisCard } from '@/components/shared/AIAnalysisCard';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReport } from '@/hooks/useReports';
import { reportsApi } from '@/services/api';
import { formatDate, formatDateTime, displayId, STATUS_WORKFLOW, STATUS_CONFIG } from '@/lib/utils';
import type { StatusHistory, Comment } from '@/types';
import { MapPin, Clock, ThumbsUp, Eye, ArrowLeft, User } from 'lucide-react';

export function ReportDetailPage({ id }: { id: string }) {
  const { report, loading, fetchReport } = useReport(id);
  const [supported, setSupported]         = useState(false);
  const [history, setHistory]             = useState<StatusHistory[]>([]);
  const [comments, setComments]           = useState<Comment[]>([]);

  useEffect(() => { fetchReport(); }, []);

  const loadExtras = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        reportsApi.getStatusHistory(id),
        reportsApi.getComments(id),
      ]);
      setHistory(h);
      setComments(c.filter((cm: Comment) => !cm.is_internal));
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => { if (report) loadExtras(); }, [report, loadExtras]);

  async function handleSupport() {
    try {
      await reportsApi.support(id);
      setSupported(v => !v);
    } catch { /* ignore */ }
  }

  if (loading) return <AppShell><LoadingSpinner size="lg" label="Loading report…" className="py-32" /></AppShell>;

  if (!report) return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Report not found</h1>
        <p className="text-slate-500 mb-6">This report may not exist or has been removed.</p>
        <Link href="/explore"><Button variant="outline">Browse All Issues</Button></Link>
      </div>
    </AppShell>
  );

  const currentStep = STATUS_CONFIG[report.status].step;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-400">{displayId(report.id)}</span>
                    {report.category && <CategoryBadge category={report.category} />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge level={report.priority_level} score={report.priority_score} showScore />
                    <StatusBadge status={report.status} />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-3">{report.title}</h1>
                <p className="text-slate-600 leading-relaxed mb-5">{report.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  {report.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs">Location</p>
                        <p className="font-medium text-slate-700">{report.location.city}, {report.location.state}</p>
                        {report.location.address && <p className="text-xs text-slate-400">{report.location.address}</p>}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs">Reported</p>
                      <p className="font-medium text-slate-700">{formatDate(report.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{report.support_count + (supported ? 1 : 0)} supporters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{report.view_count} views</span>
                  </div>
                </div>

                <Button variant={supported ? 'secondary' : 'outline'} size="sm" className="mt-4 gap-2" onClick={handleSupport}>
                  <ThumbsUp className="h-4 w-4" />
                  {supported ? 'Supported' : 'Support this issue'}
                </Button>
              </CardContent>
            </Card>

            {/* Status timeline */}
            <Card>
              <CardHeader><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
              <CardContent className="pb-6">
                <div className="relative">
                  {STATUS_WORKFLOW.map((s, i) => {
                    const done   = i + 1 < currentStep;
                    const active = i + 1 === currentStep;
                    const cfg    = STATUS_CONFIG[s];
                    const entry  = history.find(h => h.new_status === s);
                    return (
                      <div key={s} className="flex gap-3 mb-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {done ? '✓' : i + 1}
                          </div>
                          {i < STATUS_WORKFLOW.length - 1 && <div className={`w-0.5 h-6 mt-1 ${done ? 'bg-green-300' : 'bg-slate-100'}`} />}
                        </div>
                        <div className="pt-0.5 pb-2">
                          <p className={`text-sm font-semibold ${active ? 'text-blue-700' : done ? 'text-green-700' : 'text-slate-400'}`}>{cfg.label}</p>
                          {entry && (
                            <>
                              <p className="text-xs text-slate-400">{formatDateTime(entry.created_at)}{entry.changed_by ? ` · ${entry.changed_by.full_name}` : ''}</p>
                              {entry.note && <p className="text-xs text-slate-500 mt-0.5 italic">&ldquo;{entry.note}&rdquo;</p>}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Authority comments */}
            {comments.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Authority Updates</CardTitle></CardHeader>
                <CardContent className="space-y-4 pb-6">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{c.author?.full_name}</span>
                          <span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 border border-blue-100">{c.author?.role}</span>
                          <span className="text-xs text-slate-400 ml-auto">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {report.ai_analysis && <AIAnalysisCard analysis={report.ai_analysis} />}

            {!report.is_anonymous && report.reporter && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Reported By</CardTitle></CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                      {report.reporter.full_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{report.reporter.full_name}</p>
                      <p className="text-xs text-slate-400">{report.reporter.city}, {report.reporter.state}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {report.cluster_id && (
              <Card className="border-orange-100 bg-orange-50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-orange-700 mb-1">Part of a Problem Cluster</p>
                  <p className="text-xs text-orange-600">Grouped with similar nearby reports.</p>
                  <Link href="/explore">
                    <Button variant="outline" size="sm" className="mt-2 text-orange-700 border-orange-200 hover:bg-orange-100">View Cluster</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
