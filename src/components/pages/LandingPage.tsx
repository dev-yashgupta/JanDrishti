'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { reportsApi, dashboardApi, categoriesApi } from '@/services/api';
import type { Report, Category, DashboardSummary } from '@/types';
import {
  Megaphone, Brain, Network, TrendingUp,
  MapPin, Droplets, Zap, Trash2, HeartPulse,
  GraduationCap, Bus, ShieldCheck, Accessibility, Leaf,
  ArrowRight, Sliders, Cpu
} from 'lucide-react';

const STEPS = [
  {
    stage: '01', icon: <Megaphone className="h-5 w-5" />, iconBg: 'bg-blue-50 text-[#155EEF]',
    title: 'Report', titleKey: 'step1_title',
    desc: 'Citizens report problems through text, images, and geographic coordinates.',
  },
  {
    stage: '02', icon: <Brain className="h-5 w-5" />, iconBg: 'bg-teal-50 text-[#0E9384]',
    title: 'AI Understands', titleKey: 'step2_title',
    desc: 'NLP classification identifies category, extracts context, and estimates inherent severity.',
  },
  {
    stage: '03', icon: <Network className="h-5 w-5" />, iconBg: 'bg-amber-50 text-[#F79009]',
    title: 'Problems Are Connected', titleKey: 'step3_title',
    desc: 'Similar reports and geographic concentrations are detected via semantic cosine similarity.',
  },
  {
    stage: '04', icon: <TrendingUp className="h-5 w-5" />, iconBg: 'bg-red-50 text-[#D92D20]',
    title: 'Issues Are Prioritized', titleKey: 'step4_title',
    desc: 'JanDrishti generates explainable priority scores to spotlight problems needing urgent intervention.',
  },
];

const CATEGORIES = [
  { icon: <MapPin className="h-5 w-5" />, label: 'Roads & Infrastructure', color: 'text-[#155EEF] bg-blue-50', slug: 'Roads & Infrastructure' },
  { icon: <Droplets className="h-5 w-5" />, label: 'Water Supply', color: 'text-[#0E9384] bg-teal-50', slug: 'Water Supply' },
  { icon: <Trash2 className="h-5 w-5" />, label: 'Sanitation', color: 'text-[#F79009] bg-amber-50', slug: 'Sanitation' },
  { icon: <Zap className="h-5 w-5" />, label: 'Electricity', color: 'text-yellow-600 bg-yellow-50', slug: 'Electricity' },
  { icon: <HeartPulse className="h-5 w-5" />, label: 'Healthcare', color: 'text-red-600 bg-red-50', slug: 'Healthcare' },
  { icon: <GraduationCap className="h-5 w-5" />, label: 'Education', color: 'text-purple-600 bg-purple-50', slug: 'Education' },
  { icon: <Bus className="h-5 w-5" />, label: 'Transportation', color: 'text-indigo-600 bg-indigo-50', slug: 'Transportation' },
  { icon: <ShieldCheck className="h-5 w-5" />, label: 'Public Safety', color: 'text-orange-600 bg-orange-50', slug: 'Public Safety' },
  { icon: <Accessibility className="h-5 w-5" />, label: 'Accessibility', color: 'text-pink-600 bg-pink-50', slug: 'Accessibility' },
  { icon: <Leaf className="h-5 w-5" />, label: 'Environment', color: 'text-[#12B76A] bg-emerald-50', slug: 'Environment' },
];

export function LandingPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [critical, setCritical] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, reports] = await Promise.all([
          categoriesApi.list().catch(() => [] as Category[]),
          reportsApi.list({ priority_level: 'CRITICAL', sort_by: 'priority', per_page: 3 }).catch(() => null),
        ]);
        setCategories(cats);
        setCritical(reports?.items ?? []);
        dashboardApi.summary().then(setSummary).catch(() => {});
      } finally {
        setStatsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="jd-gradient-hero jd-dot-grid text-white pt-16 pb-24 relative">
        {/* Glow blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0E9384]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-[#155EEF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-teal-300">
                <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-ping" />
                <span>AI-Powered Civic Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Turning Community Problems into{' '}
                <span className="jd-text-gradient">Actionable Intelligence</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
                JanDrishti AI uses artificial intelligence and community-generated data to discover, understand,
                and prioritize the problems that matter most. We transmute scattered grievances into structured,
                actionable municipal intelligence.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/report">
                  <button className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-[#155EEF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition flex items-center space-x-2">
                    <Megaphone className="h-4 w-4" />
                    <span>Report a Problem</span>
                  </button>
                </Link>
                <Link href="/explore">
                  <button className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-teal-300" />
                    <span>Explore Live Map</span>
                  </button>
                </Link>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-wrap gap-6 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-3.5 w-3.5 text-[#0E9384]" />
                  <span>NLP Preprocessing: <strong>TF-IDF &amp; Embeddings</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#F79009]" />
                  <span>Priority Scoring: <strong>5-Factor Dynamic Matrix</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3.5 w-3.5 text-[#12B76A]" />
                  <span>Live GIS: <strong>OpenStreetMap &amp; GPS</strong></span>
                </div>
              </div>
            </div>

            {/* Right: AI telemetry card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white text-[#101828] rounded-2xl p-6 shadow-2xl border border-white/40">
                <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-[#071A2F] to-[#155EEF] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
                  <span className="text-teal-300">✦</span> Active Ingestion
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#155EEF]">AI Incident Stream #JD-1001</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Contaminated Water Line</h3>
                    <p className="text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-[#D92D20] inline mr-1" />
                      Sector 14, Ward 7, Gurugram
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-100 text-[#D92D20] border border-red-200">CRITICAL</span>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Predicted Category: <b className="text-[#155EEF]">Water Supply</b></span>
                      <span className="font-mono text-slate-500 font-semibold">94% Confidence</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#155EEF] h-full rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Semantic Duplicate Cluster</span>
                      <span className="text-[#F79009] font-bold">27 Similar Reports</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#F79009] h-full rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Priority Score</div>
                      <div className="text-2xl font-black text-[#D92D20]">87 <span className="text-xs font-normal text-slate-500">/ 100</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Community Impact</div>
                      <div className="text-xs font-bold text-slate-800">Locality-Wide (~1,400 affected)</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>🕐 Ingested 14 mins ago</span>
                  <Link href="/explore">
                    <button className="text-[#155EEF] font-bold hover:underline">Examine AI Breakdown →</button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── IMPACT STATS BAR ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[#E4E7EC]">
          {[
            {
              value: summary ? summary.total_reports.toLocaleString() : '12,480',
              color: 'text-[#071A2F]', label: 'Community Reports', sub: '+14% this month', subColor: 'text-[#12B76A]'
            },
            {
              value: summary ? summary.unresolved.toLocaleString() : '2,340',
              color: 'text-[#155EEF]', label: 'Problems Identified', sub: '81.2% Deduplication', subColor: 'text-slate-500'
            },
            {
              value: summary ? summary.critical.toString() : '186',
              color: 'text-[#D92D20]', label: 'High Priority Issues', sub: 'Fast-track municipal queue', subColor: 'text-red-500'
            },
            {
              value: summary ? `${summary.avg_resolution_days}d` : '68%',
              color: 'text-[#12B76A]', label: 'Issues Resolved / Updated', sub: 'Avg 3.4 days turnaround', subColor: 'text-[#12B76A]'
            },
          ].map((s, i) => (
            <div key={i} className={`p-5 text-center sm:text-left ${i < 3 ? 'border-r border-slate-100' : ''}`}>
              <div className={`text-2xl sm:text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-[#667085] mt-1 uppercase tracking-wider">{s.label}</div>
              <div className={`text-[11px] mt-0.5 font-medium ${s.subColor}`}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#155EEF]">Intelligent Civic Pipeline</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How JanDrishti Works</h2>
          <p className="text-slate-600 text-sm mt-3">Closing the loop from unstructured citizen complaints to prioritized, data-driven municipal resolution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map(s => (
            <div key={s.stage} className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition">
              <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                {s.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">STAGE {s.stage}</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{s.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM CATEGORIES ────────────────────────────── */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0E9384]">Taxonomy</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Problem Categories</h2>
            </div>
            <p className="text-xs text-slate-500 mt-2 md:mt-0">Click any category to filter and explore active incidents.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(categories.length > 0
              ? categories.map(cat => ({
                  icon: <span className="text-2xl">{cat.icon}</span>,
                  label: cat.name,
                  color: 'text-[#155EEF] bg-blue-50',
                  slug: cat.name,
                }))
              : CATEGORIES
            ).map(cat => (
              <Link key={cat.label} href={`/explore?category=${encodeURIComponent(cat.slug || cat.label)}`}>
                <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[#155EEF]/30 transition cursor-pointer group text-center">
                  <div className={`w-11 h-11 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{cat.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRITICAL PROBLEMS RIGHT NOW ───────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D92D20]">Live Intelligence Feed</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Critical Problems Right Now</h2>
          </div>
          <Link href="/explore">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#E4E7EC] bg-white rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
              Explore All Issues <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {statsLoading ? (
          <LoadingSpinner size="md" label="Loading…" className="py-8" />
        ) : critical.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E4E7EC]">
            <p className="text-slate-500 text-sm">No critical problems at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {critical.map((r, i) => (
              <Link href={`/reports/${r.id}`} key={r.id}>
                <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition cursor-pointer priority-critical">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-black text-red-200 shrink-0 select-none">#{i + 1}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{r.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location?.city}, {r.location?.state}</span>
                          <span>{r.support_count} supporters</span>
                          {r.priority_score && <span>Score: {r.priority_score}/100</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <PriorityBadge level={r.priority_level} score={r.priority_score} showScore />
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── PRIORITY FORMULA ──────────────────────────────── */}
      <section className="bg-[#071A2F] py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0E9384]">Transparent AI Scoring</span>
              <h2 className="text-2xl font-extrabold mt-2 mb-4">Priority Score Formula</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every problem receives a 0–100 priority score calculated from five weighted factors.
                The formula is fully transparent — citizens and authorities can see exactly why a problem is ranked high or low.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                {[
                  { label: 'Severity', weight: '30%', color: 'bg-[#D92D20]', w: 95 },
                  { label: 'Urgency', weight: '25%', color: 'bg-[#F79009]', w: 90 },
                  { label: 'Frequency / Duplicates', weight: '20%', color: 'bg-[#155EEF]', w: 85 },
                  { label: 'Community Impact', weight: '15%', color: 'bg-slate-400', w: 75 },
                  { label: 'Persistence', weight: '10%', color: 'bg-[#0E9384]', w: 70 },
                ].map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{f.label}</span>
                      <span className="font-mono font-bold text-white">{f.weight}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className={`${f.color} h-full rounded-full`} style={{ width: `${f.w}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { range: '75–100', level: 'CRITICAL', color: 'bg-red-100 text-[#D92D20] border-red-200', dot: 'bg-[#D92D20]' },
                { range: '50–74',  level: 'HIGH',     color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
                { range: '25–49',  level: 'MEDIUM',   color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-[#F79009]' },
                { range: '0–24',   level: 'LOW',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-[#12B76A]' },
              ].map(p => (
                <div key={p.level} className={`p-5 rounded-2xl border ${p.color} bg-opacity-10`}>
                  <div className={`w-3 h-3 rounded-full ${p.dot} mb-2`} />
                  <div className="text-2xl font-black mb-0.5">{p.range}</div>
                  <div className="text-xs font-bold uppercase tracking-wider">{p.level}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPONSIBLE AI ────────────────────────────────── */}
      <section className="py-12 px-4 bg-blue-50 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <ShieldCheck className="h-8 w-8 text-[#155EEF] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-blue-900 mb-2">Responsible AI Commitment</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            AI recommendations are decision-support tools only. Authorities remain responsible for final decisions.
            AI predictions can be incorrect. Citizen reports undergo appropriate verification before official action.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="jd-gradient-hero jd-dot-grid py-20 px-4 text-white text-center relative">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#155EEF]/20 border border-[#155EEF]/30 flex items-center justify-center mx-auto mb-6">
            <Megaphone className="h-7 w-7 text-teal-300" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Join Your Community</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Every report helps build a clearer picture of your community&apos;s needs. Your voice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#155EEF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition">
                Get Started — It&apos;s Free
              </button>
            </Link>
            <Link href="/explore">
              <button className="px-8 py-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition">
                Browse Issues First
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
