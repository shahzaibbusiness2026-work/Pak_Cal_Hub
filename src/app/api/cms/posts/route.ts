import { NextRequest, NextResponse } from 'next/server';
import { listPosts, createPost, toPostDTO, fromPostDTO } from '../../../../lib/cms/posts';
import { requireAdmin, adminErrorResponse } from '../../../../lib/cms/auth';
import { SupabaseNotConfigured } from '../../../../lib/supabase/admin';

// GET /api/cms/posts?status=published&category=blog&q=...&limit=12&offset=0
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'published';
  // Non-public status filters require admin (drafts must never leak publicly)
  if (status !== 'published' && status !== 'all') {
    const check = await requireAdmin();
    if (!check.ok) {
      const { status: s, body } = adminErrorResponse(check.reason);
      return NextResponse.json(body, { status: s });
    }
  }
  const result = await listPosts({
    status,
    category: url.searchParams.get('category') || undefined,
    q: url.searchParams.get('q') || undefined,
    limit: Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 12)),
    offset: Math.max(0, Number(url.searchParams.get('offset')) || 0),
  });
  return NextResponse.json({ posts: result.posts.map(toPostDTO), total: result.total });
}

// POST /api/cms/posts (admin)
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    const data = await req.json();
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'validation', message: 'title and content are required.' },
        { status: 400 }
      );
    }
    const post = await createPost(fromPostDTO(data));
    return NextResponse.json({ post: toPostDTO(post) }, { status: 201 });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'create-failed', message: err.message }, { status: 500 });
  }
}
