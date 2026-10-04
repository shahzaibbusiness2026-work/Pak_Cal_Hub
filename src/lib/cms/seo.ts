import type { Post } from '../supabase/types';

/** URL-friendly slug from a title. "Hello, World!" -> "hello-world" */
export function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

/** Estimate reading minutes from markdown content (200 wpm, min 1). */
export function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, '');
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Next.js Metadata-compatible object for a post.
 * Falls back to site defaults for any missing SEO field.
 */
export function buildPostMetadata(
  post: Post,
  siteUrl: string,
  defaults: Record<string, any>
): Record<string, any> {
  const title = post.meta_title || post.title;
  const description =
    post.meta_description || post.excerpt || defaults.default_meta_description || '';
  const url = absoluteUrl(siteUrl, `/blog/${post.slug}`);
  const image = post.og_image_url || post.cover_image_url || undefined;
  const canonical = post.canonical_url || url;

  const metadata: Record<string, any> = {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: defaults.site_name || 'Pak Calc Hub',
      ...(image ? { images: [{ url: absoluteUrl(siteUrl, image) }] } : {}),
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.author_name ? { authors: [post.author_name] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [absoluteUrl(siteUrl, image)] } : {}),
    },
  };

  if (post.noindex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

/** JSON-LD Article schema for a post. */
export function postJsonLd(post: Post, siteUrl: string): Record<string, any> {
  const url = absoluteUrl(siteUrl, `/blog/${post.slug}`);
  const image = post.og_image_url || post.cover_image_url;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(image ? { image: [absoluteUrl(siteUrl, image)] } : {}),
    author: { '@type': 'Organization', name: post.author_name || 'Pak Calc Hub' },
    publisher: {
      '@type': 'Organization',
      name: 'Pak Calc Hub',
      url: siteUrl.replace(/\/$/, ''),
    },
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    dateModified: post.updated_at,
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
  };
}
