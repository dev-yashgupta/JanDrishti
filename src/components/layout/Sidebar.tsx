'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, AlertTriangle, Map, GitBranch, BarChart3,
  ClipboardList, Users, Settings, FileText, Compass, Bell,
  Home, PlusCircle, X, Eye
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
}

const AUTHORITY_NAV: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Command Hub',    icon: <LayoutDashboard className="h-4 w-4" />, description: 'KPI overview' },
  { href: '/admin/problems',    label: 'Problems Queue', icon: <AlertTriangle className="h-4 w-4" />,  description: 'Priority-ranked issues' },
  { href: '/admin/map',         label: 'GIS Map View',   icon: <Map className="h-4 w-4" />,            description: 'Geo intelligence' },
  { href: '/admin/clusters',    label: 'AI Clusters',    icon: <GitBranch className="h-4 w-4" />,      description: 'Semantic groupings' },
  { href: '/admin/analytics',   label: 'Analytics',      icon: <BarChart3 className="h-4 w-4" />,      description: 'Trends & insights' },
  { href: '/admin/assignments', label: 'Assignments',    icon: <ClipboardList className="h-4 w-4" />,  description: 'Dept dispatch' },
  { href: '/admin/users',       label: 'Users',          icon: <Users className="h-4 w-4" />,          description: 'Access management' },
  { href: '/admin/settings',    label: 'AI Config',      icon: <Settings className="h-4 w-4" />,       description: 'Priority weights' },
];

const CITIZEN_NAV: NavItem[] = [
  { href: '/dashboard',      label: 'My Dashboard',   icon: <LayoutDashboard className="h-4 w-4" />, description: 'Overview & stats' },
  { href: '/report',         label: 'Report Problem',  icon: <PlusCircle className="h-4 w-4" />,     description: 'File a new issue' },
  { href: '/reports',        label: 'My Reports',      icon: <FileText className="h-4 w-4" />,       description: 'Track your reports' },
  { href: '/explore',        label: 'Explore Issues',  icon: <Compass className="h-4 w-4" />,        description: 'Community issues' },
  { href: '/notifications',  label: 'Notifications',   icon: <Bell className="h-4 w-4" />,           description: 'Updates & alerts' },
  { href: '/',               label: 'Home',            icon: <Home className="h-4 w-4" />,           description: 'Public landing' },
];

function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div className={cn('sidebar-link', isActive && 'active')}>
        <span className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-400')}>
          {item.icon}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold leading-none truncate">{item.label}</div>
          {item.description && (
            <div className={cn('text-[10px] mt-0.5 truncate', isActive ? 'text-blue-100' : 'text-slate-400')}>
              {item.description}
            </div>
          )}
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[1.2rem] text-center font-bold shrink-0">
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

  const roleLabel = isAuthority ? 'Authority Portal' : 'Citizen Portal';
  const roleBg    = isAuthority ? 'bg-[#071A2F]' : 'bg-white';

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
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E4E7EC] bg-white transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#E4E7EC]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#071A2F] via-[#155EEF] to-[#0E9384] flex items-center justify-center text-white shadow-xs">
              <Eye className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#071A2F] tracking-tight">JanDrishti<span className="text-[#155EEF]">.ai</span></p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAuthority ? 'Municipal Operations' : 'Citizen Tools'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={
                pathname === item.href ||
                (item.href !== '/admin/dashboard' && item.href !== '/dashboard' && item.href !== '/' && pathname.startsWith(item.href))
              }
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Footer card */}
        <div className="p-3 border-t border-[#E4E7EC]">
          <div className="rounded-xl bg-gradient-to-br from-[#071A2F] to-[#0A223E] p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-white">Active Ingestion</p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              TF-IDF NLP + Spatial GIS Engine
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Civic intelligence platform for India
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
