'use client';

import React, { useMemo, useState } from 'react';
import { Clock, Sparkles, RefreshCw } from 'lucide-react';
import {
  getBestTimeGrid,
  YOUTUBE_NICHES,
  YOUTUBE_TIMEZONES,
} from '../../lib/calculators/creator-tools';

const CARD = 'print-hide rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const LABEL = 'text-sm font-semibold text-slate-800 dark:text-slate-200';

const SCORE_STYLES: Record<number, string> = {
  0: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
  1: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  2: 'bg-emerald-200 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-200',
  3: 'bg-emerald-600 text-white dark:bg-emerald-600',
};

export default function BestTimeToPost() {
  const [timezone, setTimezone] = useState('pkt');
  const [niche, setNiche] = useState('finance');
  const [contentType, setContentType] = useState<'longform' | 'shorts'>('longform');

  const grid = useMemo(
    () => getBestTimeGrid(timezone, niche, contentType),
    [timezone, niche, contentType]
  );
  const tzAbbr = YOUTUBE_TIMEZONES.find((t) => t.id === timezone)?.abbr || 'local';

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className={CARD}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Audience</h2>
          </div>
          <button
            onClick={() => { setTimezone('pkt'); setNiche('finance'); setContentType('longform'); }}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-xs transition hover:border-rose-600/40 hover:text-rose-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bt-tz" className={LABEL}>Audience Timezone</label>
            <select id="bt-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="form-input">
              {YOUTUBE_TIMEZONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">Where most of your viewers live — not where you live.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bt-niche" className={LABEL}>Content Niche</label>
            <select id="bt-niche" value={niche} onChange={(e) => setNiche(e.target.value)} className="form-input">
              {YOUTUBE_NICHES.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bt-type" className={LABEL}>Content Type</label>
            <select id="bt-type" value={contentType} onChange={(e) => setContentType(e.target.value as 'longform' | 'shorts')} className="form-input">
              <option value="longform">Long-form videos</option>
              <option value="shorts">YouTube Shorts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
        <Sparkles className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
        <p className="text-sm font-semibold leading-6 text-emerald-950 dark:text-emerald-100">{grid.recommendation}</p>
      </div>

      {/* Heatmap */}
      <div className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Weekly Posting Heatmap <span className="text-sm font-semibold text-slate-500">({tzAbbr})</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" /> Avoid</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-200" /> Low</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-300" /> Good</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-600" /> Best</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-5 gap-1.5 text-center">
              <div />
              {['Morning', 'Afternoon', 'Evening', 'Night'].map((h) => (
                <div key={h} className="pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</div>
              ))}
              {grid.days.map((d) => (
                <React.Fragment key={d.day}>
                  <div className="flex items-center justify-end pr-2 text-xs font-bold text-slate-700 dark:text-slate-300">{d.day}</div>
                  {d.slots.map((s, i) => (
                    <div
                      key={i}
                      title={`${d.day} ${s.label.replace('\n', ' ')}: ${s.score === 3 ? 'Best' : s.score === 2 ? 'Good' : s.score === 1 ? 'Low' : 'Avoid'}`}
                      className={`relative rounded-lg px-1 py-2.5 text-center ${SCORE_STYLES[s.score]}`}
                    >
                      <div className="text-[10px] font-bold leading-tight whitespace-pre-line">{s.label}</div>
                      {s.isBest && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-1.5 py-px text-[9px] font-black uppercase tracking-wide text-amber-950 shadow">
                          Best
                        </span>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Generic benchmarks for planning — your channel’s real peak hours live in YouTube Studio → Analytics → Audience → “When your viewers are on YouTube”. Consistency and packaging matter more than the exact hour.
        </p>
      </div>
    </div>
  );
}
