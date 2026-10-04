/**
 * Single source of truth for the site's public identity and base URL.
 * All canonical URLs, OpenGraph URLs, JSON-LD `url` fields, sitemap and robots
 * entries must derive from SITE_URL — never hardcode a domain in a page.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://pak-cal-hub.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'Pak Calc Hub';
export const SITE_FULL_NAME = 'Pakistan Calculator Hub';
export const SITE_TAGLINE = '100+ Free Pakistan Calculators';

/** Build an absolute canonical URL from a site-relative path. */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
