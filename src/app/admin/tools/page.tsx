'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Save, Loader2, AlertCircle, CheckCircle2, Search, ExternalLink, Wrench } from 'lucide-react';
import { cmsFetch, cmsErrorMessage, SiteSettings } from '../../../components/admin/cms';
import { ALL_CALCULATORS, CATEGORIES_DATA } from '../../../lib/data/categories-meta';
import { parseToolOverrides, ToolOverrides } from '../../../lib/cms/overrides';

const catName = (id: string) => CATEGORIES_DATA.find((c) => c.id === id)?.name || id;

export default function AdminToolsPage() {
  const [overrides, setOverrides] = useState<ToolOverrides>({ disabled: [], titles: {} });
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await cmsFetch<{ settings: SiteSettings }>('/settings');
        setOverrides(parseToolOverrides(data.settings as any));
      } catch (err) {
        setError(cmsErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CALCULATORS.filter(
      (t) =>
        (cat === 'all' || t.category === cat) &&
        (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    );
  }, [query, cat]);

  const toggleDisabled = (id: string) =>
    setOverrides((o) => ({
      ...o,
      disabled: o.disabled.includes(id) ? o.disabled.filter((d) => d !== id) : [...o.disabled, id],
    }));

  const setTitle = (id: string, patch: { title?: string; description?: string; metaTitle?: string; metaDescription?: string }) =>
    setOverrides((o) => ({ ...o, titles: { ...o.titles, [id]: { ...o.titles[id], ...patch } } }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const clean: ToolOverrides = {
        disabled: overrides.disabled,
        titles: Object.fromEntries(
          Object.entries(overrides.titles).filter(
            ([, v]) => (v.title && v.title.trim()) || (v.description && v.description.trim()) || (v.metaTitle && v.metaTitle.trim()) || (v.metaDescription && v.metaDescription.trim())
          )
        ),
      };
      await cmsFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ toolOverrides: JSON.stringify(clean) }),
      });
      setSavedAt(new Date().toLocaleString());
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
            <Wrench className="h-5 w-5 text-emerald-700" /> Tool Manager
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Control all {ALL_CALCULATORS.length} calculators without touching code: hide a tool, or change the title and
            description visitors see. Calculation formulas always stay code-verified — only labels change here.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Saved at {savedAt}. Changes appear on the public site within a minute.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className={`${inputCls} pl-9`}
          />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="all">All categories ({ALL_CALCULATORS.length})</option>
          {CATEGORIES_DATA.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.tools.length})
            </option>
          ))}
        </select>
        <span className="text-xs font-semibold text-slate-500">
          {overrides.disabled.length} hidden · {Object.keys(overrides.titles).length} edited
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => (<div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />))}</div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tool) => {
            const disabled = overrides.disabled.includes(tool.id);
            const ov = overrides.titles[tool.id] || {};
            return (
              <article
                key={tool.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${
                  disabled ? 'border-amber-300 dark:border-amber-800' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{tool.title}</h2>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {catName(tool.category)}
                    </span>
                    {disabled && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${tool.category}/${tool.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={!disabled}
                        onChange={() => toggleDisabled(tool.id)}
                        className="h-4 w-4 accent-emerald-700"
                      />
                      Visible
                    </label>
                  </div>
                </div>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-500">Public title override</span>
                    <input
                      value={ov.title || ''}
                      onChange={(e) => setTitle(tool.id, { title: e.target.value })}
                      placeholder={tool.title}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-500">Public description override</span>
                    <input
                      value={ov.description || ''}
                      onChange={(e) => setTitle(tool.id, { description: e.target.value })}
                      placeholder={tool.description}
                      className={inputCls}
                    />
                  </label>
                </div>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-500">Google title (SEO) — blank = default</span>
                    <input
                      value={ov.metaTitle || ''}
                      onChange={(e) => setTitle(tool.id, { metaTitle: e.target.value })}
                      placeholder={tool.metaTitle}
                      className={inputCls}
                    />
                    <span className={`mt-1 block text-[10px] font-semibold ${(ov.metaTitle || tool.metaTitle).length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                      {(ov.metaTitle || tool.metaTitle).length}/60 characters
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-500">Google description (SEO) — blank = default</span>
                    <input
                      value={ov.metaDescription || ''}
                      onChange={(e) => setTitle(tool.id, { metaDescription: e.target.value })}
                      placeholder={tool.metaDescription}
                      className={inputCls}
                    />
                    <span className={`mt-1 block text-[10px] font-semibold ${(ov.metaDescription || tool.metaDescription).length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                      {(ov.metaDescription || tool.metaDescription).length}/160 characters
                    </span>
                  </label>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No tools match your search.</p>}
        </div>
      )}
    </div>
  );
}
