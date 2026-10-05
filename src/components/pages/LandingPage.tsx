'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { MOCK_DASHBOARD_SUMMARY, MOCK_REPORTS, MOCK_CATEGORIES } from '@/services/mockData';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MapPin, Brain, Users, TrendingUp, Shield, CheckCircle2, ArrowRight, FileText, Search, Zap, Globe } from 'lucide-react';

const STEPS = [
  { step: '01', icon: '📝', title: 'Citizen Reports', desc: 'Citizens report civic problems with location, photos, and description.' },
  { step: '02', icon: '🤖', title: 'AI Processing', desc: 'AI classifies the problem, estimates severity, urgency, and finds similar reports.' },
  { step: '03', icon: '🎯', title: 'Priority Scoring', desc: 'A transparent score from 0–100 is calculated using severity, urgency, frequency, and persistence.' },
  { step: '04', icon: '📍', title: 'Geographic Clustering', desc: 'Similar reports in the same area are grouped into problem clusters for efficient handling.' },
  { step: '05', icon: '👮', title: 'Authority Action', desc: 'Authorities see a prioritised dashboard and assign problems to the right department.' },
  { step: '06', icon: '✅', title: 'Resolution & Verification', desc: 'Citizens verify resolution before a problem is closed.' },
];

const FEATURES = [
  {
    icon: <Brain className="h-6 w-6 text-blue-600" />,
    title: 'AI-Powered Classification',
    desc: 'NLP models automatically classify problems into categories and estimate their severity — no manual triage needed.',
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
    title: 'Transparent Priority Scoring',
    desc: 'Every problem gets an explainable 0–100 priority score with a breakdown of all contributing factors.',
  },
  {
    icon: <Globe className="h-6 w-6 text-green-600" />,
    title: 'Geographic Intelligence',
    desc: 'Interactive maps with heat-map overlays show where problems cluster geographically across cities.',
  },
  {
    icon: <Users className="h-6 w-6 text-purple-600" />,
    title: 'Community Amplification',
    desc: 'Citizens support existing reports, increasing their community impact score and raising visibility.',
  },
  {
    icon: <Search className="h-6 w-6 text-cyan-600" />,
    title: 'Duplicate Detection',
    desc: 'Similar reports in the same area are automatically grouped so authorities see the full scale of a problem.',
  },
  {
    icon: <Shield className="h-6 w-6 text-red-600" />,
    title: 'Full Status Tracking',
    desc: 'Every status change is recorded with timestamps and notes, giving citizens complete transparency.',
  },
];

const CRITICAL_PROBLEMS = MOCK_REPORTS.filter(r => r.priority_level === 'CRITICAL').slice(0, 3);

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="jd-gradient-hero text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm mb-6">
            <Zap className="h-4 w-4 text-orange-300" />
            <span>AI-powered civic intelligence for India</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            See a Problem.<br />
            <span className="text-orange-300">Report It. Prioritize It.</span><br />
            Resolve It.
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            JanDrishti AI uses artificial intelligence and community intelligence to identify, analyse and prioritise unresolved civic problems across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" variant="saffron" className="gap-2 text-base px-8 shadow-lg">
                <FileText className="h-5 w-5" /> Report a Problem
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Search className="h-5 w-5" /> Explore Community Issues
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-slate-400 uppercase tracking-wider">
            <DemoLabel />
            <span>— statistics sourced from seeded demo data</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: MOCK_DASHBOARD_SUMMARY.total_reports.toLocaleString(), label: 'Total Reports' },
              { value: MOCK_DASHBOARD_SUMMARY.unresolved.toLocaleString(), label: 'Unresolved Issues' },
              { value: MOCK_DASHBOARD_SUMMARY.critical.toString(), label: 'Critical Problems' },
              { value: `${MOCK_DASHBOARD_SUMMARY.avg_resolution_days} days`, label: 'Avg. Resolution Time' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-orange-400">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How JanDrishti AI Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From a citizen's first report to a verified resolution — a complete, AI-assisted workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <Card key={s.step} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5">Step {s.step}</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{s.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Key Features</h2>
            <p className="text-slate-500">Built for civic accountability, powered by AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all">
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live critical problems preview */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">Critical Problems Right Now</h2>
              <p className="text-slate-500 flex items-center gap-2">
                <DemoLabel /> Highest-priority issues from demo data
              </p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="gap-2">Explore All Issues <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="space-y-4">
            {CRITICAL_PROBLEMS.map((r, i) => (
              <Link href={`/reports/${r.id}`} key={r.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl font-bold text-red-200 shrink-0">#{i + 1}</span>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">{r.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{r.location?.city}, {r.location?.state}
                            </span>
                            <span>Reports: {r.support_count}</span>
                            <span>{r.ai_analysis?.priority_score && `Priority: ${r.ai_analysis.priority_score}/100`}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <PriorityBadge level={r.priority_level} score={r.ai_analysis?.priority_score} showScore />
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Problem Categories</h2>
            <p className="text-slate-500">12 core civic categories, fully extensible through the admin panel.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {MOCK_CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/explore?category=${cat.id}`}>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible AI note */}
      <section className="py-12 px-4 bg-blue-50 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Responsible AI Commitment</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            AI recommendations are decision-support tools only. Authorities remain responsible for final decisions.
            AI predictions can be incorrect. Citizen reports are not automatically treated as verified facts —
            appropriate verification is required before official action.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 jd-gradient-hero text-white text-center">
        <div className="max-w-2xl mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Join Your Community</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Every report helps build a clearer picture of your community's needs. Register today and help prioritise the problems that matter most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="saffron" className="px-8">Get Started — It's Free</Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Browse Issues First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
