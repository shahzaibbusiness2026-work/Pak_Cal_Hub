'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import PostEditor from '../../../../components/admin/PostEditor';
import { Post, cmsFetch, cmsErrorMessage } from '../../../../components/admin/cms';

export default function AdminEditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // TODO: backend pending — contract: GET /api/cms/posts/[id]
        const data = await cmsFetch<{ post: Post }>(`/posts/${params.id}`);
        setPost(data.post);
      } catch (err) {
        setError(cmsErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Loading post">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
        <h1 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">Couldn&apos;t load post</h1>
        <p className="mt-1 text-xs text-slate-500">{error || 'Post not found.'}</p>
        <Link href="/admin/posts" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to posts
        </Link>
      </div>
    );
  }

  return <PostEditor initialPost={post} />;
}
