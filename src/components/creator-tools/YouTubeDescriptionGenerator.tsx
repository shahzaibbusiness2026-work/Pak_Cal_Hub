'use client';

import React, { useMemo, useState } from 'react';
import { FileText, Copy, Check, RefreshCw } from 'lucide-react';
import {
  buildYouTubeDescription,
  DescriptionOptions,
} from '../../lib/calculators/creator-tools';

const CARD = 'print-hide rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const LABEL = 'text-sm font-semibold text-slate-800 dark:text-slate-200';

export default function YouTubeDescriptionGenerator() {
  const [videoTitle, setVideoTitle] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tone, setTone] = useState<DescriptionOptions['tone']>('friendly');
  const [includeChapters, setIncludeChapters] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [cta, setCta] = useState<DescriptionOptions['cta']>('subscribe');
  const [copied, setCopied] = useState(false);

  const description = useMemo(
    () =>
      buildYouTubeDescription({
        title: videoTitle,
        keyword: mainKeyword,
        keyPoints: keyPoints.split('\n'),
        tone,
        includeChapters,
        includeHashtags,
        cta,
      }),
    [videoTitle, mainKeyword, keyPoints, tone, includeChapters, includeHashtags, cta]
  );

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const toggleRow = (
    id: string,
    label: string,
    checked: boolean,
    onChange: (v: boolean) => void
  ) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
      <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1 pr-4">
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? 'bg-rose-700' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Inputs */}
        <div className={`${CARD} lg:col-span-5`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Video Details</h2>
            </div>
            <button
              onClick={() => {
                setVideoTitle(''); setMainKeyword(''); setKeyPoints('');
                setTone('friendly'); setIncludeChapters(true); setIncludeHashtags(true); setCta('subscribe');
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-xs transition hover:border-rose-600/40 hover:text-rose-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-title" className={LABEL}>Video Title</label>
              <input
                id="cd-title"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. 10 Home Workout Mistakes Beginners Make"
                className="form-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-keyword" className={LABEL}>Main Keyword</label>
              <input
                id="cd-keyword"
                type="text"
                value={mainKeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
                placeholder="e.g. home workout"
                className="form-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-points" className={LABEL}>Key Points (one per line)</label>
              <textarea
                id="cd-points"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder={'e.g.\nSkipping warm-up\nBad form on squats\nNo rest days'}
                rows={5}
                className="form-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-tone" className={LABEL}>Tone</label>
              <select id="cd-tone" value={tone} onChange={(e) => setTone(e.target.value as DescriptionOptions['tone'])} className="form-input">
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="exciting">Exciting</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-cta" className={LABEL}>Call to Action</label>
              <select id="cd-cta" value={cta} onChange={(e) => setCta(e.target.value as DescriptionOptions['cta'])} className="form-input">
                <option value="subscribe">Ask for subscribe</option>
                <option value="comment">Ask for comments</option>
                <option value="link">Link / resources</option>
              </select>
            </div>
            {toggleRow('cd-chapters', 'Include chapter timestamps', includeChapters, setIncludeChapters)}
            {toggleRow('cd-hashtags', 'Include hashtags', includeHashtags, setIncludeHashtags)}
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7">
          <div className={CARD}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Generated Description</h2>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-800"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy description'}</span>
              </button>
            </div>
            <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-sans text-[13px] leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
              {description}
            </pre>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Tip: personalize the hook and key points in your own words — the first two lines are what viewers see in search results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
