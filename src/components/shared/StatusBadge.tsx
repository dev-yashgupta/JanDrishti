'use client';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/lib/utils';
import type { ReportStatus } from '@/types';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge className={`border ${cfg.badge} ${className ?? ''}`}>
      {cfg.label}
    </Badge>
  );
}
