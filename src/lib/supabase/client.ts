'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseNotConfigured } from './admin';

let browserClient: SupabaseClient<any> | null = null;

/**
 * Browser-side Supabase client (singleton). Used by the admin login page.
 * @throws {SupabaseNotConfigured} when env vars are missing — callers must catch
 * and show a setup hint instead of crashing.
 */
export function getSupabaseBrowser(): SupabaseClient<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new SupabaseNotConfigured();
  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}
