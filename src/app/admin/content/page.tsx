'use client';

import { useCallback, useEffect, useState } from 'react';
import { LayoutTemplate, Save, Loader2, CheckCircle2, AlertCircle, Megaphone, FolderTree, Wallet } from 'lucide-react';
import { cmsFetch, cmsErrorMessage } from '../../../components/admin/cms';
import { CATEGORIES_DATA } from '../../../lib/data/categories-meta';

type ContentForm = {
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  aboutContent: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
};

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

export default function SiteContentPage() {
  const [form, setForm] = useState<ContentForm>({
    heroTitle: '',
    heroAccent: '',
    heroSubtitle: '',
    aboutContent: '',
    announcementEnabled: false,
    announcementText: '',
    announcementLink: '',
  });
  const [categories, setCategories] = useState<Record<string, { name: string; description: string }>>({});
  const [rates, setRates] = useState<Record<string, string>>({ petrol: '', diesel: '', gold24kTola: '', silverTola: '', usdPkr: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await cmsFetch<{ settings: any }>('/settings');
        const s = data.settings || {};
        setForm({
          heroTitle: s.heroTitle || '',
          heroAccent: s.heroAccent || '',
          heroSubtitle: s.heroSubtitle || '',
          aboutContent: s.aboutContent || '',
          announcementEnabled: s.announcementEnabled === true || s.announcementEnabled === 'true',
          announcementText: s.announcementText || '',
          announcementLink: s.announcementLink || '',
        });
        try {
          const co = s.categoryOverrides ? JSON.parse(s.categoryOverrides) : null;
          if (co?.categories) setCategories(co.categories);
        } catch {}
        try {
          const ro = s.rateOverrides ? JSON.parse(s.rateOverrides) : null;
          if (ro) {
            setRates({
              petrol: ro.petrol != null ? String(ro.petrol) : '',
              diesel: ro.diesel != null ? String(ro.diesel) : '',
              gold24kTola: ro.gold24kTola != null ? String(ro.gold24kTola) : '',
              silverTola: ro.silverTola != null ? String(ro.silverTola) : '',
              usdPkr: ro.usdPkr != null ? String(ro.usdPkr) : '',
            });
          }
        } catch {}
      } catch (err) {
        setError(cmsErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const cleanCategories: Record<string, { name?: string; description?: string }> = {};
      for (const [id, v] of Object.entries(categories)) {
        const entry: { name?: string; description?: string } = {};
        if (v.name.trim()) entry.name = v.name.trim();
        if (v.description.trim()) entry.description = v.description.trim();
        if (entry.name || entry.description) cleanCategories[id] = entry;
      }
      const num = (v: string) => {
        const n = parseFloat(v);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      };
      const ratePayload: Record<string, number> = {};
      for (const k of ['petrol', 'diesel', 'gold24kTola', 'silverTola', 'usdPkr'] as const) {
        const n = num(rates[k]);
        if (n != null) ratePayload[k] = n;
      }
      await cmsFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          heroTitle: form.heroTitle.trim() || null,
          heroAccent: form.heroAccent.trim() || null,
          heroSubtitle: form.heroSubtitle.trim() || null,
          aboutContent: form.aboutContent.trim() || null,
          announcementEnabled: form.announcementEnabled,
          announcementText: form.announcementText.trim() || null,
          announcementLink: form.announcementLink.trim() || null,
          categoryOverrides: JSON.stringify({ categories: cleanCategories }),
          rateOverrides: JSON.stringify(ratePayload),
        }),
      });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(cmsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [form, categories, rates]);

  const set = (patch: Partial<ContentForm>) => setForm((f) => ({ ...f, ...patch }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900 dark:text-white">
            <LayoutTemplate className="h-6 w-6 text-emerald-700" /> Site Content
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The words on your public website — homepage headline, About page, announcement bar, category names and manual rate pins. Changes go live instantly.
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Saved at {savedAt} — your public site is already updated.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Homepage headline</h2>
        <p className="mt-1 text-xs text-slate-500">Blank fields fall back to the built-in defaults.</p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-500">Headline (first part)</span>
            <input value={form.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} placeholder="Pakistan's" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-500">Headline (green accent)</span>
            <input value={form.heroAccent} onChange={(e) => set({ heroAccent: e.target.value })} placeholder="Calculation Hub" className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-bold text-slate-500">Subtitle under the headline</span>
            <textarea rows={2} value={form.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} placeholder="From BPS salary to MDCAT aggregate — 49 free calculators built only for Pakistan, updated with the latest 2026 rates." className={inputCls} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <Megaphone className="h-4 w-4 text-emerald-700" /> Announcement bar
        </h2>
        <label className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Show banner on every page</span>
          <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => set({ announcementEnabled: e.target.checked })} className="h-5 w-5 rounded accent-emerald-600" />
        </label>
        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-500">Banner text</span>
            <input value={form.announcementText} onChange={(e) => set({ announcementText: e.target.value })} placeholder="New: PTA mobile tax checker is live" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-500">Banner link (optional)</span>
            <input value={form.announcementLink} onChange={(e) => set({ announcementLink: e.target.value })} placeholder="/tax/pta-mobile-tax-calculator" className={inputCls} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <Wallet className="h-4 w-4 text-emerald-700" /> Manual rate pins
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Pin a rate and the site uses it whenever the live feed is unreachable. Fresh live quotes always win — pins are your safety net. Leave blank to clear a pin.
        </p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ['petrol', 'Petrol (Rs / litre)'],
              ['diesel', 'Diesel (Rs / litre)'],
              ['gold24kTola', 'Gold 24K (Rs / tola)'],
              ['silverTola', 'Silver (Rs / tola)'],
              ['usdPkr', 'USD to PKR'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
              <input inputMode="decimal" value={rates[key]} onChange={(e) => setRates((r) => ({ ...r, [key]: e.target.value }))} placeholder="Automatic" className={inputCls} />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <FolderTree className="h-4 w-4 text-emerald-700" /> Category names & descriptions
        </h2>
        <p className="mt-1 text-xs text-slate-500">Rename how a category appears on the homepage and its own page. Blank = built-in wording.</p>
        <div className="mt-4 space-y-3">
          {CATEGORIES_DATA.map((cat) => {
            const ov = categories[cat.id] || { name: '', description: '' };
            return (
              <div key={cat.id} className="grid gap-2 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">{cat.name} — name</span>
                  <input value={ov.name} onChange={(e) => setCategories((c) => ({ ...c, [cat.id]: { ...ov, name: e.target.value } }))} placeholder={cat.name} className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">{cat.name} — description</span>
                  <input value={ov.description} onChange={(e) => setCategories((c) => ({ ...c, [cat.id]: { ...ov, description: e.target.value } }))} placeholder={cat.description} className={inputCls} />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">About page text</h2>
        <p className="mt-1 text-xs text-slate-500">Replaces the whole About page body. Separate paragraphs with a blank line. Blank = built-in About text.</p>
        <textarea rows={10} value={form.aboutContent} onChange={(e) => set({ aboutContent: e.target.value })} placeholder="Write your About story here…" className={`${inputCls} mt-3.5 resize-y`} />
      </section>

      <button onClick={save} disabled={saving} className="btn-primary w-full disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all changes
      </button>
    </div>
  );
}
