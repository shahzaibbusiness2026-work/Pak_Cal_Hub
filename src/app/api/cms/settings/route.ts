import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings, toSettingsDTO, fromSettingsDTO } from '../../../../lib/cms/settings';
import { requireAdmin, adminErrorResponse } from '../../../../lib/cms/auth';
import { SupabaseNotConfigured } from '../../../../lib/supabase/admin';

// GET /api/cms/settings (public)
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings: toSettingsDTO(settings) });
}

// PUT /api/cms/settings (admin, partial patch)
export async function PUT(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    const patch = await req.json();
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      return NextResponse.json(
        { error: 'validation', message: 'Body must be a JSON object of key/value pairs.' },
        { status: 400 }
      );
    }
    const settings = await updateSiteSettings(fromSettingsDTO(patch));
    return NextResponse.json({ settings: toSettingsDTO(settings) });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'update-failed', message: err.message }, { status: 500 });
  }
}
