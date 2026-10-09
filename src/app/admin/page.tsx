'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  FileEdit,
  Eye,
  Fuel,
  RefreshCw,
  Plus,
  Upload,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cmsFetch, cmsErrorMessage, Post } from '../../components/admin/cms';

interface OverviewStats {
  published: number;
  drafts: number;
  views: number;
  cmsOk: boolean;
  cmsError?: string;
  ratesCount: number;
  lastSyncAt?: string;
  lastSyncStatus?: string;
}

interface SyncLogRow {
  id: string;
  type: string;
  status: string;
  message: string;
  createdAt: string;
}


function LiveSitePanel() {
  const [live, setLive] = useState<any>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/rates/live', { cache: 'no-store' });
        if (!r.ok) throw new Error('bad');
        setLive(await r.json());
      } catch { setErr(true); }
    })();
  }, []);
  const tiles = live ? [
    { label: 'Petrol', value: `Rs ${Number(live.petrol).toLocaleString('en-PK')}/L` },
    { label: 'Diesel', value: `Rs ${Number(live.diesel).toLocaleString('en-PK')}/L` },
    { label: 'Gold 24K', value: `Rs ${Number(live.gold24kTola).toLocaleString('en-PK')}/tola` },
    { label: 'USD / PKR', value: `Rs ${Number(live.usdPkr).toFixed(2)}` },
  ] : [];
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-700 to-teal-800 p-5 text-white shadow-sm dark:border-emerald-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <span className="live-dot" /> Your website right now
        </h2>
        <span className="text-[11px] font-semibold text-emerald-100">
          {err ? 'Could not reach live rates — site may be redeploying' : live ? (live.live ? 'Live rates flowing' : 'Serving backup rates') : 'Checking…'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.length === 0 ? [0,1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />) : tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">{tile.label}</div>
            <div className="tnum mt-0.5 text-lg font-extrabold">{tile.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-emerald-100">
        <span>49 calculators live</span>
        <Link href="/admin/content" className="underline underline-offset-2 hover:text-white">Edit site content</Link>
        <Link href="/admin/rates" className="underline underline-offset-2 hover:text-white">Pin manual rates</Link>
        <Link href="/" target="_blank" className="underline underline-offset-2 hover:text-white">Open public site</Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="mt-1 text-[11px] font-semibold text-slate-500">{sub}</div>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentLogs, setRecentLogs] = useState<SyncLogRow[]>([]);

  useEffect(() => {
    (async () => {
      const next: OverviewStats = {
        published: 0,
        drafts: 0,
        views: 0,
        cmsOk: false,
        ratesCount: 0,
      };
      // CMS posts (contract: GET /api/cms/posts). Graceful when 503/401.
      try {
        const data = await cmsFetch<{ posts: Post[] }>('/posts?limit=100');
        const posts: Post[] = data.posts || [];
        next.published = posts.filter((p) => p.status === 'published').length;
        next.drafts = posts.filter((p) => p.status !== 'published').length;
        next.views = posts.reduce((s, p) => s + (p.views || 0), 0);
        next.cmsOk = true;
        setRecentPosts(posts.slice(0, 5));
      } catch (err) {
        next.cmsError = cmsErrorMessage(err);
      }
      // Existing rates + automation endpoints (always available).
      try {
        const r = await fetch('/api/admin/rates');
        if (r.ok) {
          const d = await r.json();
          if (d.success && Array.isArray(d.rates)) next.ratesCount = d.rates.length;
        }
      } catch {}
      try {
        const a = await fetch('/api/admin/automation');
        if (a.ok) {
          const d = await a.json();
          if (d.success && Array.isArray(d.logs)) {
            const logs: SyncLogRow[] = d.logs.slice(0, 5);
            setRecentLogs(logs);
            if (logs[0]) {
              next.lastSyncAt = logs[0].createdAt;
              next.lastSyncStatus = logs[0].status;
            }
          }
        }
      } catch {}
      setStats(next);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Content, rates and automation at a glance.</p>
      </div>

      {!stats?.cmsOk && stats?.cmsError && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>CMS stats unavailable: {stats.cmsError}</span>
        </div>
      )}

      {/* Live website status — pulled from the public site itself */}
      <LiveSitePanel />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Newspaper} label="Published posts" value={String(stats?.published ?? '—')} sub="Blog, news & articles live" tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
        <StatCard icon={FileEdit} label="Drafts" value={String(stats?.drafts ?? '—')} sub="Unpublished & scheduled" tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
        <StatCard icon={Eye} label="Total views" value={(stats?.views ?? 0).toLocaleString()} sub="Across all posts" tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
        <StatCard
          icon={Fuel}
          label="Market rates"
          value={String(stats?.ratesCount || '—')}
          sub={stats?.lastSyncAt ? `Last sync ${new Date(stats.lastSyncAt).toLocaleString()}` : 'Live rates manager'}
          tone="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent posts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent posts</h2>
            <Link href="/admin/posts" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 dark:bg-slate-800/60">
              {stats?.cmsOk ? 'No posts yet. Create your first post to get started.' : 'Connect Supabase to manage posts.'}
              <div className="mt-3">
                <Link href="/admin/posts/new" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                  <Plus className="h-3.5 w-3.5" /> New post
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/admin/posts/${p.id}`} className="truncate text-sm font-bold text-slate-900 hover:text-emerald-700 dark:text-white">
                      {p.title}
                    </Link>
                    <div className="text-[11px] text-slate-400">/{p.slug} · {p.views?.toLocaleString() ?? 0} views</div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Quick actions</h2>
          <div className="space-y-2.5">
            <Link href="/admin/posts/new" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Plus className="h-4 w-4" /></span>
              New post
            </Link>
            <Link href="/admin/media" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Upload className="h-4 w-4" /></span>
              Upload media
            </Link>
            <Link href="/admin/sync" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"><RefreshCw className="h-4 w-4" /></span>
              Run data sync
            </Link>
            <Link href="/admin/rates" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><Fuel className="h-4 w-4" /></span>
              Update petrol, gold & dollar rates
            </Link>
            <Link href="/admin/tools" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Eye className="h-4 w-4" /></span>
              Manage calculators (show/hide, titles, SEO)
            </Link>
            <Link href="/admin/seo" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"><FileEdit className="h-4 w-4" /></span>
              SEO health & redirects
            </Link>
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><ExternalLink className="h-4 w-4" /></span>
              View live site
            </Link>
          </div>
        </div>
      </div>

      {/* Sync summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Latest sync activity</h2>
          <Link href="/admin/sync" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
            Full logs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400">No sync activity recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {recentLogs.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs dark:bg-slate-800/60">
                {l.status === 'SUCCESS' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <span className="font-bold uppercase text-slate-700 dark:text-slate-200">{l.type}</span>
                <span className="min-w-0 flex-1 truncate text-slate-500">{l.message}</span>
                <span className="shrink-0 font-mono text-[10px] text-slate-400">{new Date(l.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
