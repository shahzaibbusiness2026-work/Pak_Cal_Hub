import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SupabaseNotConfigured } from './admin';

function envOrThrow(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new SupabaseNotConfigured();
  return { url, anonKey };
}

/**
 * Cookie-free anon client for PUBLIC reads (blog, settings).
 * Unlike getSupabaseServer() it never touches next/headers cookies, so it
 * is safe to call during static generation / ISR revalidation. RLS still
 * applies (anon role) — only published rows are visible.
 * @throws {SupabaseNotConfigured} when env vars are missing.
 */
export function getSupabasePublic(): SupabaseClient<any> {
  const { url, anonKey } = envOrThrow();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Supabase client for Server Components / Route Handlers.
 * Carries the user's session via cookies (anon key; RLS applies).
 * @throws {SupabaseNotConfigured} when env vars are missing.
 */
export function getSupabaseServer(): SupabaseClient<any> {
  const { url, anonKey } = envOrThrow();
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only —
          // session refresh is handled by middleware instead.
        }
      },
    },
  });
}

/** Returns the currently signed-in user, or null (never throws on missing config). */
export async function getSupabaseUser() {
  try {
    const supabase = getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
