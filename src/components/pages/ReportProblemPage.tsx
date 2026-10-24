'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIAnalysisCard } from '@/components/shared/AIAnalysisCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { reportSchema, type ReportFormData } from '@/lib/validations';
import { useCategories } from '@/hooks/useReports';
import { INDIAN_STATES } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import { reportsApi } from '@/services/api';
import type { AIAnalysis, Category, Report } from '@/types';
import {
  AlertCircle, MapPin, CheckCircle2, ChevronRight,
  ChevronLeft, FileText, Tag, Eye, EyeOff,
} from 'lucide-react';

/* ── Local AI preview (client-side, no backend needed for the preview) ─── */
function simulateAI(title: string, description: string, categoryName: string): AIAnalysis {
  const text = `${title} ${description}`.toLowerCase();
  const dangerWords = ['accident','injury','death','contaminated','collapse','fire','emergency'];
  const healthWords = ['water','sanitation','sewage','garbage','hospital','disease'];
  const persistWords = ['week','month','days','year','long time','years'];

  const d = dangerWords.filter(w => text.includes(w)).length;
  const h = healthWords.filter(w => text.includes(w)).length;
  const p = persistWords.filter(w => text.includes(w)).length;

  const severity        = Math.min(10, 4 + d * 1.5 + h * 0.8);
  const urgency         = Math.min(10, 3 + d * 2   + p * 0.7);
  const frequency       = Math.min(10, 3 + Math.random() * 4);
  const community_impact = Math.min(10, 4 + h * 1.2);
  const persistence     = Math.min(10, 2 + p * 1.5);
  const raw = severity * 0.30 + urgency * 0.25 + frequency * 0.20 + community_impact * 0.15 + persistence * 0.10;
  const priority_score  = Math.round(Math.min(raw * 10, 100));
  const priority_level  = priority_score >= 75 ? 'CRITICAL' : priority_score >= 50 ? 'HIGH' : priority_score >= 25 ? 'MEDIUM' : 'LOW';

  const reasons: string[] = [];
  if (d > 0) reasons.push('safety risk indicators detected');
  if (h > 0) reasons.push('public-health implications');
  if (p > 0) reasons.push('prolonged duration reported');

  return {
    id: `preview-${Date.now()}`,
    report_id: 'pending',
    predicted_category: categoryName,
    category_confidence: 0.78 + Math.random() * 0.15,
    severity_score: Math.round(severity * 10) / 10,
    urgency_score: Math.round(urgency * 10) / 10,
    frequency_score: Math.round(frequency * 10) / 10,
    community_impact_score: Math.round(community_impact * 10) / 10,
    persistence_score: Math.round(persistence * 10) / 10,
    priority_score,
    priority_level: priority_level as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    priority_breakdown: { severity, urgency, frequency, community_impact, persistence },
    reasoning: reasons.length ? `${reasons.join('; ')}.` : 'Standard civic issue requiring attention.',
    model_version: 'jd-nlp-preview',
    processed_at: new Date().toISOString(),
  };
}

const STEPS = ['Details', 'Location', 'Media', 'Review'];

export function ReportProblemPage() {
  const toast                     = useToast();
  const { categories, loading: catLoading, fetchCategories } = useCategories();
  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [submitted, setSubmitted] = useState<Report | null>(null);
  const [files, setFiles]         = useState<File[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const {
    register, handleSubmit, setValue, watch, trigger,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema) as never,
    mode: 'onChange',
  });

  const watchedTitle = watch('title', '');
  const watchedDesc  = watch('description', '');
  const watchedCat   = watch('category_id', '');

  function handleDescriptionBlur() {
    if (watchedDesc.length >= 30 && watchedCat) {
      const cat = categories.find((c: Category) => c.id === watchedCat);
      setAiAnalysis(simulateAI(watchedTitle, watchedDesc, cat?.name ?? 'Other'));
    }
  }

  async function nextStep() {
    const fields: (keyof ReportFormData)[][] = [
      ['title', 'description', 'category_id'],
      ['city', 'state'],
      [],
      [],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep(s => s + 1);
  }

  async function onSubmit(data: ReportFormData) {
    setSubmitting(true);
    try {
      const report = await reportsApi.create({ ...data, is_anonymous: isAnonymous });
      setSubmitted(report);
      toast.success('Problem reported!', 'Your report has been submitted successfully.');
    } catch (err) {
      toast.error('Submission failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Problem Reported Successfully!</h1>
          <p className="text-slate-500 mb-8">Thank you for helping your community.</p>

          <Card className="text-left mb-6">
            <CardContent className="p-6 space-y-3">
              {[
                { label: 'Report ID', value: `#${submitted.id.slice(0, 8).toUpperCase()}`, mono: true },
                { label: 'Category',  value: submitted.category?.name ?? '—' },
                { label: 'Priority',  value: `${submitted.priority_level}${submitted.priority_score ? ` (${submitted.priority_score}/100)` : ''}` },
                { label: 'Location',  value: `${submitted.location?.city}, ${submitted.location?.state}` },
                { label: 'Status',    value: 'Reported' },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={`font-semibold text-slate-800 ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {submitted.ai_analysis && <AIAnalysisCard analysis={submitted.ai_analysis} />}

          <div className="flex gap-3 justify-center mt-8">
            <Link href={`/reports/${submitted.id}`}><Button variant="outline">View Report</Button></Link>
            <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ── Form wizard ── */
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Report a Problem</h1>
        <p className="text-slate-500 text-sm mb-6">Help your community by reporting a civic issue.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex items-center justify-center rounded-full h-7 w-7 text-xs font-bold transition-colors
                ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-blue-700' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-10 ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 0 — Details */}
          {step === 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" /> Problem Details</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input id="title" placeholder="e.g. Large pothole near main market" {...register('title')} aria-invalid={!!errors.title} />
                  {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                  <p className="text-xs text-slate-400">{watchedTitle.length}/200 characters</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea id="description" rows={5}
                    placeholder="Describe the problem in detail — how long it has existed, its impact, and how many people are affected."
                    {...register('description')} aria-invalid={!!errors.description}
                    onBlur={handleDescriptionBlur} />
                  {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
                  <p className="text-xs text-slate-400">{watchedDesc.length}/2000 characters</p>
                </div>

                <div className="space-y-1.5">
                  <Label><Tag className="inline h-4 w-4 mr-1 text-slate-400" />Category <span className="text-red-500">*</span></Label>
                  {catLoading ? (
                    <LoadingSpinner size="sm" label="Loading categories…" />
                  ) : (
                    <Select onValueChange={v => setValue('category_id', v)}>
                      <SelectTrigger aria-label="Category" aria-invalid={!!errors.category_id}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter((c: Category) => c.is_active).map((c: Category) => (
                          <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.category_id && <p className="text-xs text-red-600">{errors.category_id.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date_observed">Date Observed</Label>
                  <Input id="date_observed" type="date" {...register('date_observed')} max={new Date().toISOString().split('T')[0]} />
                </div>

                {/* Live AI preview */}
                {aiAnalysis && (
                  <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
                    <p className="text-xs font-semibold text-blue-700 mb-2">🤖 AI Preview</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Category: </span><span className="font-medium">{aiAnalysis.predicted_category}</span></div>
                      <div><span className="text-slate-500">Priority: </span><span className="font-bold text-slate-800">{aiAnalysis.priority_score}/100</span></div>
                      <div><span className="text-slate-500">Severity: </span><span className="font-medium">{aiAnalysis.severity_score}/10</span></div>
                      <div><span className="text-slate-500">Urgency: </span><span className="font-medium">{aiAnalysis.urgency_score}/10</span></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">{aiAnalysis.reasoning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" /> Location</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input id="city" placeholder="Jaipur" {...register('city')} aria-invalid={!!errors.city} />
                    {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>State <span className="text-red-500">*</span></Label>
                    <Select onValueChange={v => setValue('state', v)}>
                      <SelectTrigger aria-label="State" aria-invalid={!!errors.state}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-xs text-red-600">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Street Address <span className="text-slate-400">(optional)</span></Label>
                  <Input id="address" placeholder="Near City Mall, Ring Road" {...register('address')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="latitude">Latitude <span className="text-slate-400">(optional)</span></Label>
                    <Input id="latitude" type="number" step="0.0001" placeholder="26.9124"
                      onChange={e => setValue('latitude', parseFloat(e.target.value) || undefined)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="longitude">Longitude <span className="text-slate-400">(optional)</span></Label>
                    <Input id="longitude" type="number" step="0.0001" placeholder="75.7873"
                      onChange={e => setValue('longitude', parseFloat(e.target.value) || undefined)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2 — Media */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Evidence <span className="text-sm font-normal text-slate-400">(optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type === 'video/mp4');
                    setFiles(prev => [...prev, ...dropped].slice(0, 5));
                  }}
                >
                  <input type="file" id="file-upload" className="sr-only" multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
                    onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 5))} />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📎</div>
                    <p className="text-sm font-medium text-slate-600">Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP or MP4 · Max 10 MB · Up to 5 files</p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                        <span className="truncate text-slate-700">{f.name}</span>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="contact_info">Contact Information <span className="text-slate-400">(optional)</span></Label>
                  <Input id="contact_info" placeholder="Phone or additional contact details" {...register('contact_info')} />
                </div>

                <button type="button" onClick={() => setIsAnonymous(v => !v)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm w-full transition-colors
                    ${isAnonymous ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isAnonymous ? 'Submitting anonymously' : 'Submit with your name'}
                  <span className="ml-auto text-xs text-slate-400">Your name will {isAnonymous ? 'not' : ''} be shown</span>
                </button>
              </CardContent>
            </Card>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>Review & Submit</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-slate-50 border border-slate-200 divide-y divide-slate-100">
                  {[
                    { label: 'Title',        value: watchedTitle },
                    { label: 'Description',  value: watchedDesc.slice(0, 120) + (watchedDesc.length > 120 ? '…' : '') },
                    { label: 'Category',     value: categories.find((c: Category) => c.id === watchedCat)?.name },
                    { label: 'City',         value: watch('city') },
                    { label: 'State',        value: watch('state') },
                    { label: 'Anonymous',    value: isAnonymous ? 'Yes' : 'No' },
                    { label: 'Attachments',  value: files.length > 0 ? `${files.length} file(s)` : 'None' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="font-medium text-slate-800 text-right max-w-xs">
                        {row.value || <span className="text-slate-400 italic">Not set</span>}
                      </span>
                    </div>
                  ))}
                </div>

                {aiAnalysis && <AIAnalysisCard analysis={aiAnalysis} />}

                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
                  By submitting, you confirm this is an accurate description of a genuine civic problem.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep} className="gap-2">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" loading={submitting}>
                {submitting ? 'Submitting…' : 'Submit Report'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
