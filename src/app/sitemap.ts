import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { CATEGORIES_DATA, ALL_CALCULATORS } from '../lib/data/categories-meta';
import { listPosts } from '../lib/cms/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // SEO landing pages (top-level calculator pages)
  const landingSlugs = [
    'government-salary-calculator-2026',
    'punjab-government-salary-calculator',
    'sindh-government-salary-calculator',
    'pension-calculator-pakistan',
    'electricity-bill-calculator-lesco',
    'fuel-cost-calculator-pakistan',
    'gold-rate-calculator-pakistan',
  ];
  for (const slug of landingSlugs) {
    staticPages.push({ url: `${base}/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
  }

  // Category + calculator pages
  for (const cat of CATEGORIES_DATA) {
    staticPages.push({
      url: `${base}/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }
  for (const calc of ALL_CALCULATORS) {
    staticPages.push({
      url: `${base}/${calc.category}/${calc.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Published CMS posts (best-effort; empty when Supabase is unconnected)
  try {
    const { posts } = await listPosts({ status: 'published', limit: 500 });
    for (const post of posts) {
      staticPages.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch {
    // Supabase unconfigured — sitemap still serves without post URLs.
  }

  return staticPages;
}
