'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calculator, ArrowRight, X, Sparkles } from 'lucide-react';
import { ALL_CALCULATORS, CATEGORIES_DATA } from '../../lib/data/categories';
import { CalculatorDefinition } from '../../types/calculator';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return ALL_CALCULATORS.filter((c) => c.featured || c.trending).slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return ALL_CALCULATORS.filter((calc) => {
      const matchTitle = calc.title.toLowerCase().includes(q);
      const matchShort = calc.shortTitle?.toLowerCase().includes(q);
      const matchDesc = calc.description.toLowerCase().includes(q);
      const matchTags = calc.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchShort || matchDesc || matchTags;
    }).slice(0, 10);
  }, [query]);

  if (!open) return null;

  const handleSelect = (calc: CalculatorDefinition) => {
    onClose();
    router.push(`/${calc.category}/${calc.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 pt-16 backdrop-blur-sm sm:p-6 sm:pt-20">
      <div
        className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 transition-all dark:bg-slate-900 dark:ring-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
          <input
            type="text"
            className="h-14 w-full bg-transparent px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            placeholder="Search Pakistan calculators (e.g. BPS 17, FBR Tax, Solar, Marla, MDCAT, Zakat)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {query.trim() ? `Found ${results.length} Calculators` : 'Popular & Trending Calculators'}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Calculator className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No calculators found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching &lsquo;salary&rsquo;, &lsquo;tax&rsquo;, &lsquo;solar&rsquo;, &lsquo;marla&rsquo; or &lsquo;gold&rsquo;.</p>
            </div>
          ) : (
            <div className="mt-1 space-y-1">
              {results.map((calc) => {
                const categoryDef = CATEGORIES_DATA.find((c) => c.id === calc.category);
                return (
                  <button
                    key={calc.id}
                    onClick={() => handleSelect(calc)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900 dark:text-white dark:group-hover:text-emerald-400">
                            {calc.title}
                          </span>
                          {calc.trending && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Trending
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                          {calc.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {categoryDef?.name || calc.category}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-700 dark:text-slate-600 dark:group-hover:text-emerald-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
          <span>Tip: Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 dark:bg-slate-800 dark:border-slate-700">ESC</kbd> to exit</span>
          <span className="font-medium text-emerald-800 dark:text-emerald-400">Pakistan Calculator Hub</span>
        </div>
      </div>
    </div>
  );
}
