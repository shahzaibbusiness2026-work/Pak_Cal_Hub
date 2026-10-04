import { getSupabaseAdmin, isSupabaseConfigured } from '../supabase/admin';
import { getSupabasePublic } from '../supabase/server';
import type { Post } from '../supabase/types';
import { slugify, estimateReadingMinutes } from './seo';

export type { Post };

export interface ListPostsOptions {
  status?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

function rowToPost(row: any): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? null,
    content: row.content ?? '',
    cover_image_url: row.cover_image_url ?? null,
    category: row.category ?? 'blog',
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status ?? 'draft',
    published_at: row.published_at ?? null,
    author_name: row.author_name ?? 'Pak Calc Hub',
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    og_image_url: row.og_image_url ?? null,
    canonical_url: row.canonical_url ?? null,
    noindex: Boolean(row.noindex),
    featured: Boolean(row.featured),
    views: Number(row.views ?? 0),
    reading_minutes: row.reading_minutes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * List posts. Public (published) reads go through the anon-key server client
 * so RLS applies; any other status filter uses the service-role client
 * (admin API routes only). Returns empty (never throws) when unconfigured.
 */
export async function listPosts(
  opts: ListPostsOptions = {}
): Promise<{ posts: Post[]; total: number }> {
  const empty = { posts: [], total: 0 };
  const { status = 'published', category, q, limit = 12, offset = 0 } = opts;
  if (!isSupabaseConfigured()) return empty;

  try {
    const supabase =
      status === 'published' ? getSupabasePublic() : getSupabaseAdmin();

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === 'published') {
      // Belt-and-braces alongside the RLS policy (published + not future-dated)
      query = query.eq('status', 'published').lte('published_at', new Date().toISOString());
    } else if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (category) query = query.eq('category', category);
    if (q) {
      const term = q.replace(/[%_]/g, '');
      query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { posts: (data ?? []).map(rowToPost), total: count ?? 0 };
  } catch {
    return empty;
  }
}

/** Published post by slug (public). Returns null when missing/unconfigured. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .single();
    if (error || !data) return null;
    return rowToPost(data);
  } catch {
    return null;
  }
}

/** Post by id, any status (admin). Returns null when missing/unconfigured. */
export async function getPostById(id: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error || !data) return null;
    return rowToPost(data);
  } catch {
    return null;
  }
}

async function ensureUniqueSlug(supabase: any, base: string, excludeId?: string): Promise<string> {
  let candidate = base || 'post';
  let n = 0;
  for (;;) {
    let q = supabase.from('posts').select('id').eq('slug', candidate);
    if (excludeId) q = q.neq('id', excludeId);
    const { data } = await q.limit(1);
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${base}-${n + 1}`;
  }
}

/**
 * Create a post (admin). Auto-generates a unique slug from the title when
 * missing and computes reading_minutes from content.
 * @throws {SupabaseNotConfigured} when Supabase is unconfigured.
 */
export async function createPost(data: Partial<Post>): Promise<Post> {
  const supabase = getSupabaseAdmin(); // throws SupabaseNotConfigured when unconfigured
  const slug = await ensureUniqueSlug(supabase, data.slug?.trim() || slugify(data.title || 'untitled'));
  const status = data.status ?? 'draft';
  const payload: Record<string, any> = {
    slug,
    title: data.title,
    excerpt: data.excerpt ?? null,
    content: data.content ?? '',
    cover_image_url: data.cover_image_url ?? null,
    category: data.category ?? 'blog',
    tags: data.tags ?? [],
    status,
    published_at:
      data.published_at ?? (status === 'published' ? new Date().toISOString() : null),
    author_name: data.author_name ?? 'Pak Calc Hub',
    meta_title: data.meta_title ?? null,
    meta_description: data.meta_description ?? null,
    og_image_url: data.og_image_url ?? null,
    canonical_url: data.canonical_url ?? null,
    noindex: Boolean(data.noindex),
    featured: Boolean(data.featured),
    reading_minutes: estimateReadingMinutes(data.content ?? ''),
  };
  const { data: row, error } = await supabase.from('posts').insert(payload).select().single();
  if (error) throw error;
  return rowToPost(row);
}

/**
 * Update a post (admin). Recomputes reading_minutes when content changes;
 * stamps published_at when a draft is first published.
 * @throws {SupabaseNotConfigured} when Supabase is unconfigured.
 */
export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, any> = {};
  const fields = [
    'title', 'excerpt', 'content', 'cover_image_url', 'category', 'tags', 'status',
    'published_at', 'author_name', 'meta_title', 'meta_description', 'og_image_url',
    'canonical_url', 'noindex', 'featured',
  ] as const;
  for (const f of fields) {
    if (data[f] !== undefined) patch[f] = data[f];
  }
  if (data.slug) patch.slug = await ensureUniqueSlug(supabase, data.slug.trim(), id);
  if (data.content !== undefined) patch.reading_minutes = estimateReadingMinutes(data.content);
  if (data.status === 'published' && data.published_at === undefined) {
    const existing = await getPostById(id);
    if (existing && !existing.published_at) patch.published_at = new Date().toISOString();
  }
  const { data: row, error } = await supabase.from('posts').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return rowToPost(row);
}

/**
 * Delete a post (admin).
 * @throws {SupabaseNotConfigured} when Supabase is unconfigured.
 */
export async function deletePost(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

/** Fire-and-forget view counter. Never throws (no-op when unconfigured). */
export async function incrementViews(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('posts').select('views').eq('slug', slug).single();
    if (!data) return;
    await supabase
      .from('posts')
      .update({ views: Number(data.views ?? 0) + 1 })
      .eq('slug', slug);
  } catch {
    // View counting must never break page rendering.
  }
}

/* ------------------------------------------------------------------ */
/* API DTO layer (camelCase)                                           */
/*                                                                     */
/* The database speaks snake_case; the admin dashboard API contract    */
/* speaks camelCase. Server-side page code (blog) uses the DB-level    */
/* `Post` above directly; API routes translate via these helpers so    */
/* the admin UI never sees snake_case.                                 */
/* ------------------------------------------------------------------ */

export interface PostDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: 'blog' | 'news' | 'article' | 'guide';
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  author: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  featured: boolean;
  views: number;
  readingTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

/** DB row → admin API shape. */
export function toPostDTO(post: Post): PostDTO {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.cover_image_url,
    category: post.category as PostDTO['category'],
    tags: post.tags,
    status: post.status as PostDTO['status'],
    publishedAt: post.published_at,
    author: post.author_name,
    metaTitle: post.meta_title,
    metaDescription: post.meta_description,
    ogImage: post.og_image_url,
    canonicalUrl: post.canonical_url,
    noindex: post.noindex,
    featured: post.featured,
    views: post.views,
    readingTimeMinutes: post.reading_minutes,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

const DTO_TO_DB: Record<string, keyof Post> = {
  coverImage: 'cover_image_url',
  publishedAt: 'published_at',
  author: 'author_name',
  authorName: 'author_name', // alias, accepted for compatibility
  metaTitle: 'meta_title',
  metaDescription: 'meta_description',
  ogImage: 'og_image_url',
  canonicalUrl: 'canonical_url',
  noindex: 'noindex',
  featured: 'featured',
  readingTimeMinutes: 'reading_minutes',
};

/** Admin API payload (camelCase, partial) → DB-level partial Post. */
export function fromPostDTO(dto: Record<string, any>): Partial<Post> {
  // Read-only via this path (views has its own incrementer).
  const READ_ONLY = new Set(['id', 'createdAt', 'updatedAt', 'views']);
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(dto ?? {})) {
    if (READ_ONLY.has(key)) continue;
    const dbKey = DTO_TO_DB[key] ?? (key as keyof Post);
    out[dbKey] = value;
  }
  return out as Partial<Post>;
}
