'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, AlertTriangle, Map, GitBranch, BarChart3,
  ClipboardList, Users, Settings, FileText, Compass, Bell,
  Home, PlusCircle, X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const AUTHORITY_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/admin/problems', label: 'Problems', icon: <AlertTriangle className="h-4 w-4" /> },
  { href: '/admin/map', label: 'Map View', icon: <Map className="h-4 w-4" /> },
  { href: '/admin/clusters', label: 'Clusters', icon: <GitBranch className="h-4 w-4" /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { href: '/admin/assignments', label: 'Assignments', icon: <ClipboardList className="h-4 w-4" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

const CITIZEN_NAV: NavItem[] = [
  { href: '/dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/report', label: 'Report Problem', icon: <PlusCircle className="h-4 w-4" /> },
  { href: '/reports', label: 'My Reports', icon: <FileText className="h-4 w-4" /> },
  { href: '/explore', label: 'Explore Issues', icon: <Compass className="h-4 w-4" /> },
  { href: '/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
];

function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-700 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
        {item.label}
        {item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.2rem] text-center">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const isAuthority = user?.role === 'AUTHORITY' || user?.role === 'SUPER_ADMIN';
  const nav = isAuthority ? AUTHORITY_NAV : CITIZEN_NAV;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {isAuthority ? 'Authority Portal' : 'Citizen Portal'}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/dashboard' && pathname.startsWith(item.href))}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs font-semibold text-blue-800 mb-1">JanDrishti AI</p>
            <p className="text-xs text-blue-600">
              Civic intelligence platform for India
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
