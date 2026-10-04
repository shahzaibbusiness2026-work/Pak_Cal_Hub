/**
 * Minimal Supabase Database type for the Pak_Cal_Hub CMS.
 * Covers posts / site_settings / redirects (+ storage.objects is built-in).
 */

export type PostCategory = 'blog' | 'news' | 'article' | 'guide';
export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: PostCategory;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  author_name: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  noindex: boolean;
  featured: boolean;
  views: number;
  reading_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: any;
  updated_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  created_at: string;
}

export interface SiteSettings {
  [key: string]: any;
}

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Partial<Post> & { slug: string; title: string; content: string };
        Update: Partial<Post>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: { key: string; value: any };
        Update: { value?: any };
      };
      redirects: {
        Row: Redirect;
        Insert: { from_path: string; to_path: string };
        Update: { from_path?: string; to_path?: string };
      };
    };
  };
};
