import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getPostBySlug, listPosts, incrementViews } from '../../../lib/cms/posts';
import { getSiteSettings } from '../../../lib/cms/settings';
import { buildPostMetadata, postJsonLd } from '../../../lib/cms/seo';
import type { Metadata } from 'next';

export const revalidate = 300;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://pakcalchub.com';
}

export async function generateStaticParams() {
  // Best-effort: pre-render published posts when Supabase is reachable at build time.
  try {
    const { posts } = await listPosts({ status: 'published', limit: 100 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [post, settings] = await Promise.all([getPostBySlug(params.slug), getSiteSettings()]);
  if (!post) return { title: 'Article not found | Pak Calc Hub' };
  return buildPostMetadata(post, siteUrl(), settings) as Metadata;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  // Fire-and-forget view counter — never blocks rendering.
  incrementViews(params.slug).catch(() => {});

  const { posts: related } = await listPosts({
    status: 'published',
    category: post.category,
    limit: 4,
  });
  const relatedPosts = related.filter((p) => p.slug !== post.slug).slice(0, 3);
  const jsonLd = postJsonLd(post, siteUrl());

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-emerald-800">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog" className="hover:text-emerald-800">Blog</Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-slate-900 dark:text-white">{post.category}</span>
      </nav>

      <article className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {post.category}
          </span>
          <time dateTime={post.published_at || undefined}>{formatDate(post.published_at)}</time>
          {post.reading_minutes ? <span>• {post.reading_minutes} min read</span> : null}
          {post.author_name ? <span>• By {post.author_name}</span> : null}
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        ) : null}

        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mt-8 w-full rounded-2xl border border-slate-200 object-cover dark:border-slate-800"
          />
        ) : null}

        <div className="prose prose-slate mt-8 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-emerald-700 dark:prose-a:text-emerald-400">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
      </article>

      {relatedPosts.length > 0 ? (
        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Related articles
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedPosts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {p.category}
                </p>
                <p className="mt-1 font-bold leading-snug text-slate-900 dark:text-white">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
