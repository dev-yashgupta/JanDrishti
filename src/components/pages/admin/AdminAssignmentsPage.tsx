'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { useToast } from '@/hooks/useToast';
import { MOCK_REPORTS } from '@/services/mockData';
import { formatDate, displayId } from '@/lib/utils';
import { ClipboardList, User, MapPin } from 'lucide-react';

const DEPARTMENTS = [
  'PWD Division 1', 'PWD Division 2', 'PWD Division 3',
  'Water Department', 'Health Department', 'Electricity Board',
  'Sanitation Department', 'Urban Development',
];

const UNASSIGNED = MOCK_REPORTS.filter(r =>
  r.status === 'REPORTED' || r.status === 'UNDER_REVIEW' || r.status === 'VERIFIED'
);
const ASSIGNED = MOCK_REPORTS.filter(r =>
  r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
);

export function AdminAssignmentsPage() {
  const toast = useToast();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function handleAssign(reportId: string, dept: string) {
    if (!dept) return;
    setSubmitting(reportId);
    await new Promise(r => setTimeout(r, 500));
    setAssignments(prev => ({ ...prev, [reportId]: dept }));
    toast.success('Assigned', `Problem assigned to ${dept}`);
    setSubmitting(null);
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <DemoLabel />
        </div>
        <p className="text-slate-500 text-sm mb-6">Assign unresolved problems to departments or officers.</p>

        {/* Unassigned */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Needs Assignment ({UNASSIGNED.length})
          </h2>
          <div className="space-y-3">
            {UNASSIGNED.map(r => (
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
                        {r.ai_analysis && <span>Priority: {r.ai_analysis.priority_score}/100</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {assignments[r.id] ? (
                        <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 flex items-center gap-1">
                          <User className="h-3 w-3" /> {assignments[r.id]}
                        </span>
                      ) : (
                        <>
                          <Select onValueChange={dept => handleAssign(r.id, dept)}>
                            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Assign to…" /></SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {submitting === r.id && <span className="text-xs text-slate-400">Saving…</span>}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Currently assigned */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Currently Assigned ({ASSIGNED.length})
          </h2>
          <div className="space-y-3">
            {ASSIGNED.map(r => (
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
                    <Button variant="outline" size="sm" className="text-xs">Reassign</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
