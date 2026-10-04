import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { requireAdmin, adminErrorResponse } from '../../../../lib/cms/auth';
import { SupabaseNotConfigured } from '../../../../lib/supabase/admin';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'cms-media';

// POST /api/cms/upload (admin) — multipart field `file` → { url }
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'validation', message: 'Multipart field "file" is required.' },
        { status: 400 }
      );
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'validation', message: `Only image uploads are allowed (got ${file.type || 'unknown'}).` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'validation', message: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 5 MB).` },
        { status: 400 }
      );
    }

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(BUCKET).upload(name, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(name);
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'upload-failed', message: err.message }, { status: 500 });
  }
}
