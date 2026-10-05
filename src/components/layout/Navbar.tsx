'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { NAV_LINKS_CITIZEN } from '@/lib/constants';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { logout, isAuthority } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Sidebar toggle (shown on admin/dashboard routes) */}
        {isAuthenticated && (isAdminRoute || pathname.startsWith('/dashboard') || pathname.startsWith('/reports')) && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-800 shrink-0">
          <span className="text-2xl">🇮🇳</span>
          <span className="hidden sm:inline text-lg">JanDrishti <span className="text-orange-500">AI</span></span>
        </Link>

        {/* Public nav links (only on non-admin, non-auth pages) */}
        {!isAdminRoute && !isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <Link href="/" className={cn('text-sm font-medium transition-colors hover:text-blue-700', pathname === '/' ? 'text-blue-700' : 'text-slate-600')}>Home</Link>
            <Link href="/explore" className={cn('text-sm font-medium transition-colors hover:text-blue-700', pathname === '/explore' ? 'text-blue-700' : 'text-slate-600')}>Explore</Link>
            <Link href="/about" className={cn('text-sm font-medium transition-colors hover:text-blue-700', pathname === '/about' ? 'text-blue-700' : 'text-slate-600')}>About</Link>
          </nav>
        )}

        {/* Citizen nav links */}
        {isAuthenticated && !isAuthority && !isAdminRoute && (
          <nav className="hidden md:flex items-center gap-6 ml-8">
            {NAV_LINKS_CITIZEN.map((l) => (
              <Link key={l.href} href={l.href} className={cn('text-sm font-medium transition-colors hover:text-blue-700', pathname === l.href ? 'text-blue-700' : 'text-slate-600')}>{l.label}</Link>
            ))}
          </nav>
        )}

        {/* Admin breadcrumb */}
        {isAdminRoute && (
          <div className="hidden md:flex items-center gap-2 ml-4 text-sm text-slate-400">
            <span>Authority Portal</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link href={isAuthority ? '/admin/dashboard' : '/notifications'}>
              <button className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </button>
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                  {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="hidden sm:inline font-medium text-slate-700">{user?.full_name?.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{user?.full_name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                      <span className="inline-flex mt-1 text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 border border-blue-100">
                        {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'AUTHORITY' ? 'Authority' : 'Citizen'}
                      </span>
                    </div>
                    <Link href={isAuthority ? '/admin/dashboard' : '/dashboard'} onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
                      </div>
                    </Link>
                    <Link href="/profile" onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                        <User className="h-4 w-4 text-slate-400" /> Profile
                      </div>
                    </Link>
                    {isAuthority && (
                      <Link href="/admin/settings" onClick={() => setProfileOpen(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                          <Settings className="h-4 w-4 text-slate-400" /> Settings
                        </div>
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/register"><Button size="sm">Register</Button></Link>
          </div>
        )}
      </div>
    </header>
  );
}
