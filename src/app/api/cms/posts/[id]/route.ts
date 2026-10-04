import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost, toPostDTO, fromPostDTO } from '../../../../../lib/cms/posts';
import { requireAdmin, adminErrorResponse } from '../../../../../lib/cms/auth';
import { SupabaseNotConfigured } from '../../../../../lib/supabase/admin';

// GET /api/cms/posts/[id] — admin sees any status; public sees published only
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdmin();
  const post = await getPostById(params.id);
  if (!post) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  if (!check.ok) {
    const isPublic =
      post.status === 'published' &&
      post.published_at !== null &&
      new Date(post.published_at).getTime() <= Date.now();
    if (!isPublic) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }
  return NextResponse.json({ post: toPostDTO(post) });
}

// PATCH /api/cms/posts/[id] (admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    const data = await req.json();
    const post = await updatePost(params.id, fromPostDTO(data));
    return NextResponse.json({ post: toPostDTO(post) });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'update-failed', message: err.message }, { status: 500 });
  }
}

// DELETE /api/cms/posts/[id] (admin)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdmin();
  if (!check.ok) {
    const { status, body } = adminErrorResponse(check.reason);
    return NextResponse.json(body, { status });
  }
  try {
    await deletePost(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof SupabaseNotConfigured) {
      const { status, body } = adminErrorResponse('not-configured');
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: 'delete-failed', message: err.message }, { status: 500 });
  }
}
