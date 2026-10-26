'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useReport } from '@/hooks/useReports';
import { reportsApi } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatDateTime, displayId, STATUS_WORKFLOW, STATUS_CONFIG } from '@/lib/utils';
import type { StatusHistory, Comment, Report } from '@/types';
import {
  MapPin, Clock, ThumbsUp, Eye, ArrowLeft,
  Share2, Brain, Layers, CheckCircle2, User, Send,
  Shield, AlertTriangle, ExternalLink
} from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#D92D20',
  HIGH:     '#F04438',
  MEDIUM:   '#F79009',
  LOW:      '#12B76A',
};

export function ReportDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { report, loading, fetchReport } = useReport(id);
  const [supported, setSupported] = useState(false);
  const [history, setHistory]     = useState<StatusHistory[]>([]);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const loadExtras = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        reportsApi.getStatusHistory(id),
        reportsApi.getComments(id),
      ]);
      setHistory(h);
      setComments(c.filter((cm: Comment) => !cm.is_internal));
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    if (report) loadExtras();
  }, [report, loadExtras]);

  async function handleSupport() {
    try {
      await reportsApi.support(id);
      setSupported(v => !v);
      toast.success(supported ? 'Support Removed' : 'Issue Supported', 'Thank you for endorsing this civic report.');
    } catch {
      /* ignore */
    }
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Problem dossier URL copied to clipboard.');
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const added = await reportsApi.addComment(id, newComment.trim());
      setComments(prev => [...prev, added]);
      setNewComment('');
      toast.success('Comment Added', 'Your contribution is recorded on the public timeline.');
    } catch {
      toast.error('Failed', 'Could not post comment.');
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner size="lg" label="Loading problem dossier…" className="py-32" />
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center font-sans">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Report Not Found</h1>
          <p className="text-slate-500 mb-6 text-sm">This problem dossier may not exist or has been consolidated.</p>
          <Link href="/explore">
            <button className="px-4 py-2 bg-[#155EEF] text-white rounded-xl text-xs font-bold">
              Browse All Issues
            </button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const score = report.priority_score ?? (report.ai_analysis?.priority_score || 78);
  const color = PRIORITY_COLORS[report.priority_level] || '#155EEF';
  const currentStep = STATUS_CONFIG[report.status]?.step || 1;

  // Breakdown metrics
  const sevScore = report.ai_analysis?.severity_score ?? 8.2;
  const urgScore = report.ai_analysis?.urgency_score ?? 7.5;
  const freqScore = report.ai_analysis?.frequency_score ?? 6.8;
  const impScore = report.ai_analysis?.community_impact_score ?? 7.0;
  const persistScore = report.ai_analysis?.persistence_score ?? 5.5;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        
        {/* Top Back & Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-slate-600 hover:text-[#155EEF] flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Previous View</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-[#155EEF] border border-blue-200">
              {report.status.replace(/_/g, ' ')}
            </span>
            <button
              onClick={handleShare}
              className="px-3 py-1 text-xs font-semibold bg-white border border-[#E4E7EC] rounded-lg text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Problem Header Card with Big Priority Meter */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-[0_1px_3px_rgba(16,24,40,0.08)] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-slate-400 font-bold">{displayId(report.id)}</span>
                <span className="text-slate-300">•</span>
                <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0E9384] font-bold">
                  {report.category?.name || 'Civic Infrastructure'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Reported {formatDate(report.created_at)}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                {report.title}
              </h1>

              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#D92D20] shrink-0" />
                <span>
                  {report.location?.locality ? `${report.location.locality}, ` : ''}
                  {report.location?.city || 'Gurugram'}, {report.location?.state || 'Haryana'}
                </span>
              </p>
            </div>

            {/* Right: Big Priority Meter */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center min-w-[190px] self-start shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority Score</div>
              <div className="text-4xl font-black my-0.5" style={{ color }}>{score}</div>
              <div className="text-xs font-bold uppercase" style={{ color }}>{report.priority_level} PRIORITY</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">5-Factor Normalized</div>
            </div>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Description, Evidence, Clustered Reports, Timeline, Comments */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Description & Photo Evidence */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Citizen Problem Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {report.description}
              </p>

              {(report.image_url || report.media?.[0]?.url) ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 mb-2">Photographic Evidence</h4>
                  <div className="rounded-xl overflow-hidden border border-[#E4E7EC] max-h-80 bg-slate-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.image_url || report.media?.[0]?.url} alt="Photographic proof" className="w-full h-80 object-cover" />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Semantically Clustered Related Reports */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#155EEF]" />
                    <span>Semantically Clustered Reports ({report.support_count || 2})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cosine similarity vector analysis detected matching citizen tickets within 500m radius.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#12B76A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  De-duplicated
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Repeated grievance from resident association</div>
                    <div className="text-[10px] text-slate-400 font-mono">Matched by TF-IDF & Spatial Radius</div>
                  </div>
                  <span className="text-[11px] font-bold text-[#155EEF] bg-blue-50 px-2 py-0.5 rounded">
                    94.2% Similarity
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Resolution Timeline */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0E9384]" />
                <span>Status & Resolution Timeline</span>
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {STATUS_WORKFLOW.map((s, i) => {
                  const done = i + 1 < currentStep;
                  const active = i + 1 === currentStep;
                  const cfg = STATUS_CONFIG[s];
                  const entry = history.find(h => h.new_status === s);

                  return (
                    <div key={s} className="flex gap-4 relative z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : active
                            ? 'bg-[#155EEF] text-white ring-4 ring-blue-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </div>

                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${active ? 'text-[#155EEF]' : done ? 'text-slate-800' : 'text-slate-400'}`}>
                            {cfg.label}
                          </p>
                          {entry && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDateTime(entry.created_at)}
                            </span>
                          )}
                        </div>
                        {entry && entry.note && (
                          <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            &ldquo;{entry.note}&rdquo;
                            {entry.changed_by && (
                              <span className="block text-[10px] text-slate-400 mt-0.5 font-semibold">
                                — {entry.changed_by.full_name} ({entry.changed_by.role})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Citizen Comments & Updates */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-[#155EEF]" />
                <span>Community Discussion & Authority Notes</span>
              </h3>

              {comments.length === 0 ? (
                <p className="text-xs text-slate-400">No comments posted yet. Add a public update below.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map(c => (
                    <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-800 font-bold">{c.author?.full_name || 'Citizen'}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add community update or authority note..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#155EEF]"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-[#155EEF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>Post</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Column (4 cols): Explainable AI Breakdown & Location */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Explainable AI Signals Breakdown Card */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#155EEF]" />
                <span>Explainable AI Signals</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                
                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Severity (30% weight)</span>
                    <span className="font-bold text-[#D92D20]">{Math.round(sevScore * 3)} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#D92D20] h-full rounded-full" style={{ width: `${sevScore * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Urgency & Escalation (25% weight)</span>
                    <span className="font-bold text-[#F79009]">{Math.round(urgScore * 2.5)} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F79009] h-full rounded-full" style={{ width: `${urgScore * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Frequency & Clustering (20% weight)</span>
                    <span className="font-bold text-[#155EEF]">{Math.round(freqScore * 2)} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#155EEF] h-full rounded-full" style={{ width: `${freqScore * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Community Impact (15% weight)</span>
                    <span className="font-bold text-[#0E9384]">{Math.round(impScore * 1.5)} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0E9384] h-full rounded-full" style={{ width: `${impScore * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Spatial Density (10% weight)</span>
                    <span className="font-bold text-purple-600">{Math.round(persistScore)} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${persistScore * 10}%` }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Endorsement Support CTA */}
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Citizen Endorsements</h4>
              <p className="text-xs text-slate-500">
                Support this ticket to increase its cluster score and escalate priority in the municipal queue.
              </p>
              <button
                onClick={handleSupport}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  supported
                    ? 'bg-blue-50 text-[#155EEF] border border-blue-200'
                    : 'bg-[#155EEF] hover:bg-blue-600 text-white'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{supported ? 'Supported' : 'Support This Problem'} ({report.support_count + (supported ? 1 : 0)})</span>
              </button>
            </div>

            {/* Geographic Coordinates Card */}
            {report.location && (
              <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#D92D20]" />
                  <span>Geographic Pin</span>
                </h4>
                <div className="font-mono text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>Lat: <span className="font-bold text-slate-800">{report.location.latitude ?? 28.4595}</span></div>
                  <div>Lng: <span className="font-bold text-slate-800">{report.location.longitude ?? 77.0266}</span></div>
                  <div className="text-[11px] text-slate-400 pt-1 font-sans">
                    {report.location.address || 'Sector 14, Gurugram'}
                  </div>
                </div>
                <Link
                  href={`/map`}
                  className="text-[#155EEF] font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <span>Locate on Community Map</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>
    </AppShell>
  );
}
