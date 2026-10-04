'use client';

import React, { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { SiteSettings, cmsFetch, cmsErrorMessage } from '../../../components/admin/cms';

const DEFAULTS: SiteSettings = {
  siteName: 'Pak Calc Hub',
  tagline: '',
  defaultMetaTitle: '',
  defaultMetaDescription: '',
  announcementText: '',
  announcementEnabled: false,
  logoUrl: '',
  socialTwitter: '',
  socialFacebook: '',
  socialInstagram: '',
  socialYoutube: '',
  footerText: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const set = (patch: Partial<SiteSettings>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    (async () => {
      try {
        // TODO: backend pending — contract: GET /api/cms/settings
        const data = await cmsFetch<{ settings: SiteSettings }>('/settings');
        if (data.settings) setForm({ ...DEFAULTS, ...data.settings });
      } catch (err) {
        setError(cmsErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // TODO: backend pending — contract: PUT /api/cms/settings
      await cmsFetch('/settings', { method: 'PUT', body: JSON.stringify(form) });
      setSavedAt(new Date().toLocaleString());
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
  const labelCls = 'mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200';

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Loading settings">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Site Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Identity, defaults and announcements for the whole website.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {savedAt && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Settings saved at {savedAt}.
        </div>
      )}

      <Section title="Site identity">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="set-name" className={labelCls}>Site name</label>
            <input id="set-name" value={form.siteName} onChange={(e) => set({ siteName: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="set-logo" className={labelCls}>Logo URL</label>
            <input id="set-logo" value={form.logoUrl || ''} onChange={(e) => set({ logoUrl: e.target.value })} placeholder="https://…" className={`${inputCls} font-mono text-xs`} />
          </div>
        </div>
        <div>
          <label htmlFor="set-tagline" className={labelCls}>Tagline</label>
          <input id="set-tagline" value={form.tagline || ''} onChange={(e) => set({ tagline: e.target.value })} placeholder="Pakistan's calculation hub" className={inputCls} />
        </div>
        <div>
          <label htmlFor="set-footer" className={labelCls}>Footer text</label>
          <textarea id="set-footer" rows={2} value={form.footerText || ''} onChange={(e) => set({ footerText: e.target.value })} className={inputCls} />
        </div>
      </Section>

      <Section title="Default SEO">
        <div>
          <label htmlFor="set-mt" className={labelCls}>Default meta title</label>
          <input id="set-mt" value={form.defaultMetaTitle || ''} onChange={(e) => set({ defaultMetaTitle: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor="set-md" className={labelCls}>Default meta description</label>
          <textarea id="set-md" rows={3} value={form.defaultMetaDescription || ''} onChange={(e) => set({ defaultMetaDescription: e.target.value })} className={inputCls} />
        </div>
      </Section>

      <Section title="Announcement bar">
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-xs text-slate-500">Shows a dismissible banner at the top of every public page when enabled.</p>
        </div>
        <div>
          <label htmlFor="set-ann" className={labelCls}>Announcement text</label>
          <input id="set-ann" value={form.announcementText || ''} onChange={(e) => set({ announcementText: e.target.value })} placeholder="e.g. New NEPRA tariff slabs are live — check your bill" className={inputCls} />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => set({ announcementEnabled: e.target.checked })} className="h-4 w-4 rounded accent-emerald-700" />
          Show announcement bar on the site
        </label>
      </Section>

      <Section title="Social links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ['socialTwitter', 'X (Twitter)'],
              ['socialFacebook', 'Facebook'],
              ['socialInstagram', 'Instagram'],
              ['socialYoutube', 'YouTube'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={`set-${key}`} className={labelCls}>{label}</label>
              <input
                id={`set-${key}`}
                value={(form[key] as string) || ''}
                onChange={(e) => set({ [key]: e.target.value } as Partial<SiteSettings>)}
                placeholder="https://…"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
