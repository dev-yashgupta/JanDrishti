'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PriorityBadge } from './PriorityBadge';
import { formatDateTime } from '@/lib/utils';
import type { AIAnalysis } from '@/types';
import { Brain, AlertTriangle } from 'lucide-react';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100;
  const color = value >= 8 ? 'bg-red-500' : value >= 6 ? 'bg-orange-400' : value >= 4 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value}/10</span>
      </div>
      <Progress value={pct} indicatorClassName={color} className="h-1.5" />
    </div>
  );
}

export function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          AI Analysis
          <span className="ml-auto text-xs font-normal text-slate-400">
            {analysis.model_version}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disclaimer */}
        <div className="flex gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>AI analysis is a decision-support tool. Authorities are responsible for final decisions. AI predictions may be incorrect.</span>
        </div>

        {/* Category */}
        {analysis.predicted_category && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Predicted Category</span>
            <span className="font-semibold text-slate-800">
              {analysis.predicted_category}
              {analysis.category_confidence && (
                <span className="ml-1.5 text-xs text-slate-400">
                  ({Math.round(analysis.category_confidence * 100)}% confidence)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Priority Score</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-800">{analysis.priority_score}</span>
            <span className="text-sm text-slate-400">/100</span>
            <PriorityBadge level={analysis.priority_level} />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Score Breakdown</p>
          <ScoreRow label="Severity" value={analysis.severity_score} />
          <ScoreRow label="Urgency" value={analysis.urgency_score} />
          <ScoreRow label="Frequency" value={analysis.frequency_score} />
          <ScoreRow label="Community Impact" value={analysis.community_impact_score} />
          <ScoreRow label="Persistence" value={analysis.persistence_score} />
        </div>

        {/* Reasoning */}
        {analysis.reasoning && (
          <div className="rounded-md bg-slate-50 border border-slate-100 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Reasoning</p>
            <p className="text-sm text-slate-700">{analysis.reasoning}</p>
          </div>
        )}

        <p className="text-xs text-slate-400">Processed: {formatDateTime(analysis.processed_at)}</p>
      </CardContent>
    </Card>
  );
}
