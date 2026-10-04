-- ============================================================================
-- Pak_Cal_Hub CMS migration 0001
-- Tables: posts, site_settings, redirects + cms-media storage bucket + RLS
-- Idempotent: safe to run more than once (guards with IF NOT EXISTS / DO blocks)
-- Run in the Supabase SQL editor AFTER creating the project.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: auto-touch updated_at
-- ----------------------------------------------------------------------------
create or replace function public.cms_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- posts: blog / news / articles / guides (markdown content)
-- ----------------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        not null unique,
  title           text        not null,
  excerpt         text,
  content         text        not null,                       -- markdown
  cover_image_url text,
  category        text        not null default 'blog'
                    check (category in ('blog','news','article','guide')),
  tags            text[]      not null default '{}',
  status          text        not null default 'draft'
                    check (status in ('draft','published','scheduled')),
  published_at    timestamptz,
  author_name     text        not null default 'Pak Calc Hub',
  meta_title      text,
  meta_description text,
  og_image_url    text,
  canonical_url   text,
  noindex         boolean     not null default false,
  featured        boolean     not null default false,
  views           bigint      not null default 0,
  reading_minutes int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_status_published_idx
  on public.posts (status, published_at desc);
create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_category_idx on public.posts (category);

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.cms_touch_updated_at();

-- ----------------------------------------------------------------------------
-- site_settings: key/value JSON store for site-wide content & SEO defaults
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text    primary key,
  value      jsonb   not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.cms_touch_updated_at();

-- Seed defaults (insert-only; never overwrite existing rows)
insert into public.site_settings (key, value) values
  ('site_name',              to_jsonb('Pak Calc Hub'::text)),
  ('tagline',                to_jsonb('Pakistan''s Calculation Hub'::text)),
  ('default_meta_title',     to_jsonb('Pak Calc Hub — Pakistan''s Calculation Hub'::text)),
  ('default_meta_description', to_jsonb('Free, accurate calculators for Pakistan: government salaries, pensions, income tax, electricity bills, fuel costs, gold rates and more.'::text)),
  ('announcement_text',      to_jsonb(''::text)),
  ('announcement_enabled',   to_jsonb(false)),
  ('social_facebook',        to_jsonb(''::text)),
  ('social_twitter',         to_jsonb(''::text)),
  ('social_youtube',         to_jsonb(''::text)),
  ('contact_email',          to_jsonb(''::text))
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- redirects: simple path redirects managed from the admin dashboard
-- ----------------------------------------------------------------------------
create table if not exists public.redirects (
  id         uuid primary key default gen_random_uuid(),
  from_path  text not null unique,
  to_path    text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Storage bucket for CMS media (public read)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) may only READ published posts / settings / redirects.
-- All writes go through service-role API routes; authenticated users get
-- full access for the admin dashboard (service role bypasses RLS anyway).
-- ----------------------------------------------------------------------------
alter table public.posts         enable row level security;
alter table public.site_settings enable row level security;
alter table public.redirects     enable row level security;

-- posts
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "posts_authenticated_write" on public.posts;
create policy "posts_authenticated_write"
  on public.posts for all
  to authenticated
  using (true) with check (true);

-- site_settings
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_authenticated_write" on public.site_settings;
create policy "site_settings_authenticated_write"
  on public.site_settings for all
  to authenticated
  using (true) with check (true);

-- redirects
drop policy if exists "redirects_public_read" on public.redirects;
create policy "redirects_public_read"
  on public.redirects for select
  to anon, authenticated
  using (true);

drop policy if exists "redirects_authenticated_write" on public.redirects;
create policy "redirects_authenticated_write"
  on public.redirects for all
  to authenticated
  using (true) with check (true);

-- storage.objects: public read on cms-media; authenticated write
drop policy if exists "cms_media_public_read" on storage.objects;
create policy "cms_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cms-media');

drop policy if exists "cms_media_authenticated_insert" on storage.objects;
create policy "cms_media_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-media');

drop policy if exists "cms_media_authenticated_update" on storage.objects;
create policy "cms_media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-media');

drop policy if exists "cms_media_authenticated_delete" on storage.objects;
create policy "cms_media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-media');
