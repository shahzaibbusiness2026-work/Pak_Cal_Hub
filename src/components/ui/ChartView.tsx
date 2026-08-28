'use client';

import React from 'react';
import { ChartDataPoint } from '../../types/calculator';

interface ChartViewProps {
  data: ChartDataPoint[];
  title?: string;
}

export default function ChartView({ data, title = 'Visual Distribution' }: ChartViewProps) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        {title}
      </h3>

      {/* Distribution Progress Bars */}
      <div className="space-y-3.5">
        {/* Multi-segment stacked bar */}
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          {data.map((item, idx) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={idx}
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#16a34a',
                }}
                className="transition-all duration-500 hover:opacity-90"
                title={`${item.name}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {data.map((item, idx) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || '#16a34a' }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white ml-2">
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
