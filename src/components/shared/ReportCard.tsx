'use client';
import Link from 'next/link';
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

  const priorityBorderMap: Record<string, string> = {
    CRITICAL: 'border-l-[#D92D20]',
    HIGH:     'border-l-[#F04438]',
    MEDIUM:   'border-l-[#F79009]',
    LOW:      'border-l-[#12B76A]',
  };

  return (
    <Link href={linkHref}>
      <div className={`
        bg-white rounded-2xl border border-[#E4E7EC] p-5 cursor-pointer
        shadow-[0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_12px_24px_-4px_rgba(16,24,40,0.08)]
        transition-all duration-200 border-l-4 group
        ${priorityBorderMap[report.priority_level] ?? 'border-l-slate-200'}
      `}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-mono font-bold">{displayId(report.id)}</span>
              {report.category && <CategoryBadge category={report.category} />}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-[#101828] leading-tight mb-1.5 line-clamp-2 group-hover:text-[#155EEF] transition-colors">
              {report.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-[#667085] line-clamp-2 mb-3 leading-relaxed">
              {truncate(report.description, 150)}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {report.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#D92D20]" />
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
      </div>
    </Link>
  );
}
