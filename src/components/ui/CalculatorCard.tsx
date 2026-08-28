import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { CalculatorDefinition } from '../../types/calculator';

interface CalculatorCardProps {
  calc: CalculatorDefinition;
}

export default function CalculatorCard({ calc }: CalculatorCardProps) {
  return (
    <Link
      href={`/${calc.category}/${calc.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-lg hover:shadow-emerald-900/5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/10 group-hover:bg-emerald-800 group-hover:text-white transition-colors dark:bg-emerald-950/60 dark:text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </div>
          {calc.trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300">
              <TrendingUp className="h-3 w-3" />
              Popular
            </span>
          )}
        </div>

        <h3 className="mt-3.5 text-base font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
          {calc.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {calc.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-emerald-800 dark:border-slate-800 dark:text-emerald-400">
        <span>Calculate Now</span>
        <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
