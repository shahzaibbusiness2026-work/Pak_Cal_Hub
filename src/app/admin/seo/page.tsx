'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Post, RedirectRule, cmsFetch, cmsErrorMessage } from '../../../components/admin/cms';

interface ChecklistRow {
  post: Post;
  issues: string[];
}

export default function AdminSeoPage() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loadingRedirects, setLoadingRedirects] = useState(true);
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [statusCode, setStatusCode] = useState<301 | 302>(301);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistRow[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  const [robots, setRobots] = useState<string | null>(null);
  const [sitemapOk, setSitemapOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // TODO: backend pending — contract: GET /api/cms/redirects
        const data = await cmsFetch<{ redirects: RedirectRule[] }>('/redirects');
        setRedirects(data.redirects || []);
      } catch (err) {
        setRedirectError(cmsErrorMessage(err));
      } finally {
        setLoadingRedirects(false);
      }
    })();
    (async () => {
      try {
        // TODO: backend pending — contract: GET /api/cms/posts
        const data = await cmsFetch<{ posts: Post[] }>('/posts?limit=500');
        const rows: ChecklistRow[] = (data.posts || [])
          .filter((p) => p.status === 'published')
          .map((post) => {
            const issues: string[] = [];
            if (!post.metaDescription?.trim() && !post.excerpt?.trim()) issues.push('Missing meta description');
            if (!post.coverImage?.trim() && !post.ogImage?.trim()) issues.push('Missing cover / OG image');
            if ((post.metaTitle || post.title).length > 60) issues.push('Meta title over 60 chars');
            if (!post.tags?.length) issues.push('No tags');
            return { post, issues };
          })
          .filter((r) => r.issues.length > 0);
        setChecklist(rows);
      } catch (err) {
        setChecklistError(cmsErrorMessage(err));
      } finally {
        setLoadingChecklist(false);
      }
    })();
    // robots.txt preview (public file; may not exist yet)
    fetch('/robots.txt')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((t) => setRobots(t))
      .catch(() => setRobots(null));
    // sitemap.xml presence check (sibling may generate it)
    fetch('/sitemap.xml', { method: 'HEAD' })
      .then((r) => setSitemapOk(r.ok))
      .catch(() => setSitemapOk(false));
  }, []);

  const addRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.startsWith('/')) {
      setRedirectError('“From” path must start with /');
      return;
    }
    setAdding(true);
    setRedirectError(null);
    try {
      // TODO: backend pending — contract: POST /api/cms/redirects
      const data = await cmsFetch<{ redirect: RedirectRule }>('/redirects', {
        method: 'POST',
        body: JSON.stringify({ fromPath, toPath, statusCode }),
      });
      setRedirects((r) => [data.redirect, ...r]);
      setFromPath('');
      setToPath('');
    } catch (err) {
      setRedirectError(cmsErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const deleteRedirect = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;
    try {
      // TODO: backend pending — contract: DELETE /api/cms/redirects
      await cmsFetch(`/redirects?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setRedirects((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setRedirectError(cmsErrorMessage(err));
    }
  };

  const inputCls =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">SEO Tools</h1>
        <p className="mt-0.5 text-sm text-slate-500">Redirects, sitemaps and per-post SEO health.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Redirects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-1 text-sm font-extrabold text-slate-900 dark:text-white">Redirects manager</h2>
          <p className="mb-4 text-[11px] text-slate-400">301/302 redirects, e.g. old slugs → new slugs.</p>
          {redirectError && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {redirectError}
            </div>
          )}
          <form onSubmit={addRedirect} className="mb-4 flex flex-wrap items-end gap-2">
            <div className="min-w-36 flex-1">
              <label htmlFor="rd-from" className="mb-1 block text-[10px] font-bold uppercase text-slate-400">From</label>
              <input id="rd-from" value={fromPath} onChange={(e) => setFromPath(e.target.value)} placeholder="/old-slug" className={`${inputCls} w-full font-mono`} required />
            </div>
            <div className="min-w-36 flex-1">
              <label htmlFor="rd-to" className="mb-1 block text-[10px] font-bold uppercase text-slate-400">To</label>
              <input id="rd-to" value={toPath} onChange={(e) => setToPath(e.target.value)} placeholder="/new-slug" className={`${inputCls} w-full font-mono`} required />
            </div>
            <select value={statusCode} onChange={(e) => setStatusCode(Number(e.target.value) as 301 | 302)} className={inputCls} aria-label="Redirect type">
              <option value={301}>301</option>
              <option value={302}>302</option>
            </select>
            <button type="submit" disabled={adding} className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add
            </button>
          </form>
          {loadingRedirects ? (
            <div className="space-y-2" aria-label="Loading redirects">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : redirects.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-800/60">No redirects yet.</p>
          ) : (
            <ul className="max-h-72 space-y-1.5 overflow-y-auto">
              {redirects.map((r) => (
                <li key={r.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-mono text-[11px] dark:bg-slate-800/60">
                  <span className="truncate text-slate-700 dark:text-slate-200">{r.fromPath}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-slate-500">{r.toPath}</span>
                  <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{r.statusCode}</span>
                  <button onClick={() => deleteRedirect(r.id)} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete redirect ${r.fromPath}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sitemap + robots */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">Sitemap</h2>
            <div className="flex items-center gap-2 text-xs">
              {sitemapOk === null ? (
                <span className="text-slate-400">Checking…</span>
              ) : sitemapOk ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">/sitemap.xml is live</span>
                  <a href="/sitemap.xml" target="_blank" className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline">
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : (
                <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                  <AlertCircle className="h-4 w-4" /> No sitemap.xml yet — generated by the backend once Supabase is connected.
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">The CMS backend regenerates the sitemap whenever a post is published, updated or deleted.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900 dark:text-white">
              <FileText className="h-4 w-4" /> robots.txt
            </h2>
            {robots ? (
              <pre className="max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-300">{robots}</pre>
            ) : (
              <p className="text-xs text-amber-600 font-semibold">No robots.txt found yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Per-post SEO checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-extrabold text-slate-900 dark:text-white">SEO health checklist</h2>
        <p className="mb-4 text-[11px] text-slate-400">Published posts missing SEO essentials.</p>
        {loadingChecklist ? (
          <div className="space-y-2" aria-label="Loading checklist">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : checklistError ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {checklistError}
          </div>
        ) : checklist.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> All published posts pass the SEO checklist.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {checklist.map(({ post, issues }) => (
              <li key={post.id} className="flex flex-wrap items-center gap-2 py-2.5">
                <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate text-xs font-bold text-slate-800 hover:text-emerald-700 dark:text-slate-100">
                  {post.title}
                </Link>
                <div className="flex flex-wrap gap-1.5">
                  {issues.map((issue) => (
                    <span key={issue} className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {issue}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
