# Supabase backend — CMS setup

This folder holds the Supabase layer for the Pak_Cal_Hub CMS
(blog / news / articles / guides, site settings, redirects, media storage).
The existing Prisma/PostgreSQL layer (market rates, salary, tax, electricity)
is untouched — Supabase is used for **Auth, Storage, and the CMS**.

## 1. Create the project

1. Go to https://supabase.com/dashboard → **New project**.
2. Pick a region close to your users (e.g. Singapore / Mumbai for Pakistan).
3. Save the **project URL** and the **anon public key** (Project Settings → API).
4. Save the **service_role key** (same page — keep it secret, server-side only).

## 2. Run the SQL

In the Supabase dashboard open the **SQL editor** and run, in order:

1. `supabase/migrations/0001_cms.sql` — creates `posts`, `site_settings`,
   `redirects`, the `cms-media` storage bucket, RLS policies and triggers.
2. `supabase/seed.sql` — inserts 3 sample published posts and default
   site settings. Safe to re-run (insert-only).

The migration is idempotent — running it twice is harmless.

## 3. Environment variables

Add to `.env.local` (and to Vercel → Project Settings → Environment Variables):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-public-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"   # server only, never NEXT_PUBLIC_!

# Comma-separated owner emails allowed into /admin (optional but recommended)
ADMIN_EMAILS="you@example.com"
```

Without these vars the app still builds and runs: CMS API routes return
`503 { error: "supabase-not-configured" }` and the blog page shows a
"coming soon" state. Nothing crashes.

## 4. Create the admin user

1. Supabase dashboard → **Authentication → Users → Add user** (email + password).
2. Use an email listed in `ADMIN_EMAILS`.
3. Sign in at `/admin/login` with those credentials.

Session cookies are managed by `@supabase/ssr`; `/admin/*` (except `/admin/login`)
is protected by `middleware.ts`.

## 5. Storage

The `cms-media` bucket is created public by the migration. The admin dashboard
uploads cover images there via `POST /api/cms/upload` (images only, ≤ 5 MB,
unique filenames). If uploads fail with an RLS error, re-run the storage
policy section of the migration.

## 6. Useful SQL

```sql
-- Publish / unpublish a post
update posts set status = 'published', published_at = now() where slug = 'my-slug';

-- Reset a setting
update site_settings set value = to_jsonb('New value'::text) where key = 'announcement_text';

-- Recent view counts
select slug, title, views from posts order by views desc limit 20;
```
