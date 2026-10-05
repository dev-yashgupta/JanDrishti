'use client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { formatDate, timeAgo, displayId, truncate } from '@/lib/utils';
import { MapPin, ThumbsUp, Eye, Clock } from 'lucide-react';
import type { Report } from '@/types';

interface ReportCardProps {
  report: Report;
  href?: string;
  isAdmin?: boolean;
}

export function ReportCard({ report, href, isAdmin = false }: ReportCardProps) {
  const linkHref = href ?? (isAdmin ? `/admin/problems/${report.id}` : `/reports/${report.id}`);
  const priorityBorderMap = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-orange-400',
    MEDIUM: 'border-l-yellow-400',
    LOW: 'border-l-green-500',
  };

  return (
    <Link href={linkHref}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${priorityBorderMap[report.priority_level]}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-mono">{displayId(report.id)}</span>
                {report.category && <CategoryBadge category={report.category} />}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-slate-900 leading-tight mb-1.5 line-clamp-2">
                {report.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                {truncate(report.description, 150)}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                {report.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.location.city}, {report.location.state}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(report.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {report.support_count}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {report.view_count}
                </span>
                {report.date_observed && (
                  <span>Observed: {formatDate(report.date_observed)}</span>
                )}
              </div>
            </div>

            {/* Right side badges */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <PriorityBadge level={report.priority_level} score={report.priority_score} showScore />
              <StatusBadge status={report.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
