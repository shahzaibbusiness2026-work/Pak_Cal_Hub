import Link from 'next/link';
import { listPosts } from '../../lib/cms/posts';
import { getSiteSettings } from '../../lib/cms/settings';
import { isSupabaseConfigured } from '../../lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 300; // refresh the index every 5 minutes

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'blog', label: 'Blog' },
  { value: 'news', label: 'News' },
  { value: 'article', label: 'Articles' },
  { value: 'guide', label: 'Guides' },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.blog_meta_title || 'Blog & Guides | Pak Calc Hub',
    description:
      settings.blog_description ||
      'Guides and explainers on Pakistani salaries, taxes, electricity bills, gold rates and more.',
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q || '';
  const category = searchParams.category || '';
  const configured = isSupabaseConfigured();
  const { posts, total } = configured
    ? await listPosts({ status: 'published', category: category || undefined, q: q || undefined, limit: 24 })
    : { posts: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Blog &amp; Guides
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Plain-language explainers on Pakistani salaries, pensions, taxes, electricity
          bills, gold rates and more.
        </p>
      </div>

      {!configured ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Blog coming soon</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Our guides are being prepared. Check back shortly.
          </p>
        </div>
      ) : (
        <>
          <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search articles…"
              aria-label="Search articles"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-800"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              const href = `/blog${c.value || q ? `?${new URLSearchParams({ ...(c.value ? { category: c.value } : {}), ...(q ? { q } : {}) })}` : ''}`;
              return (
                <Link
                  key={c.label}
                  href={href}
                  aria-current={active ? 'true' : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>

          {posts.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="font-semibold text-slate-900 dark:text-white">No articles found</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Try a different search or category.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {total} article{total === 1 ? '' : 's'}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                      />
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
      )}
    </div>
  );
}
