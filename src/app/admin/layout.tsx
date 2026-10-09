'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Image as ImageIcon,
  Settings,
  SearchCheck,
  Fuel,
  RefreshCw,
  Wrench,
  Menu,
  X,
  ExternalLink,
  LogOut,
  ChevronRight,
  KeyRound,
  User,
} from 'lucide-react';
import { loadSupabaseBrowser } from '../../components/admin/cms';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts & News', icon: Newspaper },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
  { href: '/admin/seo', label: 'SEO Tools', icon: SearchCheck },
  { href: '/admin/rates', label: 'Market Rates', icon: Fuel },
  { href: '/admin/tools', label: 'Tool Manager', icon: Wrench },
  { href: '/admin/sync', label: 'Sync & Logs', icon: RefreshCw },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'unconfigured' | 'locked' | 'open'>('checking');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // TODO: backend pending — Supabase not connected yet; guard degrades gracefully.
    (async () => {
      const supabase = await loadSupabaseBrowser();
      if (!supabase) {
        setAuthState('unconfigured');
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUserEmail(data.session.user.email ?? null);
          setAuthState('open');
        } else {
          setAuthState('locked');
        }
      } catch {
        setAuthState('unconfigured');
      }
    })();
  }, [pathname]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  // Locked-out visitors go straight to the login card — never render the
  // dashboard shell first. The login page itself is excluded to avoid a loop.
  const isPublicAdminPage = pathname === '/admin/login' || pathname === '/admin/setup';
  useEffect(() => {
    if (authState === 'locked' && !isPublicAdminPage) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authState, isPublicAdminPage, pathname, router]);

  const handleSignOut = async () => {
    const supabase = await loadSupabaseBrowser();
    try {
      await supabase?.auth.signOut();
    } catch {}
    router.push('/admin/login');
  };

  const crumbs = pathname.split('/').filter(Boolean);

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm">
          PK
        </div>
        <div>
          <div className="text-sm font-extrabold text-white leading-tight">Pak Calc Hub</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Admin Console</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                active
                  ? 'bg-emerald-600/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800/80">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Supabase backend: {authState === 'unconfigured' ? 'not connected' : 'connected'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64">{sidebar}</div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
              <Link href="/admin" className="font-semibold hover:text-emerald-700">Admin</Link>
              {crumbs.slice(1).map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" />
                  <span className="capitalize font-medium text-slate-700 dark:text-slate-200 truncate">
                    {c.replace(/-/g, ' ')}
                  </span>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View site</span>
              </Link>
              {authState === 'open' ? (
                <>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-44 truncate">
                    <User className="h-3.5 w-3.5" />
                    {userEmail}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </>
              ) : authState === 'locked' && !isPublicAdminPage ? (
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {/* Supabase-not-connected banner (shell still renders) */}
        {authState === 'unconfigured' && !isPublicAdminPage && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6 dark:border-amber-900/50 dark:bg-amber-950/40">
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <KeyRound className="h-4 w-4 shrink-0" />
              <span>
                Supabase is not connected yet — CMS features are disabled. Market rates below still work.
                <Link href="/admin/rates" className="ml-1 underline underline-offset-2">Connect it in Market Rates → Database Connection</Link>
              </span>
            </p>
          </div>
        )}

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {authState === 'checking' ? (
            <div className="space-y-4" aria-label="Loading">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          ) : authState === 'locked' && !isPublicAdminPage ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                <User className="h-6 w-6" />
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Sign in required</h1>
              <p className="mt-1 text-sm text-slate-500">The admin console is protected. Sign in with your Supabase account to continue.</p>
              <Link
                href="/admin/login"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
