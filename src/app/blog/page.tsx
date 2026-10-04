import { listPosts } from '../../lib/cms/posts';
import { getSiteSettings } from '../../lib/cms/settings';
import { isSupabaseConfigured } from '../../lib/supabase/admin';
import type { Metadata } from 'next';
import { canonicalUrl } from '../../lib/site';
import BlogFilter from '../../components/blog/BlogFilter';

export const revalidate = 300; // ISR: refresh the index every 5 minutes

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.blog_meta_title || 'Blog & Guides | Pak Calc Hub';
  const description =
    settings.blog_description ||
    'Guides and explainers on Pakistani salaries, taxes, electricity bills, gold rates and more.';
  const url = canonicalUrl('/blog');
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogIndexPage() {
  const configured = isSupabaseConfigured();
  const { posts } = configured
    ? await listPosts({ status: 'published', limit: 48 })
    : { posts: [] };

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
        <BlogFilter posts={posts} />
      )}
    </div>
  );
}
