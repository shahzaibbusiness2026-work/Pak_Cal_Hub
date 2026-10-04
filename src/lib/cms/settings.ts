import { getSupabaseAdmin, isSupabaseConfigured } from '../supabase/admin';
import { getSupabaseServer } from '../supabase/server';

/**
 * All site settings as a plain key/value record (public read via RLS).
 * Returns {} when Supabase is unconfigured — callers merge over defaults.
 */
export async function getSiteSettings(): Promise<Record<string, any>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from('site_settings').select('key,value');
    if (error || !data) return {};
    const out: Record<string, any> = {};
    for (const row of data) out[row.key] = row.value;
    return out;
  } catch {
    return {};
  }
}

/**
 * Partial patch of site settings (admin). Upserts each key.
 * @throws {SupabaseNotConfigured} when Supabase is unconfigured.
 */
export async function updateSiteSettings(
  patch: Record<string, any>
): Promise<Record<string, any>> {
  const supabase = getSupabaseAdmin(); // throws SupabaseNotConfigured when unconfigured
  const rows = Object.entries(patch).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return getSiteSettings();
  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
  return getSiteSettings();
}

/* ------------------------------------------------------------------ */
/* Settings DTO layer (camelCase keys for the admin API)               */
/*                                                                     */
/* The DB stores snake_case keys; the admin dashboard contract uses    */
/* camelCase. Server-side readers (blog, layout) use the raw           */
/* snake_case record from getSiteSettings() directly.                  */
/* ------------------------------------------------------------------ */

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

/** DB record (snake_case keys) → admin API shape (camelCase keys). */
export function toSettingsDTO(record: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(record ?? {})) out[snakeToCamel(key)] = value;
  return out;
}

/** Admin API patch (camelCase keys) → DB shape (snake_case keys). */
export function fromSettingsDTO(record: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(record ?? {})) out[camelToSnake(key)] = value;
  return out;
}
