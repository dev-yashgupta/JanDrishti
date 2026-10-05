'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AIAnalysisCard } from '@/components/shared/AIAnalysisCard';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useReport } from '@/hooks/useReports';
import { useToast } from '@/hooks/useToast';
import { MOCK_STATUS_HISTORY, MOCK_AUTHORITY } from '@/services/mockData';
import { formatDate, formatDateTime, displayId, STATUS_CONFIG, STATUS_WORKFLOW } from '@/lib/utils';
import type { ReportStatus } from '@/types';
import { MapPin, Clock, ThumbsUp, ArrowLeft, User, CheckCircle, AlertTriangle } from 'lucide-react';

const STATUS_NEXT: Partial<Record<ReportStatus, ReportStatus[]>> = {
  REPORTED: ['UNDER_REVIEW', 'VERIFIED'],
  UNDER_REVIEW: ['VERIFIED', 'CLOSED'],
  VERIFIED: ['ASSIGNED', 'IN_PROGRESS'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CITIZEN_VERIFICATION', 'CLOSED'],
  CITIZEN_VERIFICATION: ['CLOSED'],
};

export function AdminProblemDetailPage({ id }: { id: string }) {
  const { report, loading, fetchReport } = useReport(id);
  const toast = useToast();
  const [currentStatus, setCurrentStatus] = useState<ReportStatus | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus | ''>('');
  const [note, setNote] = useState('');
  const [assignee, setAssignee] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => { if (report) setCurrentStatus(report.status); }, [report]);

  const history = [...MOCK_STATUS_HISTORY.filter(h => h.report_id === id)];

  async function handleStatusChange() {
    if (!newStatus) return;
    setSubmittingStatus(true);
    await new Promise(r => setTimeout(r, 600)); // simulate API
    setCurrentStatus(newStatus as ReportStatus);
    toast.success('Status updated', `Changed to ${newStatus.replace(/_/g, ' ')}`);
    setNewStatus(''); setNote('');
    setSubmittingStatus(false);
  }

  async function handleAssign() {
    if (!assignee) return;
    toast.success('Assigned', `Problem assigned to ${assignee}`);
    setAssignee('');
  }

  if (loading) return <AppShell><LoadingSpinner size="lg" label="Loading…" className="py-32" /></AppShell>;
  if (!report) return <AppShell><div className="p-8 text-center text-slate-500">Problem not found.</div></AppShell>;

  const nextStatuses = (currentStatus ? STATUS_NEXT[currentStatus] : undefined) ?? [];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/admin/problems" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Problems
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <span className="font-mono text-xs text-slate-400">{displayId(report.id)}</span>
                  <DemoLabel />
                  {report.category && <CategoryBadge category={report.category} />}
                  <div className="ml-auto flex gap-2">
                    <PriorityBadge level={report.priority_level} score={report.priority_score} showScore />
                    <StatusBadge status={currentStatus ?? report.status} />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-3">{report.title}</h1>
                <p className="text-slate-600 leading-relaxed mb-5">{report.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  {report.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="font-medium text-slate-700">{report.location.city}, {report.location.state}</p>
                        {report.location.address && <p className="text-xs text-slate-400">{report.location.address}</p>}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Submitted</p>
                      <p className="font-medium text-slate-700">{formatDateTime(report.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{report.support_count} supporters</span>
                  </div>
                  {report.reporter && !report.is_anonymous && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{report.reporter.full_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Authority actions */}
            <Card className="border-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-800">Authority Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Status change */}
                <div className="space-y-3">
                  <Label className="font-semibold text-slate-700">Change Status</Label>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    Current: <StatusBadge status={currentStatus ?? report.status} />
                  </div>
                  <Select value={newStatus} onValueChange={v => setNewStatus(v as ReportStatus)}>
                    <SelectTrigger><SelectValue placeholder="Select new status…" /></SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map(s => (
                        <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                      ))}
                      {nextStatuses.length === 0 && (
                        <SelectItem value="" disabled>No transitions available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a note (optional) — visible to citizens"
                    rows={3}
                  />
                  <Button onClick={handleStatusChange} disabled={!newStatus || submittingStatus} loading={submittingStatus} size="sm">
                    Update Status
                  </Button>
                </div>

                {/* Quick assign */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <Label className="font-semibold text-slate-700">Assign To</Label>
                  <div className="flex gap-2">
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select department / officer…" /></SelectTrigger>
                      <SelectContent>
                        {['PWD Division 1','PWD Division 2','Water Department','Health Department','Electricity Board','Sanitation Department'].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssign} disabled={!assignee} size="sm" variant="outline">Assign</Button>
                  </div>
                </div>

                {/* Verify / Resolve quick buttons */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" variant="success" className="gap-1.5"
                    onClick={() => { setCurrentStatus('VERIFIED'); toast.success('Verified', 'Problem marked as verified.'); }}>
                    <CheckCircle className="h-4 w-4" /> Mark Verified
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                    onClick={() => { setCurrentStatus('IN_PROGRESS'); toast.info('Updated', 'Status set to In Progress.'); }}>
                    <AlertTriangle className="h-4 w-4" /> Set In Progress
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status history */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Status History</CardTitle></CardHeader>
              <CardContent className="pb-6">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400">No history yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map(h => (
                      <div key={h.id} className="flex gap-3 items-start">
                        <div className="h-2 w-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap text-sm">
                            <span className="text-slate-400 line-through text-xs">{h.old_status?.replace(/_/g,' ')}</span>
                            <span>→</span>
                            <StatusBadge status={h.new_status} />
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(h.created_at)} · {h.changed_by?.full_name}</p>
                          {h.note && <p className="text-xs text-slate-500 italic mt-0.5">"{h.note}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {report.ai_analysis && <AIAnalysisCard analysis={report.ai_analysis} />}

            {/* Cluster link */}
            {report.cluster_id && (
              <Card className="border-purple-100 bg-purple-50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Problem Cluster</p>
                  <p className="text-xs text-purple-600 mb-2">Part of a larger grouped issue.</p>
                  <Link href={`/admin/clusters`}>
                    <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-100">View Cluster</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Similar reports */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Similar Reports</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-500 pb-4 space-y-2">
                {[1,2].map(i => (
                  <div key={i} className="p-2 rounded bg-slate-50 border border-slate-100">
                    <p className="font-medium text-slate-700 text-xs line-clamp-2">Similar civic issue reported nearby</p>
                    <p className="text-xs text-slate-400 mt-0.5">Similarity: {90 - i * 7}% · {i} km away</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
