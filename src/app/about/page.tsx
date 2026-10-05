import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Shield, Users, Target, GitBranch, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

const TECH = [
  { name: 'Next.js 16', role: 'Frontend framework with App Router' },
  { name: 'React 19', role: 'UI component library' },
  { name: 'TypeScript', role: 'Type-safe development' },
  { name: 'Tailwind CSS v4', role: 'Utility-first styling' },
  { name: 'FastAPI (Python)', role: 'Backend REST API' },
  { name: 'PostgreSQL', role: 'Relational database' },
  { name: 'SQLAlchemy', role: 'ORM and query builder' },
  { name: 'scikit-learn', role: 'ML classification and similarity' },
  { name: 'Leaflet / React-Leaflet', role: 'Interactive maps' },
  { name: 'Recharts', role: 'Analytics charts' },
  { name: 'Zustand', role: 'Client state management' },
  { name: 'Zod + React Hook Form', role: 'Form validation' },
];

const PRINCIPLES = [
  {
    icon: <Brain className="h-6 w-6 text-blue-600" />,
    title: 'AI as Decision Support',
    desc: 'Every AI analysis includes an explanation and confidence score. Authorities always make the final call — AI does not act autonomously.',
  },
  {
    icon: <Shield className="h-6 w-6 text-green-600" />,
    title: 'Privacy First',
    desc: 'Citizens can submit reports anonymously. Personal data is not shared with third parties. Passwords are hashed using bcrypt.',
  },
  {
    icon: <Users className="h-6 w-6 text-purple-600" />,
    title: 'Community Ownership',
    desc: 'Problems belong to the community. Citizens can support, track, and verify resolution of any reported problem.',
  },
  {
    icon: <Target className="h-6 w-6 text-orange-500" />,
    title: 'Transparent Prioritisation',
    desc: 'The priority score formula is published. Citizens and authorities can see exactly why a problem has its score.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">About JanDrishti AI</h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            A civic intelligence platform that transforms scattered community reports into prioritised, geographically actionable problems.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Vision */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Vision</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed text-lg">
              Traditional grievance portals process problems linearly: a citizen submits, an authority receives, an authority processes.
              JanDrishti AI improves this by placing AI at the centre of the discovery pipeline.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Community data flows through NLP processing, problem detection, classification, duplicate detection,
              severity and urgency analysis, and geographic clustering — before an authority ever sees a case.
              The result is a dashboard showing <strong>what is most urgent, where it is, and why</strong>.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Design Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRINCIPLES.map(p => (
              <Card key={p.title} className="border-slate-200">
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">{p.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Priority formula */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How Priority Scores Work</h2>
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="p-6">
              <div className="font-mono text-sm text-blue-900 bg-white rounded-lg p-4 border border-blue-100 mb-4">
                <p className="font-bold mb-2">priority_score =</p>
                <p className="pl-4">(severity × 0.30</p>
                <p className="pl-4">+ urgency × 0.25</p>
                <p className="pl-4">+ frequency × 0.20</p>
                <p className="pl-4">+ community_impact × 0.15</p>
                <p className="pl-4">+ persistence × 0.10) × 10</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                <div className="bg-red-100 rounded-lg p-3"><p className="font-bold text-red-700">75–100</p><p className="text-red-600">Critical</p></div>
                <div className="bg-orange-100 rounded-lg p-3"><p className="font-bold text-orange-700">50–74</p><p className="text-orange-600">High</p></div>
                <div className="bg-yellow-100 rounded-lg p-3"><p className="font-bold text-yellow-700">25–49</p><p className="text-yellow-600">Medium</p></div>
                <div className="bg-green-100 rounded-lg p-3"><p className="font-bold text-green-700">0–24</p><p className="text-green-600">Low</p></div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI architecture */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">AI Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Brain className="h-5 w-5" />, name: 'ProblemClassifier', desc: 'TF-IDF + Logistic Regression with keyword fallback. Designed for future transformer replacement.' },
              { icon: <GitBranch className="h-5 w-5" />, name: 'SimilarityEngine', desc: 'Cosine similarity on TF-IDF vectors + geographic distance filter for duplicate/cluster detection.' },
              { icon: <BarChart3 className="h-5 w-5" />, name: 'PriorityEngine', desc: 'Weighted formula combining severity, urgency, frequency, community impact, and persistence scores.' },
            ].map(a => (
              <Card key={a.name} className="border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2 text-blue-700">{a.icon}<span className="font-mono text-sm font-semibold">{a.name}</span></div>
                  <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-4">
            All AI models are isolated behind service interfaces. Multilingual transformer models and LLM APIs can be dropped in without changing API routes.
          </p>
        </section>

        {/* Tech stack */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Technology Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TECH.map(t => (
              <div key={t.name} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-xl bg-amber-50 border border-amber-200 p-6">
          <h3 className="font-semibold text-amber-800 mb-2">Important Disclaimer</h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            JanDrishti AI is a demonstration platform. All data displayed is synthetic demo data and does not represent
            real government complaints or actual civic problems. AI analysis results are generated by lightweight local
            models and should not be treated as authoritative. Real deployment would require integration with verified
            government data sources and compliance with applicable data-protection laws.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
