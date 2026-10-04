import type { MetadataRoute } from 'next';

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://pakcalchub.com').replace(/\/$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
  };
}
