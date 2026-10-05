'use client';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/utils';

// ── Shared tooltip style ─────────────────────────────────────
const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / .1)', fontSize: 12 },
  labelStyle: { fontWeight: 600, marginBottom: 4 },
};

// ── Category bar chart ────────────────────────────────────────
interface CategoryData { category: string; count: number; color: string }
export function CategoryBarChart({ data }: { data: CategoryData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Reports over time area chart ──────────────────────────────
interface TimeSeriesData { date: string; count: number }
export function ReportsTimelineChart({ data }: { data: TimeSeriesData[] }) {
  const formatted = data.map(d => ({ ...d, label: formatDate(d.date, 'dd MMM') }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="count" stroke="#1d4ed8" strokeWidth={2} fill="url(#blueGrad)" dot={false} name="Reports" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Priority donut chart ──────────────────────────────────────
interface PriorityData { level: string; count: number }
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e',
};

export function PriorityDonutChart({ data }: { data: PriorityData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
          dataKey="count" nameKey="level" paddingAngle={2}>
          {data.map((d, i) => <Cell key={i} fill={PRIORITY_COLORS[d.level] ?? '#6b7280'} />)}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n]} />
        <Legend formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── City bar chart ────────────────────────────────────────────
interface CityData { city: string; count: number }
export function CityBarChart({ data }: { data: CityData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ top: 4, right: 24, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={56} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]} name="Reports" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Status pie chart ──────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  REPORTED: '#94a3b8', UNDER_REVIEW: '#3b82f6', VERIFIED: '#6366f1',
  ASSIGNED: '#a855f7', IN_PROGRESS: '#f59e0b', RESOLVED: '#14b8a6',
  CITIZEN_VERIFICATION: '#06b6d4', CLOSED: '#22c55e',
};

interface StatusData { status: string; count: number }
export function StatusPieChart({ data }: { data: StatusData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={85}
          dataKey="count" nameKey="status" paddingAngle={1}>
          {data.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.status] ?? '#6b7280'} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v.replace(/_/g, ' ')}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Resolution trend line chart ───────────────────────────────
interface ResolutionData { date: string; avgDays: number }
export function ResolutionTrendChart({ data }: { data: ResolutionData[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit=" d" />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v} days`, 'Avg Resolution']} />
        <Line type="monotone" dataKey="avgDays" stroke="#f97316" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
