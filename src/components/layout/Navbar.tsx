'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { PriorityWeightsModal } from '@/components/shared/PriorityWeightsModal';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Eye, ChevronDown, LogOut, User, Settings,
  LayoutDashboard, Menu, Bell, Plus, Globe,
  Sliders, Compass, Layers, Cpu, Sparkles
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { logout, isAuthority } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);

  const isAdminRoute = pathname.startsWith('/admin');
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  const roleLabel =
    user?.role === 'SUPER_ADMIN' ? 'Super Admin'
    : user?.role === 'AUTHORITY' ? 'Municipal Officer'
    : 'Citizen';

  const roleBg =
    user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800'
    : user?.role === 'AUTHORITY'  ? 'bg-blue-100 text-blue-800'
    : 'bg-teal-100 text-teal-800';

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Main SaaS header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E7EC]/80 transition-all duration-200 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Sidebar toggle on admin/dashboard */}
            {isAuthenticated && (isAdminRoute || pathname.startsWith('/dashboard')) && (
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition mr-2"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}

            {/* ── Left: Brand Identity ─────────────────────────────── */}
            <Link href="/" className="flex items-center space-x-3 cursor-pointer select-none shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#071A2F] via-[#155EEF] to-[#0E9384] flex items-center justify-center text-white shadow-sm shadow-blue-500/25 ring-1 ring-black/5">
                <Eye className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[1.15rem] font-extrabold tracking-tight text-[#071A2F]">
                    JanDrishti<span className="text-[#155EEF] font-black">.ai</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="System Live" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-0.5">
                  Civic Intelligence
                </span>
              </div>
            </Link>

            {/* ── Center: Primary Clean Navigation ────────────────── */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              <Link href="/"
                className={cn('nav-pill', isActive('/', true) ? 'active' : '')}
              >
                Home
              </Link>

              <Link href="/map"
                className={cn('nav-pill', isActive('/map') ? 'active' : '')}
              >
                Community Map
              </Link>

              <Link href="/explore"
                className={cn('nav-pill', isActive('/explore') ? 'active' : '')}
              >
                Explore Issues
              </Link>

              <Link href="/analytics"
                className={cn('nav-pill', isActive('/analytics') ? 'active' : '')}
              >
                Analytics
              </Link>

              {/* Authority Shortcut */}
              {isAuthority && (
                <Link href="/admin/dashboard"
                  className={cn('nav-pill', isActive('/admin') ? 'active' : '')}
                >
                  Admin Hub
                </Link>
              )}

              {/* Citizen Dashboard Shortcut */}
              {!isAuthority && isAuthenticated && (
                <Link href="/dashboard"
                  className={cn('nav-pill', isActive('/dashboard') ? 'active' : '')}
                >
                  My Dashboard
                </Link>
              )}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen(v => !v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>More</span>
                  <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform duration-200", moreOpen && "rotate-180")} />
                </button>

                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-[#E4E7EC] py-1.5 z-20">
                      <Link
                        href="/#categories-grid"
                        onClick={() => setMoreOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Layers className="h-4 w-4 text-[#0E9384]" />
                        <span>Problem Taxonomy</span>
                      </Link>
                      <Link
                        href="/#pipeline"
                        onClick={() => setMoreOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Cpu className="h-4 w-4 text-[#155EEF]" />
                        <span>How JanDrishti AI Works</span>
                      </Link>
                      <button
                        onClick={() => { setMoreOpen(false); setWeightsOpen(true); }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Sliders className="h-4 w-4 text-[#F79009]" />
                        <span>Priority Weights Engine</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* ── Right Side Controls ───────────────────────── */}
            <div className="flex items-center space-x-2.5">

              {/* Language Switcher Pill */}
              <button
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                title="Change Language"
              >
                <Globe className="h-3.5 w-3.5 text-[#155EEF]" />
                <span>HI</span>
              </button>

              {/* Primary Report Action CTA */}
              <Link href="/report">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#155EEF] hover:bg-blue-600 text-white shadow-sm shadow-blue-500/30 transition hover:shadow-md cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Report Problem</span>
                </button>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Auth State */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  
                  {/* Notifications */}
                  <Link href={isAuthority ? '/admin/dashboard' : '/notifications'}>
                    <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition" aria-label="Notifications">
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                    </button>
                  </Link>

                  {/* User Profile Pill */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(v => !v)}
                      className="flex items-center gap-2 py-1 px-2 rounded-xl border border-[#E4E7EC] bg-white hover:bg-slate-50 transition select-none shadow-xs cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#071A2F] to-[#155EEF] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                        {initials}
                      </div>
                      <div className="text-left hidden lg:block pr-0.5">
                        <div className="text-xs font-bold text-slate-800 leading-none">
                          {user?.full_name?.split(' ')[0] || 'User'}
                        </div>
                        <div className="text-[9px] font-semibold text-[#0E9384] uppercase mt-0.5">{roleLabel}</div>
                      </div>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </button>

                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E4E7EC] rounded-2xl shadow-xl py-1.5 z-20 divide-y divide-slate-100 animate-scale-in">

                          {/* User header */}
                          <div className="px-4 py-2.5 bg-slate-50/60">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                              <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold', roleBg)}>{roleLabel}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{user?.email}</p>
                          </div>

                          {/* Workspace links */}
                          <div className="py-1 text-xs text-slate-700">
                            <Link href={isAuthority ? '/admin/dashboard' : '/dashboard'} onClick={() => setProfileOpen(false)}>
                              <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                                <LayoutDashboard className="h-4 w-4 text-[#155EEF]" />
                                <span>{isAuthority ? 'Authority Command Center' : 'Citizen Dashboard'}</span>
                              </div>
                            </Link>
                            
                            <button
                              onClick={() => { setProfileOpen(false); setWeightsOpen(true); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 cursor-pointer text-left"
                            >
                              <Sliders className="h-4 w-4 text-[#F79009]" />
                              <span>Config Priority Weights</span>
                            </button>

                            <Link href="/profile" onClick={() => setProfileOpen(false)}>
                              <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                                <User className="h-4 w-4 text-slate-400" />
                                <span>Profile &amp; Settings</span>
                              </div>
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="pt-1">
                            <button
                              onClick={() => { setProfileOpen(false); logout(); }}
                              className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#D92D20] hover:bg-red-50 cursor-pointer"
                            >
                              <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Link href="/login">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#155EEF] hover:bg-slate-50 transition cursor-pointer">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E4E7EC] bg-white text-slate-800 hover:bg-slate-50 transition cursor-pointer">
                      Register
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E4E7EC] bg-white px-4 py-4 space-y-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Navigation</span>
              {[
                { href: '/', label: 'Home' },
                { href: '/map', label: 'Community Map' },
                { href: '/explore', label: 'Explore Issues' },
                { href: '/analytics', label: 'Analytics' },
                { href: isAuthority ? '/admin/dashboard' : '/dashboard', label: isAuthority ? 'Authority Command Center' : 'Citizen Dashboard' },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-800 rounded-lg hover:bg-slate-50">
                    {item.label}
                  </div>
                </Link>
              ))}
              <button
                onClick={() => { setMobileOpen(false); setWeightsOpen(true); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Sliders className="h-3.5 w-3.5 text-[#F79009]" />
                <span>Priority Weights Engine</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Contextual sub-bar ───────────────────────── */}
      <div className="jd-subbar hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#155EEF]">📍</span>
              <span>Gurugram &amp; Chandigarh Municipal Clusters</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="hidden sm:inline font-mono text-[10px] text-slate-400">TF-IDF NLP + Spatial GIS Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-600">Active Ingestion</span>
            </span>
          </div>
        </div>
      </div>

      {/* Global Priority Weights Engine Modal */}
      <PriorityWeightsModal
        isOpen={weightsOpen}
        onClose={() => setWeightsOpen(false)}
      />
    </>
  );
}
