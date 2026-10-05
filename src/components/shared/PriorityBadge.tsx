'use client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PriorityLevel } from '@/types';

const CONFIG: Record<PriorityLevel, { label: string; variant: 'critical' | 'high' | 'medium' | 'low' }> = {
  CRITICAL: { label: 'Critical', variant: 'critical' },
  HIGH: { label: 'High', variant: 'high' },
  MEDIUM: { label: 'Medium', variant: 'medium' },
  LOW: { label: 'Low', variant: 'low' },
};

interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
  className?: string;
  showScore?: boolean;
}

export function PriorityBadge({ level, score, className, showScore = false }: PriorityBadgeProps) {
  const { label, variant } = CONFIG[level];
  return (
    <Badge variant={variant} className={cn('font-semibold', className)}>
      {label}{showScore && score !== undefined ? ` · ${score}` : ''}
    </Badge>
  );
}
