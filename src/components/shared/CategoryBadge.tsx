'use client';
import { CATEGORY_ICONS } from '@/lib/constants';
import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
  showIcon?: boolean;
}

export function CategoryBadge({ category, className, showIcon = true }: CategoryBadgeProps) {
  const icon = CATEGORY_ICONS[category.slug] ?? '📋';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${className ?? ''}`}
      style={{ backgroundColor: `${category.color}15`, color: category.color, borderColor: `${category.color}40` }}
    >
      {showIcon && <span>{icon}</span>}
      {category.name}
    </span>
  );
}
