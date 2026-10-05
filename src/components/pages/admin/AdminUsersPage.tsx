'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DemoLabel } from '@/components/shared/DemoLabel';
import { useToast } from '@/hooks/useToast';
import { MOCK_CITIZEN, MOCK_AUTHORITY, MOCK_SUPERADMIN } from '@/services/mockData';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
import { Search, Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';

const ALL_USERS: User[] = [
  MOCK_CITIZEN,
  MOCK_AUTHORITY,
  MOCK_SUPERADMIN,
  { ...MOCK_CITIZEN, id: 'u-4', full_name: 'Amit Tiwari', email: 'amit@demo.in', city: 'Lucknow', state: 'Uttar Pradesh' },
  { ...MOCK_CITIZEN, id: 'u-5', full_name: 'Kavya Nair', email: 'kavya@demo.in', city: 'Delhi', state: 'Delhi' },
  { ...MOCK_CITIZEN, id: 'u-6', full_name: 'Meena Kumari', email: 'meena@demo.in', city: 'Patna', state: 'Bihar' },
  { ...MOCK_AUTHORITY, id: 'u-7', full_name: 'Suresh Patel', email: 'spatel@demo.gov.in', city: 'Ahmedabad', state: 'Gujarat' },
];

const ROLE_BADGE: Record<string, string> = {
  CITIZEN: 'bg-slate-100 text-slate-700 border-slate-200',
  AUTHORITY: 'bg-blue-50 text-blue-700 border-blue-200',
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function AdminUsersPage() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set(ALL_USERS.filter(u => u.is_active).map(u => u.id)));

  const filtered = ALL_USERS.filter(u => {
    if (!query) return true;
    const q = query.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.city ?? '').toLowerCase().includes(q);
  });

  function toggleActive(id: string, name: string) {
    setActiveUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.warning('User deactivated', `${name} has been deactivated.`); }
      else { next.add(id); toast.success('User activated', `${name} has been activated.`); }
      return next;
    });
  }

  const counts = { total: ALL_USERS.length, citizens: ALL_USERS.filter(u => u.role === 'CITIZEN').length, authority: ALL_USERS.filter(u => u.role === 'AUTHORITY').length, active: activeUsers.size };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <DemoLabel />
        </div>
        <p className="text-slate-500 text-sm mb-6">Manage platform users and their roles.</p>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Users', value: counts.total, icon: <Users className="h-4 w-4 text-blue-600" /> },
            { label: 'Citizens', value: counts.citizens, icon: <Users className="h-4 w-4 text-slate-400" /> },
            { label: 'Authorities', value: counts.authority, icon: <ShieldCheck className="h-4 w-4 text-blue-500" /> },
            { label: 'Active', value: counts.active, icon: <UserCheck className="h-4 w-4 text-green-500" /> },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                {s.icon}
                <div><p className="text-xs text-slate-400">{s.label}</p><p className="text-xl font-bold text-slate-800">{s.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email or city…" className="pl-9" />
        </div>

        {/* Table */}
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
                  {filtered.map(u => (
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
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${activeUsers.has(u.id) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {activeUsers.has(u.id) ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {activeUsers.has(u.id) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${activeUsers.has(u.id) ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          onClick={() => toggleActive(u.id, u.full_name)}
                          disabled={u.role === 'SUPER_ADMIN'}
                        >
                          {activeUsers.has(u.id) ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
