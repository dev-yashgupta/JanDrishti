'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatCard } from '@/components/shared/StatCard';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/services/api';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
import { Search, Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';

const ROLE_BADGE: Record<string, string> = {
  CITIZEN:     'bg-slate-100 text-slate-700 border-slate-200',
  AUTHORITY:   'bg-blue-50 text-blue-700 border-blue-200',
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers]   = useState<User[]>([]);
  const [total, setTotal]   = useState(0);
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadUsers = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const res = await usersApi.list({ search, per_page: 50 });
      setUsers(res.items);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(query || undefined), 300);
    return () => clearTimeout(t);
  }, [query, loadUsers]);

  async function toggleActive(user: User) {
    setToggling(user.id);
    try {
      if (user.is_active) {
        const updated = await usersApi.deactivate(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
        toast.warning('User deactivated', `${user.full_name} has been deactivated.`);
      } else {
        const updated = await usersApi.activate(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
        toast.success('User activated', `${user.full_name} has been activated.`);
      }
    } catch (e) {
      toast.error('Action failed', e instanceof Error ? e.message : undefined);
    } finally { setToggling(null); }
  }

  const counts = {
    total,
    citizens:  users.filter(u => u.role === 'CITIZEN').length,
    authority: users.filter(u => u.role === 'AUTHORITY').length,
    active:    users.filter(u => u.is_active).length,
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Users</h1>
        <p className="text-slate-500 text-sm mb-6">Manage platform users and their roles.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard title="Total Users"  value={counts.total}     icon={<Users className="h-4 w-4 text-blue-600" />} />
          <StatCard title="Citizens"     value={counts.citizens}  icon={<Users className="h-4 w-4 text-slate-400" />} />
          <StatCard title="Authorities"  value={counts.authority} icon={<ShieldCheck className="h-4 w-4 text-blue-500" />} />
          <StatCard title="Active"       value={counts.active}    icon={<UserCheck className="h-4 w-4 text-green-500" />} />
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email or city…" className="pl-9" />
        </div>

        {loading ? (
          <LoadingSpinner size="lg" label="Loading users…" className="py-16" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500 hidden sm:table-cell">Location</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500 hidden md:table-cell">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {u.full_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{u.full_name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">{u.city ?? '—'}, {u.state ?? '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                            {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{formatDate(u.created_at)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {u.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" loading={toggling === u.id}
                            className={`text-xs ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            onClick={() => toggleActive(u)}
                            disabled={u.role === 'SUPER_ADMIN' || toggling === u.id}>
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && !loading && (
                  <p className="text-center text-slate-400 py-8">No users found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
