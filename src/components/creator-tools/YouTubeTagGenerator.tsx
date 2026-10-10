'use client';

import React, { useMemo, useState } from 'react';
import { Tags, Copy, Check, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { generateYouTubeTags } from '../../lib/calculators/creator-tools';

const CARD = 'print-hide rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const LABEL = 'text-sm font-semibold text-slate-800 dark:text-slate-200';

export default function YouTubeTagGenerator() {
  const [keyword, setKeyword] = useState('');
  const [contentType, setContentType] = useState<'video' | 'shorts'>('video');
  const [tagCount, setTagCount] = useState<10 | 15 | 20>(15);
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const result = useMemo(
    () => generateYouTubeTags(keyword, contentType, tagCount),
    [keyword, contentType, tagCount]
  );
  const overLimit = result.totalChars > 500;

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — user can select manually */
    }
  };

  const copyAll = () => {
    copyText([...result.tags, ...result.hashtags].join(', '), 'all');
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Inputs */}
        <div className={`${CARD} lg:col-span-5`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <Tags className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Video Details</h2>
            </div>
            <button
              onClick={() => { setKeyword(''); setContentType('video'); setTagCount(15); }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-xs transition hover:border-rose-600/40 hover:text-rose-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ct-keyword" className={LABEL}>Video Topic / Keyword</label>
              <input
                id="ct-keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. home workout for beginners"
                className="form-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ct-type" className={LABEL}>Content Type</label>
              <select
                id="ct-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'video' | 'shorts')}
                className="form-input"
              >
                <option value="video">Long-form video</option>
                <option value="shorts">YouTube Shorts</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ct-count" className={LABEL}>Number of Tags</label>
              <select
                id="ct-count"
                value={tagCount}
                onChange={(e) => setTagCount(Number(e.target.value) as 10 | 15 | 20)}
                className="form-input"
              >
                <option value={10}>10 tags</option>
                <option value={15}>15 tags</option>
                <option value={20}>20 tags</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 lg:col-span-7">
          <div className={CARD}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Generated Tags {result.tags.length > 0 && <span className="text-sm font-semibold text-slate-500">({result.tags.length})</span>}
              </h2>
              {result.tags.length > 0 && (
                <button
                  onClick={copyAll}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-800"
                >
                  {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedAll ? 'Copied!' : 'Copy all'}</span>
                </button>
              )}
            </div>

            {result.tags.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Enter your video topic on the left — tags appear here instantly.
              </p>
            ) : (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => copyText(tag, tag)}
                      title="Click to copy"
                      className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-600/50 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-950/40"
                    >
                      <span>{tag}</span>
                      {copied === tag ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                      )}
                    </button>
                  ))}
                </div>

                {result.hashtags.length > 0 && (
                  <>
                    <h3 className="mt-6 text-sm font-bold text-slate-900 dark:text-white">Hashtags</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.hashtags.map((h) => (
                        <button
                          key={h}
                          onClick={() => copyText(h, h)}
                          title="Click to copy"
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 transition hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
                        >
                          <span>{h}</span>
                          {copied === h ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-60" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className={`mt-5 flex items-start gap-2 rounded-xl border p-3.5 text-xs ${overLimit ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'}`}>
                  {overLimit ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
                  <span>
                    <strong>{result.totalChars} / 500 characters</strong> used of YouTube&apos;s tags limit.
                    {overLimit
                      ? ' Over the limit — remove some tags before pasting into YouTube Studio.'
                      : ' Paste the tags into the Tags box in YouTube Studio.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">Honest note: </span>
            tags are a minor ranking signal today — they help with misspellings and disambiguation. Your title, description and watch time matter far more. Spend minutes here, not hours.
          </div>
        </div>
      </div>
    </div>
  );
}
