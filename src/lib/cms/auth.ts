import { getSupabaseUser } from '../supabase/server';
import { isSupabaseConfigured } from '../supabase/admin';

export type AdminCheck = { ok: true; user: any } | { ok: false; reason: string };

/**
 * Admin gate for CMS API routes.
 * - Supabase unconfigured  → { ok:false, reason:'not-configured' } (routes → 503)
 * - No session             → { ok:false, reason:'unauthenticated' } (routes → 401)
 * - ADMIN_EMAILS set and user email not listed → { ok:false, reason:'forbidden' } (403)
 * - Otherwise              → { ok:true, user }
 *
 * Single-owner site: any authenticated user is treated as admin unless
 * ADMIN_EMAILS (comma-separated) restricts access.
 */
export async function requireAdmin(): Promise<AdminCheck> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'not-configured' };
  }
  const user = await getSupabaseUser();
  if (!user) {
    return { ok: false, reason: 'unauthenticated' };
  }
  const allowList = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowList.length > 0 && !allowList.includes((user.email || '').toLowerCase())) {
    return { ok: false, reason: 'forbidden' };
  }
  return { ok: true, user };
}

/** Map a requireAdmin() failure to an HTTP status + JSON body for routes. */
export function adminErrorResponse(reason: string): { status: number; body: Record<string, any> } {
  if (reason === 'not-configured') {
    return {
      status: 503,
      body: {
        error: 'supabase-not-configured',
        message:
          'CMS backend is not connected. Set NEXT_PUBLIC_SUPABASE_URL, ' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY, then run ' +
          'supabase/migrations/0001_cms.sql. See supabase/README.md.',
      },
    };
  }
  if (reason === 'unauthenticated') {
    return { status: 401, body: { error: 'unauthenticated', message: 'Sign in at /admin/login.' } };
  }
  return { status: 403, body: { error: 'forbidden', message: 'Your account is not an admin.' } };
}
