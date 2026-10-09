'use client';

import React from 'react';
import { BreakdownRow } from '../../types/calculator';

interface BreakdownTableProps {
  rows: BreakdownRow[];
  title?: string;
}

export default function BreakdownTable({ rows, title = 'Detailed Itemized Breakdown' }: BreakdownTableProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="card-surface overflow-hidden">
      <div className="card-header">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between gap-4 px-4 sm:px-6 py-3 text-xs sm:text-sm transition-colors ${
              row.isTotal
                ? 'bg-emerald-50/70 font-bold text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300'
                : idx % 2 === 1
                  ? 'bg-slate-50/60 hover:bg-slate-100/70 dark:bg-slate-800/25 dark:hover:bg-slate-800/50'
                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="min-w-0 pr-2">
              <div className={`break-words ${row.isTotal ? 'text-emerald-950 dark:text-emerald-300 font-extrabold text-sm sm:text-base' : 'text-slate-800 dark:text-slate-200 font-semibold'}`}>
                {row.label}
              </div>
              {row.detail && (
                <div className="text-xs text-slate-500 dark:text-slate-400 break-words mt-0.5 leading-relaxed">
                  {row.detail}
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <span
                className={`font-mono font-bold tabular-nums ${
                  row.isDeduction
                    ? 'text-red-600 dark:text-red-400'
                    : row.isTotal
                    ? 'text-emerald-900 dark:text-emerald-400 text-sm sm:text-lg font-black'
                    : 'text-slate-900 dark:text-white text-xs sm:text-sm'
                }`}
              >
                {row.isDeduction ? `- ${row.amount}` : row.amount}
              </span>
              {row.percentage !== undefined && (
                <span className="block sm:inline sm:ml-2 font-mono text-xs font-normal text-slate-400">
                  ({row.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
