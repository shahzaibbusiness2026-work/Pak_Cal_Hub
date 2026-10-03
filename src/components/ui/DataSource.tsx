import React from 'react';
import {
  ShieldCheck,
  Calendar,
  ExternalLink,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  getToolSource,
  formatVerifiedDate,
  ToolSourceLink,
} from '../../lib/data/tool-sources';

interface DataSourceProps {
  /** Tool id (matches the id/slug in categories.ts) — sources are looked up from the registry. */
  toolId: string;
}

/**
 * Official-source banner rendered from the central registry
 * (src/lib/data/tool-sources.ts). Shows every authoritative source for the
 * tool as an outbound link, the notification reference (with a "verify" badge
 * when the reference is provisional), the effective date, and a prominent
 * "Rates verified on" line.
 */
export default function DataSource({ toolId }: DataSourceProps) {
  const entry = getToolSource(toolId);

  if (!entry) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          Official source information is being compiled for this calculator.
        </span>
      </div>
    );
  }

  const isVerified = entry.ratesStatus === 'verified';

  const renderSource = (source: ToolSourceLink, idx: number) => (
    <div key={idx} className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <span>{source.name}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="font-bold text-slate-900 dark:text-white">{source.name}</span>
      )}
      {source.description && (
        <span className="text-slate-500 dark:text-slate-400">{source.description}</span>
      )}
      {source.notificationRef && (
        <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
          <FileText className="h-3 w-3" />
          {source.notificationRef}
          {source.notificationStatus === 'verify' && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3" />
              Verify number
            </span>
          )}
        </span>
      )}
      {source.effectiveDate && (
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Calendar className="h-3 w-3" />
          Effective: {source.effectiveDate}
        </span>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isVerified
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Official Sources</span>
            {isVerified ? (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Verified & Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Provisional — verify against latest notification
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Calendar className="h-3 w-3" />
              Rates verified on {formatVerifiedDate(entry.ratesVerifiedOn)}
            </span>
          </div>

          {entry.sources.length > 0 ? (
            <div className="space-y-1.5">{entry.sources.map(renderSource)}</div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">{entry.note}</p>
          )}

          {entry.sources.length > 0 && entry.note && (
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {entry.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
