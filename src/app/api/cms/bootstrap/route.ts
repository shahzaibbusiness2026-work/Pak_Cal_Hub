import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, SupabaseNotConfigured } from '../../../../lib/supabase/admin';

/**
 * One-time first-admin bootstrap.
 *
 * Creates the very first Supabase Auth user using the server-side service
 * key, then permanently disables itself: once any Auth user exists it
 * returns 410 and can never create another account. No secret ever leaves
 * the server; the caller only supplies the email/password they chose.
 */
export async function POST(req: NextRequest) {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    if (err instanceof SupabaseNotConfigured) {
      return NextResponse.json(
        { error: 'supabase-not-configured', message: 'Supabase is not connected on the server yet.' },
        { status: 503 }
      );
    }
    throw err;
  }

  try {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (listErr) throw listErr;
    if ((list?.total ?? 0) > 0) {
      return NextResponse.json(
        {
          error: 'already-initialized',
          message:
            'An admin account already exists. Sign in with its email, or reset its password in Supabase Dashboard → Authentication → Users.',
        },
        { status: 410 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'validation', message: 'Enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 10) {
      return NextResponse.json(
        { error: 'validation', message: 'Password must be at least 10 characters.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', created_via: 'first-run-setup' },
    });
    if (error) throw error;

    return NextResponse.json({ ok: true, email: data.user?.email || email });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'bootstrap-failed', message: err?.message || 'Could not create the admin account.' },
      { status: 500 }
    );
  }
}
