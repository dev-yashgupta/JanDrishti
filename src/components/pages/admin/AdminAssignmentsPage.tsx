'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { reportsApi } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { useReports } from '@/hooks/useReports';
import { formatDate, displayId } from '@/lib/utils';
import type { Report } from '@/types';
import { ClipboardList, User, MapPin } from 'lucide-react';

const DEPARTMENTS = [
  'PWD Division 1','PWD Division 2','PWD Division 3',
  'Water Department','Health Department','Electricity Board',
  'Sanitation Department','Urban Development',
];

export function AdminAssignmentsPage() {
  const toast = useToast();
  const { reports: unassignedReports, loading: loadingU, fetchReports: fetchUnassigned } = useReports();
  const { reports: assignedReports,   loading: loadingA, fetchReports: fetchAssigned }   = useReports();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUnassigned({ status: 'VERIFIED',  sort_by: 'priority', per_page: 20 });
    fetchAssigned(  { status: 'ASSIGNED',  sort_by: 'priority', per_page: 20 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAssign(report: Report, dept: string) {
    if (!dept) return;
    setSubmitting(report.id);
    try {
      await reportsApi.changeStatus(report.id, 'ASSIGNED', `Assigned to ${dept}`);
      setDone(prev => new Set(prev).add(report.id));
      toast.success('Assigned', `Problem assigned to ${dept}`);
    } catch {
      toast.error('Assignment failed');
    } finally { setSubmitting(null); }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Assignments</h1>
        <p className="text-slate-500 text-sm mb-6">Assign verified problems to departments or officers.</p>

        {/* Needs assignment */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Needs Assignment ({unassignedReports?.total ?? 0})
          </h2>
          {loadingU ? <LoadingSpinner size="md" label="Loading…" className="py-8" /> : (
            <div className="space-y-3">
              {(unassignedReports?.items ?? []).map(r => (
                <Card key={r.id} className="border-l-4 border-l-orange-400">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs text-slate-400">{displayId(r.id)}</span>
                          <PriorityBadge level={r.priority_level} score={r.priority_score} showScore />
                          <StatusBadge status={r.status} />
                        </div>
                        <Link href={`/admin/problems/${r.id}`}>
                          <h3 className="font-semibold text-slate-900 hover:text-blue-700 line-clamp-1">{r.title}</h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location?.city}</span>
                          <span>{formatDate(r.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {done.has(r.id) ? (
                          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">✓ Assigned</span>
                        ) : (
                          <Select onValueChange={dept => handleAssign(r, dept)}>
                            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Assign to…" /></SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        {submitting === r.id && <span className="text-xs text-slate-400">Saving…</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loadingU && (unassignedReports?.items ?? []).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">No verified problems waiting for assignment.</p>
              )}
            </div>
          )}
        </div>

        {/* Currently assigned */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Currently Assigned ({assignedReports?.total ?? 0})
          </h2>
          {loadingA ? <LoadingSpinner size="md" label="Loading…" className="py-8" /> : (
            <div className="space-y-3">
              {(assignedReports?.items ?? []).map(r => (
                <Card key={r.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs text-slate-400">{displayId(r.id)}</span>
                          <PriorityBadge level={r.priority_level} />
                          <StatusBadge status={r.status} />
                        </div>
                        <Link href={`/admin/problems/${r.id}`}>
                          <h3 className="font-semibold text-slate-900 hover:text-blue-700">{r.title}</h3>
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">{r.location?.city} · {formatDate(r.created_at)}</p>
                      </div>
                      <Link href={`/admin/problems/${r.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">View / Reassign</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
