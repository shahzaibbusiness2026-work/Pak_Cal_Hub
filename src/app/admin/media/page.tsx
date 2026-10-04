'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Copy, Trash2, Check, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { cmsErrorMessage, loadSupabaseBrowser } from '../../../components/admin/cms';

interface MediaItem {
  name: string;
  url: string;
  size?: number;
  createdAt?: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Try the contract list endpoint (sibling may add GET /api/cms/upload?list=1).
      try {
        const res = await fetch('/api/cms/upload?list=1');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.files)) {
            setItems(data.files);
            return;
          }
        }
      } catch {}
      // 2) Fall back to the Supabase browser client directly (cms-media bucket).
      // TODO: backend pending — bucket 'cms-media' created by backend agent.
      const supabase = await loadSupabaseBrowser();
      if (!supabase) throw new Error('Supabase backend is not connected yet.');
      const { data, error: listError } = await supabase.storage.from('cms-media').list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      if (listError) throw listError;
      const mapped: MediaItem[] = (data || [])
        .filter((f: any) => f.name && !f.name.endsWith('/'))
        .map((f: any) => {
          const { data: pub } = supabase.storage.from('cms-media').getPublicUrl(f.name);
          return { name: f.name, url: pub.publicUrl, size: f.metadata?.size, createdAt: f.created_at };
        });
      setItems(mapped);
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setUploading(true);
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/cms/upload', { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `Upload failed for ${file.name}`);
      }
      await load();
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.name);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const deleteItem = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleting(item.name);
    try {
      // TODO: backend pending — contract has no media DELETE; using storage client directly.
      const supabase = await loadSupabaseBrowser();
      if (!supabase) throw new Error('Supabase backend is not connected yet.');
      const { error: delError } = await supabase.storage.from('cms-media').remove([item.name]);
      if (delError) throw delError;
      setItems((items) => items.filter((i) => i.name !== item.name));
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Media Library</h1>
        <p className="mt-0.5 text-sm text-slate-500">Images for posts, covers and OG cards. Stored in the <code className="font-mono">cms-media</code> bucket.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
        {uploading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
        ) : (
          <Upload className="mx-auto h-8 w-8 text-slate-400" />
        )}
        <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, WebP — used via POST /api/cms/upload</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading media">
          {[0, 1, 2, 3, 4, 5, 7].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">No media yet</p>
          <p className="mt-1 text-xs text-slate-400">Upload your first image above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 flex translate-y-2 gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2.5 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(item)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 px-2 py-1.5 text-[11px] font-bold text-slate-800 hover:bg-white"
                    aria-label={`Copy URL of ${item.name}`}
                  >
                    {copied === item.name ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === item.name ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    onClick={() => deleteItem(item)}
                    disabled={deleting === item.name}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600/90 px-2.5 py-1.5 text-white hover:bg-red-600 disabled:opacity-50"
                    aria-label={`Delete ${item.name}`}
                  >
                    {deleting === item.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="truncate px-3 py-2 font-mono text-[10px] text-slate-500">{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
