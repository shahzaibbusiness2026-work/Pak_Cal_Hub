'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Post, cmsFetch, cmsErrorMessage } from '../../../components/admin/cms';

const PAGE_SIZE = 12;

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: backend pending — contract: GET /api/cms/posts
      const data = await cmsFetch<{ posts: Post[] }>('/posts?limit=500');
      setPosts(data.posts || []);
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return posts
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => (categoryFilter === 'all' ? true : p.category === categoryFilter))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [posts, query, statusFilter, categoryFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, statusFilter, categoryFilter]);

  const togglePublish = async (post: Post) => {
    setActionId(post.id);
    try {
      const next = post.status === 'published' ? 'draft' : 'published';
      await cmsFetch(`/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next, publishedAt: next === 'published' ? new Date().toISOString() : post.publishedAt }),
      });
      await load();
    } catch (err) {
      alert(cmsErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = async (post: Post) => {
    if (deleteId !== post.id) {
      setDeleteId(post.id);
      return;
    }
    setActionId(post.id);
    try {
      await cmsFetch(`/posts/${post.id}`, { method: 'DELETE' });
      setDeleteId(null);
      await load();
    } catch (err) {
      alert(cmsErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Posts & News</h1>
          <p className="mt-0.5 text-sm text-slate-500">{filtered.length} posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or slug…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            aria-label="Search posts"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          <option value="blog">Blog</option>
          <option value="news">News</option>
          <option value="article">Article</option>
          <option value="guide">Guide</option>
        </select>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="space-y-3 p-5" aria-label="Loading posts">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No posts found</p>
            <p className="mt-1 text-xs text-slate-400">Try a different search, or create a new post.</p>
            <Link href="/admin/posts/new" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">
              <Plus className="h-3.5 w-3.5" /> New post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right tabular-nums">Views</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/posts/${p.id}`} className="font-bold text-slate-900 hover:text-emerald-700 dark:text-white">
                        {p.title}
                      </Link>
                      <div className="font-mono text-[10px] text-slate-400">/{p.slug}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.status] || STATUS_STYLES.draft}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{(p.views || 0).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-400">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/posts/${p.id}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 dark:hover:bg-slate-800"
                          title="Edit"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => togglePublish(p)}
                          disabled={actionId === p.id}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 disabled:opacity-50 dark:hover:bg-slate-800"
                          title={p.status === 'published' ? 'Unpublish' : 'Publish'}
                          aria-label={`${p.status === 'published' ? 'Unpublish' : 'Publish'} ${p.title}`}
                        >
                          {actionId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => confirmDelete(p)}
                          disabled={actionId === p.id}
                          className={`rounded-lg p-2 disabled:opacity-50 ${deleteId === p.id ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800'}`}
                          title={deleteId === p.id ? 'Click again to confirm' : 'Delete'}
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">
              Page {page} of {pages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 dark:border-slate-700"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 dark:border-slate-700"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
