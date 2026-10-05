import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  colorClass?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, colorClass, className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className={cn('text-3xl font-bold', colorClass ?? 'text-slate-900')}>{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            {trend && (
              <p className={cn('text-xs mt-2 font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
                {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn('p-2 rounded-lg', colorClass ? `bg-current/10` : 'bg-slate-100')}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
