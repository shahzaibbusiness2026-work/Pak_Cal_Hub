/**
 * CMS contract types + fetch helpers for the admin dashboard.
 *
 * Types are re-exported from the real backend DTOs in src/lib/cms/posts.ts
 * (type-only import — erased at build, no server code bundled to the client).
 * Runtime helpers (cmsFetch, slugify, …) live here.
 */

import type { PostDTO } from '@/lib/cms/posts';

export type PostStatus = 'draft' | 'published' | 'scheduled';
export type PostCategory = 'blog' | 'news' | 'article' | 'guide';

/** Admin API post shape (camelCase). */
export type Post = PostDTO;

export interface SiteSettings {
  siteName: string;
  tagline?: string | null;
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  announcementText?: string | null;
  announcementEnabled: boolean;
  logoUrl?: string | null;
  socialTwitter?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  footerText?: string | null;
  /** JSON string of tool overrides (disabled ids + title/description overrides). */
  toolOverrides?: string | null;
}

export interface RedirectRule {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  createdAt: string;
}

export class CmsApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Friendly message for 401/503 contract responses. */
export function cmsErrorMessage(err: unknown): string {
  if (err instanceof CmsApiError) {
    if (err.status === 503)
      return 'Supabase backend is not connected yet. Connect it first (see the banner above), then try again.';
    if (err.status === 401) return 'You are not signed in. Please sign in to the admin area.';
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

async function handleRes(res: Response) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CmsApiError(res.status, (data as any)?.error || `Request failed (${res.status})`);
  }
  return data;
}

/** Thin fetch wrapper over the /api/cms/* contract routes. */
export async function cmsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/cms${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  return (await handleRes(res)) as T;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function readingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Supabase browser client loader (contract: getSupabaseBrowser). */
export async function loadSupabaseBrowser(): Promise<any | null> {
  try {
    const mod = await import('@/lib/supabase/client');
    return mod.getSupabaseBrowser();
  } catch {
    return null;
  }
}
