import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseNotConfigured extends Error {
  constructor() {
    super(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY. ' +
        'See supabase/README.md for setup steps.'
    );
    this.name = 'SupabaseNotConfigured';
  }
}

/** True only when all three Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Service-role client — SERVER ONLY. Bypasses RLS.
 * Never import this from client components; it holds the secret key.
 * Typed as SupabaseClient<any> per the CMS contract; see ./types.ts Database
 * for the table shapes used with explicit casts where needed.
 * @throws {SupabaseNotConfigured} when env vars are missing.
 */
export function getSupabaseAdmin(): SupabaseClient<any> {
  if (!isSupabaseConfigured()) throw new SupabaseNotConfigured();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
