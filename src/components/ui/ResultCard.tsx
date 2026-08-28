'use client';

import React from 'react';
import { ResultItem } from '../../types/calculator';
import { Sparkles, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface ResultCardProps {
  primary: ResultItem;
  secondaries?: ResultItem[];
}

export default function ResultCard({ primary, secondaries }: ResultCardProps) {
  const isPositive = primary.color === 'success' || !primary.color;
  const isNegative = primary.color === 'error';

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-800/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-xl shadow-emerald-950/20">
      {/* Primary Result Banner */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {primary.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 backdrop-blur-xs">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Verified Calculation
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
            {primary.value}
          </span>
        </div>

        {primary.subtext && (
          <p className="mt-1.5 text-xs font-medium text-emerald-200/90">
            {primary.subtext}
          </p>
        )}
      </div>

      {/* Secondary Key Metric Cards */}
      {secondaries && secondaries.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-emerald-800/40 pt-5 sm:grid-cols-3">
          {secondaries.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white/5 p-3 backdrop-blur-xs ring-1 ring-white/10"
            >
              <div className="text-[11px] font-medium text-emerald-200/80 truncate">
                {item.label}
              </div>
              <div className="mt-1 text-sm sm:text-base font-bold text-white truncate">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
