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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
              row.isTotal
                ? 'bg-emerald-50/60 font-bold text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="min-w-0 pr-2">
              <div className={`font-medium break-words ${row.isTotal ? 'text-emerald-900 dark:text-emerald-300 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                {row.label}
              </div>
              {row.detail && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 break-words mt-0.5">
                  {row.detail}
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <span
                className={`font-semibold ${
                  row.isDeduction
                    ? 'text-red-600 dark:text-red-400'
                    : row.isTotal
                    ? 'text-emerald-900 dark:text-emerald-400 text-sm sm:text-base font-bold'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {row.isDeduction ? `- ${row.amount}` : row.amount}
              </span>
              {row.percentage !== undefined && (
                <span className="block sm:inline sm:ml-2 text-[10px] sm:text-xs font-normal text-slate-400">
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
