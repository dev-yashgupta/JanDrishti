'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { PRIORITY_WEIGHTS, SIMILARITY_THRESHOLD } from '@/lib/constants';
import { Brain, Settings, Sliders, Tag, AlertTriangle } from 'lucide-react';

interface WeightConfig {
  severity: number;
  urgency: number;
  frequency: number;
  community_impact: number;
  persistence: number;
}

export function AdminSettingsPage() {
  const toast = useToast();
  const [weights, setWeights] = useState<WeightConfig>({ ...PRIORITY_WEIGHTS });
  const [simThreshold, setSimThreshold] = useState(SIMILARITY_THRESHOLD);
  const [simRadius, setSimRadius] = useState(2.0);
  const [saving, setSaving] = useState(false);

  const weightSum = Object.values(weights).reduce((s, v) => s + v, 0);
  const weightsValid = Math.abs(weightSum - 1) < 0.001;

  async function saveConfig() {
    if (!weightsValid) { toast.error('Invalid weights', 'Priority weights must sum to 1.0'); return; }
    setSaving(true);
    try {
      const { aiConfigApi } = await import('@/services/api');
      await aiConfigApi.update({
        similarity_threshold: simThreshold,
        similarity_location_radius_km: simRadius,
        priority_weights: weights,
        severity_high_threshold: 7,
        urgency_high_threshold: 7,
      });
      toast.success('Settings saved', 'AI configuration updated on the backend.');
    } catch {
      toast.error('Save failed', 'Could not update AI configuration.');
    } finally {
      setSaving(false);
    }
  }

  function updateWeight(key: keyof WeightConfig, value: string) {
    const n = parseFloat(value);
    if (!isNaN(n) && n >= 0 && n <= 1) setWeights(prev => ({ ...prev, [key]: n }));
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

        </div>
        <p className="text-slate-500 text-sm mb-8">Configure AI thresholds, priority weights, and system behaviour.</p>

        <div className="space-y-6">
          {/* Priority weights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sliders className="h-5 w-5 text-blue-600" /> Priority Score Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                Weights must sum to 1.0. Current sum:{' '}
                <span className={weightsValid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {weightSum.toFixed(2)}
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.entries(weights) as [keyof WeightConfig, number][]).map(([key, val]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="capitalize">{key.replace('_', ' ')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={val}
                        onChange={e => updateWeight(key, e.target.value)}
                        className="w-24"
                      />
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${val * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-8">{Math.round(val * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {!weightsValid && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  <AlertTriangle className="h-4 w-4" /> Weights must sum to exactly 1.0
                </div>
              )}
            </CardContent>
          </Card>

          {/* Similarity settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-purple-600" /> Similarity Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Text Similarity Threshold</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="1"
                    value={simThreshold}
                    onChange={e => setSimThreshold(parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-slate-400">Minimum cosine similarity to group reports (0.5–1.0)</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Location Radius (km)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    value={simRadius}
                    onChange={e => setSimRadius(parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-slate-400">Geographic radius for cluster grouping</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-5 w-5 text-green-600" /> Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-3">
                12 default categories are active. Additional categories can be added via the backend API.
                In a deployed environment, this panel would allow full CRUD management.
              </p>
              <div className="rounded bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
                Category management via UI requires backend connectivity. Connect the FastAPI backend and this panel will be fully functional.
              </div>
            </CardContent>
          </Card>

          {/* System info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-5 w-5 text-slate-500" /> System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {[
                  { label: 'AI Model', value: 'jd-nlp-local-v1.0 (TF-IDF + LR)' },
                  { label: 'Frontend', value: 'Next.js 16 / React 19 / TypeScript' },
                  { label: 'Backend', value: 'FastAPI (Python) — connect separately' },
                  { label: 'Database', value: 'PostgreSQL — connect separately' },
                  { label: 'Mode', value: 'Demo / Mock data active' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-400">{row.label}</dt>
                    <dd className="font-medium text-slate-700">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Button onClick={saveConfig} loading={saving} className="w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
