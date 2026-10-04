import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '../../../../lib/supabase/admin';
import { requireAdmin, adminErrorResponse } from '../../../../lib/cms/auth';
import { SupabaseNotConfigured } from '../../../../lib/supabase/admin';

/**
 * Admin API speaks camelCase. The `redirects` table has no status_code
 * column yet — every redirect is served as 301; the field is accepted
 * and echoed for forward compatibility.
 */
export interface RedirectDTO {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  createdAt: string;
}

function toRedirectDTO(row: any): RedirectDTO {
  return {
    id: row.id,
    fromPath: row.from_path,
    toPath: row.to_path,
    statusCode: 301,
    createdAt: row.created_at,
  };
}

// GET /api/cms/redirects (public list)
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ redirects: [] });
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('redirects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ redirects: (data ?? []).map(toRedirectDTO) });
  } catch {
    return NextResponse.json({ redirects: [] });
  }
}

// POST /api/cms/redirects (admin) — { fromPath, toPath } (snake_case aliases accepted)
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    const body = await req.json();
    const from_path = body.fromPath ?? body.from_path;
    const to_path = body.toPath ?? body.to_path;
    if (!from_path || !to_path || !String(from_path).startsWith('/')) {
      return NextResponse.json(
        { error: 'validation', message: 'fromPath (starting with /) and toPath are required.' },
        { status: 400 }
      );
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('redirects')
      .upsert({ from_path, to_path }, { onConflict: 'from_path' })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ redirect: toRedirectDTO(data) }, { status: 201 });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'create-failed', message: err.message }, { status: 500 });
  }
}

// DELETE /api/cms/redirects?id=... (admin)
export async function DELETE(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'validation', message: 'Query param id is required.' }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('redirects').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'delete-failed', message: err.message }, { status: 500 });
  }
}
