'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AIAnalysisCard } from '@/components/shared/AIAnalysisCard';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useReport } from '@/hooks/useReports';
import { useToast } from '@/hooks/useToast';
import { reportsApi } from '@/services/api';
import { formatDate, formatDateTime, displayId, STATUS_CONFIG } from '@/lib/utils';
import type { ReportStatus, StatusHistory } from '@/types';
import { MapPin, Clock, ThumbsUp, ArrowLeft, User, CheckCircle, AlertTriangle } from 'lucide-react';

const STATUS_NEXT: Partial<Record<ReportStatus, ReportStatus[]>> = {
  REPORTED:             ['UNDER_REVIEW', 'VERIFIED'],
  UNDER_REVIEW:         ['VERIFIED', 'CLOSED'],
  VERIFIED:             ['ASSIGNED', 'IN_PROGRESS'],
  ASSIGNED:             ['IN_PROGRESS'],
  IN_PROGRESS:          ['RESOLVED'],
  RESOLVED:             ['CITIZEN_VERIFICATION', 'CLOSED'],
  CITIZEN_VERIFICATION: ['CLOSED'],
};

const DEPARTMENTS = [
  'PWD Division 1','PWD Division 2','PWD Division 3',
  'Water Department','Health Department','Electricity Board',
  'Sanitation Department','Urban Development',
];

export function AdminProblemDetailPage({ id }: { id: string }) {
  const { report, loading, fetchReport } = useReport(id);
  const toast = useToast();
  const [currentStatus, setCurrentStatus] = useState<ReportStatus | null>(null);
  const [newStatus, setNewStatus]         = useState<ReportStatus | ''>('');
  const [note, setNote]                   = useState('');
  const [assignee, setAssignee]           = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [history, setHistory]             = useState<StatusHistory[]>([]);

  useEffect(() => { fetchReport(); }, []);
  useEffect(() => { if (report) setCurrentStatus(report.status); }, [report]);

  const loadHistory = useCallback(async () => {
    try { setHistory(await reportsApi.getStatusHistory(id)); } catch { /* ignore */ }
  }, [id]);

  useEffect(() => { if (report) loadHistory(); }, [report, loadHistory]);

  async function handleStatusChange() {
    if (!newStatus) return;
    setSubmittingStatus(true);
    try {
      await reportsApi.changeStatus(id, newStatus, note || undefined);
      setCurrentStatus(newStatus as ReportStatus);
      await loadHistory();
      toast.success('Status updated', `Changed to ${newStatus.replace(/_/g, ' ')}`);
      setNewStatus(''); setNote('');
    } catch (err) {
      toast.error('Failed to update status', err instanceof Error ? err.message : undefined);
    } finally { setSubmittingStatus(false); }
  }

  async function handleAssign() {
    if (!assignee) return;
    try {
      await reportsApi.assign(id, { assigned_to_id: assignee, department: assignee });
      setCurrentStatus('ASSIGNED');
      await loadHistory();
      toast.success('Assigned', `Problem assigned to ${assignee}`);
      setAssignee('');
    } catch (err) {
      toast.error('Assignment failed', err instanceof Error ? err.message : undefined);
    }
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
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <span className="font-mono text-xs text-slate-400">{displayId(report.id)}</span>
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
              <CardHeader className="pb-3"><CardTitle className="text-base text-blue-800">Authority Actions</CardTitle></CardHeader>
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
                      {nextStatuses.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
                      {nextStatuses.length === 0 && <SelectItem value="" disabled>No transitions available</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Add a note (optional) — visible to citizens" rows={3} />
                  <Button onClick={handleStatusChange} disabled={!newStatus || submittingStatus}
                    loading={submittingStatus} size="sm">Update Status</Button>
                </div>

                {/* Assign */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <Label className="font-semibold text-slate-700">Assign To</Label>
                  <div className="flex gap-2">
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select department…" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssign} disabled={!assignee} size="sm" variant="outline">Assign</Button>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" variant="success" className="gap-1.5" onClick={async () => {
                    try {
                      await reportsApi.changeStatus(id, 'VERIFIED', 'Verified by authority.');
                      setCurrentStatus('VERIFIED'); await loadHistory();
                      toast.success('Verified');
                    } catch { toast.error('Failed'); }
                  }}>
                    <CheckCircle className="h-4 w-4" /> Mark Verified
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                    onClick={async () => {
                      try {
                        await reportsApi.changeStatus(id, 'IN_PROGRESS', 'Work in progress.');
                        setCurrentStatus('IN_PROGRESS'); await loadHistory();
                        toast.info('Updated', 'Status set to In Progress.');
                      } catch { toast.error('Failed'); }
                    }}>
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
                            {h.old_status && <span className="text-slate-400 line-through text-xs">{h.old_status.replace(/_/g,' ')}</span>}
                            <span>→</span>
                            <StatusBadge status={h.new_status as ReportStatus} />
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDateTime(h.created_at)}{h.changed_by ? ` · ${h.changed_by.full_name}` : ''}
                          </p>
                          {h.note && <p className="text-xs text-slate-500 italic mt-0.5">&ldquo;{h.note}&rdquo;</p>}
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
            {report.cluster_id && (
              <Card className="border-purple-100 bg-purple-50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Problem Cluster</p>
                  <p className="text-xs text-purple-600 mb-2">Part of a larger grouped issue.</p>
                  <Link href="/admin/clusters">
                    <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-100">View Cluster</Button>
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
