'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Send,
  CalendarClock,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Eye,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import {
  Post,
  PostStatus,
  PostCategory,
  cmsFetch,
  cmsErrorMessage,
  slugify,
  readingTimeMinutes,
} from './cms';

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'blog', label: 'Blog' },
  { value: 'news', label: 'News' },
  { value: 'article', label: 'Article' },
  { value: 'guide', label: 'Guide' },
];

interface Toast {
  id: number;
  kind: 'ok' | 'err';
  text: string;
}

function emptyPost(): Partial<Post> {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'blog',
    tags: [],
    author: '',
    coverImage: '',
    featured: false,
    status: 'draft',
    publishedAt: null,
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    canonicalUrl: '',
    noindex: false,
  };
}

/** Markdown preview with graceful fallback when react-markdown isn't installed. */
function MarkdownPreview({ markdown }: { markdown: string }) {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    import('react-markdown')
      .then((m) => {
        if (alive) setComp(() => m.default);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);
  if (Comp) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <Comp>{markdown || '*Nothing to preview yet.*'}</Comp>
      </div>
    );
  }
  return (
    <div>
      {failed && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Rich preview unavailable (preview library not installed) — showing raw markdown.
        </p>
      )}
      <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600 dark:text-slate-300">
        {markdown || 'Nothing to preview yet.'}
      </pre>
    </div>
  );
}

export default function PostEditor({ initialPost }: { initialPost?: Post | null }) {
  const router = useRouter();
  const isNew = !initialPost?.id;
  const [form, setForm] = useState<Partial<Post>>(initialPost ?? emptyPost());
  const [tagsText, setTagsText] = useState((initialPost?.tags || []).join(', '));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState<'cover' | 'og' | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(initialPost?.updatedAt ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<Post>) => setForm((f) => ({ ...f, ...patch }));

  const pushToast = (kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  };

  // Auto-slug from title until the user edits it manually.
  useEffect(() => {
    if (!slugTouched && form.title) set({ slug: slugify(form.title) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  useEffect(() => {
    set({ tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsText]);

  const readingMins = useMemo(() => readingTimeMinutes(form.content || ''), [form.content]);
  const metaTitle = form.metaTitle || form.title || '';
  const metaDesc = form.metaDescription || form.excerpt || '';

  const validate = (): string | null => {
    if (!form.title?.trim()) return 'Title is required.';
    if (!form.slug?.trim()) return 'Slug is required.';
    if (!/^[a-z0-9-]+$/.test(form.slug)) return 'Slug may only contain lowercase letters, numbers and hyphens.';
    if (!form.content?.trim()) return 'Content cannot be empty.';
    if (form.status === 'scheduled' && !form.publishedAt) return 'Pick a publish date/time for scheduled posts.';
    return null;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/cms/upload', { method: 'POST', body: fd });
    if (res.status === 503) throw new Error('Supabase backend is not connected yet.');
    if (res.status === 401) throw new Error('You are not signed in.');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Upload failed.');
    return data.url ?? null;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'og') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      pushToast('err', 'Please choose an image file.');
      return;
    }
    setUploading(target);
    try {
      const url = await uploadImage(file);
      if (url) {
        set(target === 'cover' ? { coverImage: url } : { ogImage: url });
        pushToast('ok', 'Image uploaded.');
      } else pushToast('err', 'Upload returned no URL.');
    } catch (err) {
      pushToast('err', cmsErrorMessage(err));
    } finally {
      setUploading(null);
    }
  };

  const save = async (status: PostStatus) => {
    const err = validate();
    if (err) {
      pushToast('err', err);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        readingTimeMinutes: readingMins,
        publishedAt:
          status === 'published'
            ? form.publishedAt || new Date().toISOString()
            : status === 'scheduled'
              ? form.publishedAt
              : form.publishedAt ?? null,
      };
      let saved: Post;
      if (isNew) {
        const data = await cmsFetch<{ post: Post }>('/posts', { method: 'POST', body: JSON.stringify(payload) });
        saved = data.post;
      } else {
        const data = await cmsFetch<{ post: Post }>(`/posts/${initialPost!.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        saved = data.post;
      }
      setLastSaved(saved.updatedAt);
      pushToast('ok', status === 'published' ? 'Post published.' : status === 'scheduled' ? 'Post scheduled.' : 'Draft saved.');
      if (isNew && saved.id) router.replace(`/admin/posts/${saved.id}`);
    } catch (err) {
      pushToast('err', cmsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialPost?.id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await cmsFetch(`/posts/${initialPost.id}`, { method: 'DELETE' });
      pushToast('ok', 'Post deleted.');
      router.push('/admin/posts');
    } catch (err) {
      pushToast('err', cmsErrorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
  const labelCls = 'mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200';

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg ${
              t.kind === 'ok' ? 'bg-emerald-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {t.kind === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {t.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700">
          <ArrowLeft className="h-3.5 w-3.5" /> All posts
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{isNew ? 'New post' : 'Edit post'}</h1>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
          {lastSaved && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Saved {new Date(lastSaved).toLocaleString()}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> ~{readingMins} min read
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label htmlFor="pe-title" className={labelCls}>Title</label>
            <input
              id="pe-title"
              value={form.title || ''}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. New NEPRA tariff slabs explained for July 2026"
              className={`${inputCls} text-base font-bold`}
            />
            <div className="mt-3 flex items-center gap-2">
              <label htmlFor="pe-slug" className="shrink-0 text-xs font-bold text-slate-500">Slug:</label>
              <input
                id="pe-slug"
                value={form.slug || ''}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: slugify(e.target.value) });
                }}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false);
                  set({ slug: slugify(form.title || '') });
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800"
                title="Regenerate from title"
              >
                <RefreshCw className="h-3 w-3" /> Auto
              </button>
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-slate-400">/{form.slug || 'your-slug'}</p>
          </div>

          {/* Content editor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Content (Markdown)</label>
              <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800" role="tablist" aria-label="Editor mode">
                {(['edit', 'preview'] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={tab === m}
                    onClick={() => setTab(m)}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold ${
                      tab === m ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white' : 'text-slate-500'
                    }`}
                  >
                    {m === 'edit' ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {m === 'edit' ? 'Write' : 'Preview'}
                  </button>
                ))}
              </div>
            </div>
            {tab === 'edit' ? (
              <textarea
                value={form.content || ''}
                onChange={(e) => set({ content: e.target.value })}
                rows={16}
                placeholder={'## Heading\n\nWrite your article in Markdown…\n\n- Use **bold** and *italic*\n- Add [links](https://example.com)'}
                className={`${inputCls} font-mono text-[13px] leading-relaxed`}
                aria-label="Post content in Markdown"
              />
            ) : (
              <div className="min-h-64 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <MarkdownPreview markdown={form.content || ''} />
              </div>
            )}
          </div>

          {/* SEO panel */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSeoOpen((o) => !o)}
              className="flex w-full items-center justify-between p-5 text-left"
              aria-expanded={seoOpen}
            >
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">SEO settings</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
            </button>
            {seoOpen && (
              <div className="space-y-4 border-t border-slate-100 p-5 dark:border-slate-800">
                {/* SERP preview */}
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Google preview</p>
                  <p className="text-sm text-[#1a0dab] dark:text-blue-300 truncate">{metaTitle || 'Your meta title'}</p>
                  <p className="truncate text-xs text-[#006621] dark:text-emerald-400">pakcalchub.com/{form.slug || 'your-slug'}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{metaDesc || 'Your meta description will appear here.'}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="pe-mt" className={labelCls}>Meta title</label>
                    <span className={`text-[11px] font-bold tabular-nums ${metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                      {metaTitle.length}/60
                    </span>
                  </div>
                  <input id="pe-mt" value={form.metaTitle || ''} onChange={(e) => set({ metaTitle: e.target.value })} placeholder="Defaults to post title" className={inputCls} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="pe-md" className={labelCls}>Meta description</label>
                    <span className={`text-[11px] font-bold tabular-nums ${metaDesc.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                      {metaDesc.length}/160
                    </span>
                  </div>
                  <textarea id="pe-md" rows={3} value={form.metaDescription || ''} onChange={(e) => set({ metaDescription: e.target.value })} placeholder="Defaults to excerpt" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>OG image</label>
                  <div className="flex gap-2">
                    <input value={form.ogImage || ''} onChange={(e) => set({ ogImage: e.target.value })} placeholder="https://… or upload" className={`${inputCls} font-mono text-xs`} />
                    <button type="button" onClick={() => ogInputRef.current?.click()} disabled={uploading === 'og'} className="shrink-0 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                      {uploading === 'og' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                    </button>
                    <input ref={ogInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'og')} aria-label="Upload OG image" />
                  </div>
                  {form.ogImage && <img src={form.ogImage} alt="OG preview" className="mt-2 h-24 rounded-lg border object-cover" />}
                </div>
                <div>
                  <label htmlFor="pe-can" className={labelCls}>Canonical URL (optional)</label>
                  <input id="pe-can" value={form.canonicalUrl || ''} onChange={(e) => set({ canonicalUrl: e.target.value })} placeholder="https://…" className={`${inputCls} font-mono text-xs`} />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <input type="checkbox" checked={!!form.noindex} onChange={(e) => set({ noindex: e.target.checked })} className="h-4 w-4 rounded accent-emerald-700" />
                  Noindex (hide from search engines)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Publish</h2>
            <div className="space-y-3.5">
              <div>
                <label htmlFor="pe-status" className={labelCls}>Status</label>
                <select id="pe-status" value={form.status} onChange={(e) => set({ status: e.target.value as PostStatus })} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label htmlFor="pe-pubdate" className={labelCls}>Publish date & time</label>
                  <input
                    id="pe-pubdate"
                    type="datetime-local"
                    value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''}
                    onChange={(e) => set({ publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className={inputCls}
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => set({ featured: e.target.checked })} className="h-4 w-4 rounded accent-emerald-700" />
                Featured post
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => save('draft')} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save draft
                </button>
                {form.status === 'scheduled' ? (
                  <button onClick={() => save('scheduled')} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">
                    <CalendarClock className="h-3.5 w-3.5" /> Schedule
                  </button>
                ) : (
                  <button onClick={() => save('published')} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                    <Send className="h-3.5 w-3.5" /> Publish
                  </button>
                )}
              </div>
              {!isNew && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50 ${
                    confirmDelete ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? 'Deleting…' : confirmDelete ? 'Click again to confirm delete' : 'Delete post'}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Details</h2>
            <div className="space-y-3.5">
              <div>
                <label htmlFor="pe-cat" className={labelCls}>Category</label>
                <select id="pe-cat" value={form.category} onChange={(e) => set({ category: e.target.value as PostCategory })} className={inputCls}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pe-tags" className={labelCls}>Tags (comma separated)</label>
                <input id="pe-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="NEPRA, tariff, 2026" className={inputCls} />
              </div>
              <div>
                <label htmlFor="pe-author" className={labelCls}>Author</label>
                <input id="pe-author" value={form.author || ''} onChange={(e) => set({ author: e.target.value })} placeholder="Author name" className={inputCls} />
              </div>
              <div>
                <label htmlFor="pe-excerpt" className={labelCls}>Excerpt</label>
                <textarea id="pe-excerpt" rows={3} value={form.excerpt || ''} onChange={(e) => set({ excerpt: e.target.value })} placeholder="Short summary shown in listings" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cover image</label>
                <div className="flex gap-2">
                  <input value={form.coverImage || ''} onChange={(e) => set({ coverImage: e.target.value })} placeholder="https://… or upload" className={`${inputCls} font-mono text-xs`} aria-label="Cover image URL" />
                  <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploading === 'cover'} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300" aria-label="Upload cover image">
                    {uploading === 'cover' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'cover')} aria-label="Upload cover image file" />
                </div>
                {form.coverImage && <img src={form.coverImage} alt="Cover preview" className="mt-2 h-28 w-full rounded-lg border object-cover" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
