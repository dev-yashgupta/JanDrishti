'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { notificationsApi } from '@/services/api';
import { timeAgo } from '@/lib/utils';
import { Bell, CheckCheck, CheckCircle, AlertTriangle, GitBranch, MessageSquare, Info } from 'lucide-react';
import type { Notification } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  REPORT_VERIFIED:    <CheckCircle className="h-5 w-5 text-green-500" />,
  REPORT_ASSIGNED:    <Info className="h-5 w-5 text-blue-500" />,
  REPORT_RESOLVED:    <CheckCircle className="h-5 w-5 text-teal-500" />,
  STATUS_CHANGED:     <AlertTriangle className="h-5 w-5 text-amber-500" />,
  NEW_CRITICAL:       <AlertTriangle className="h-5 w-5 text-red-500" />,
  SIMILAR_DETECTED:   <GitBranch className="h-5 w-5 text-purple-500" />,
  COMMENT_ADDED:      <MessageSquare className="h-5 w-5 text-slate-500" />,
};

function NotificationItem({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  return (
    <div className={cn('flex items-start gap-4 p-4 rounded-lg border transition-colors',
      n.is_read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100')}>
      <div className="shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? <Bell className="h-5 w-5 text-slate-400" />}</div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', n.is_read ? 'text-slate-700' : 'text-slate-900')}>{n.title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-slate-400">{timeAgo(n.created_at)}</span>
          {n.report_id && (
            <Link href={`/reports/${n.report_id}`} className="text-xs text-blue-700 hover:underline">View Report →</Link>
          )}
        </div>
      </div>
      {!n.is_read && (
        <button onClick={() => onRead(n.id)} className="shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium">
          Mark read
        </button>
      )}
    </div>
  );
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  async function markRead(id: string) {
    await notificationsApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    await notificationsApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" /> Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center bg-blue-700 text-white rounded-full text-xs font-bold h-5 min-w-[1.25rem] px-1">
                {unreadCount}
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1.5 text-slate-500">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading…" className="py-16" />
        ) : notifications.length === 0 ? (
          <Card><CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No notifications yet</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => <NotificationItem key={n.id} n={n} onRead={markRead} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
