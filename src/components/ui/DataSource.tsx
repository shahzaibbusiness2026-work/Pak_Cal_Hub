import React from 'react';
import { ShieldCheck, Calendar, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

interface DataSourceProps {
  sourceName?: string;
  sourceUrl?: string;
  notificationNo?: string;
  effectiveDate?: string;
  verifiedAt?: string;
  status?: 'PUBLISHED' | 'VERIFIED' | 'DRAFT';
}

export default function DataSource({
  sourceName = 'Official Gazette of Pakistan & Ministry of Finance',
  sourceUrl,
  notificationNo,
  effectiveDate = 'July 2026',
  verifiedAt = 'August 2026',
  status = 'PUBLISHED',
}: DataSourceProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {sourceName}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              Verified & Published
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {notificationNo && (
              <span className="flex items-center gap-1 font-mono">
                <FileText className="h-3 w-3" />
                {notificationNo}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Effective: {effectiveDate}
            </span>
            <span>Audit: {verifiedAt}</span>
          </div>
        </div>
      </div>

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 self-start sm:self-center font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 text-xs shrink-0"
        >
          <span>View Source Gazette</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
