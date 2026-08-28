'use client';

import React from 'react';
import { ResultItem } from '../../types/calculator';
import { Sparkles } from 'lucide-react';

interface ResultCardProps {
  primary: ResultItem;
  secondaries?: ResultItem[];
}

export default function ResultCard({ primary, secondaries }: ResultCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/20">
      {/* Primary Result Banner */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {primary.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-xs">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Verified Calculation
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-mono font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl text-white drop-shadow-xs break-words max-w-full tabular-nums">
            {primary.value}
          </span>
        </div>

        {primary.subtext && (
          <p className="mt-2 text-xs sm:text-sm font-medium text-emerald-200/90 leading-relaxed break-words">
            {primary.subtext}
          </p>
        )}
      </div>

      {/* Secondary Key Metric Cards */}
      {secondaries && secondaries.length > 0 && (
        <div className="mt-6 sm:mt-7 grid grid-cols-2 gap-2.5 sm:gap-3.5 border-t border-emerald-800/40 pt-5 sm:pt-6 sm:grid-cols-3">
          {secondaries.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white/5 p-3 sm:p-3.5 backdrop-blur-xs ring-1 ring-white/10 flex flex-col justify-between"
            >
              <div className="text-[11px] sm:text-xs font-semibold text-emerald-200/80 leading-tight">
                {item.label}
              </div>
              <div className="mt-1.5 font-mono font-bold text-sm sm:text-lg text-white break-words tabular-nums">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
