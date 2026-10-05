import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { PriorityLevel, ReportStatus } from '@/types';

// ── Tailwind class merging ───────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date helpers ─────────────────────────────────────────────
export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ── Priority helpers ─────────────────────────────────────────
export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bg: string; border: string; badge: string }
> = {
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  LOW: {
    label: 'Low',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
};

export function getPriorityFromScore(score: number): PriorityLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

// ── Status helpers ───────────────────────────────────────────
export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string; badge: string; step: number }
> = {
  REPORTED: {
    label: 'Reported',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    step: 1,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    step: 2,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    step: 3,
  },
  ASSIGNED: {
    label: 'Assigned',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    step: 4,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    step: 5,
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    step: 6,
  },
  CITIZEN_VERIFICATION: {
    label: 'Citizen Verification',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    step: 7,
  },
  CLOSED: {
    label: 'Closed',
    color: 'text-green-700',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800 border-green-200',
    step: 8,
  },
};

export const STATUS_WORKFLOW: ReportStatus[] = [
  'REPORTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CITIZEN_VERIFICATION',
  'CLOSED',
];

// ── Category color mapping ────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  'roads-infrastructure': '#ef4444',
  'water-supply': '#3b82f6',
  'sanitation-waste': '#f97316',
  healthcare: '#ec4899',
  education: '#8b5cf6',
  electricity: '#eab308',
  'public-safety': '#dc2626',
  environment: '#22c55e',
  'drainage-flooding': '#06b6d4',
  'public-transport': '#6366f1',
  housing: '#a855f7',
  other: '#6b7280',
};

// ── Number formatting ────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function clampScore(value: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, Math.round(value * 10) / 10));
}

// ── Indian states list ───────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ── Truncate text ────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

// ── Generate report ID display ───────────────────────────────
export function displayId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
