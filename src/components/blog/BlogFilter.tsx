'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  cover_image_url: string | null;
  published_at: string | null;
  reading_minutes: number | null;
}

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Salary', value: 'salary' },
  { label: 'Tax', value: 'tax' },
  { label: 'Electricity', value: 'electricity' },
  { label: 'Guides', value: 'guides' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (category && p.category !== category) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        (p.excerpt || '').toLowerCase().includes(needle)
      );
    });
  }, [posts, q, category]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => {
          const active = category === c.value;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setCategory(c.value)}
              aria-pressed={active}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold text-slate-900 dark:text-white">No articles found</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Try a different search or category.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {filtered.length} article{filtered.length === 1 ? '' : 's'}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {post.cover_image_url ? (
                  <div className="relative h-44 w-full">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950/40 dark:to-slate-900">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {post.category}
                    </span>
                    <span aria-hidden="true">•</span>
                    <time>{formatDate(post.published_at)}</time>
                    {post.reading_minutes ? (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>{post.reading_minutes} min read</span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-auto pt-4 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Read article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
