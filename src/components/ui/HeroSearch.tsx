'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calculator, ArrowRight, Sparkles } from 'lucide-react';
import { ALL_CALCULATORS, CATEGORIES_DATA } from '../../lib/data/categories';
import { CalculatorDefinition } from '../../types/calculator';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return ALL_CALCULATORS.filter((calc) => {
      const matchTitle = calc.title.toLowerCase().includes(q);
      const matchShort = calc.shortTitle?.toLowerCase().includes(q);
      const matchDesc = calc.description.toLowerCase().includes(q);
      const matchTags = calc.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchShort || matchDesc || matchTags;
    }).slice(0, 6);
  }, [query]);

  const handleSelect = (calc: CalculatorDefinition) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/${calc.category}/${calc.slug}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto mt-8">
      {/* Prominent Search Input Box */}
      <div className="relative flex items-center rounded-2xl border-2 border-emerald-800/20 bg-white p-2 shadow-xl shadow-emerald-950/5 dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-slate-950/50 transition-all focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-700/10 dark:focus-within:border-emerald-500">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          <Search className="h-5 w-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any calculator (e.g. Salary BPS 17, FBR Tax, Bijli Bill, Solar, Marla, MDCAT)..."
          className="w-full bg-transparent px-3.5 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mr-2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Live Suggestion Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Matching Tools ({results.length})
          </div>

          {results.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No calculators found matching &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((calc) => {
                const categoryDef = CATEGORIES_DATA.find((c) => c.id === calc.category);
                return (
                  <button
                    key={calc.id}
                    type="button"
                    onClick={() => handleSelect(calc)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900 dark:text-white dark:group-hover:text-emerald-400">
                          {calc.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {categoryDef?.name || calc.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-800 dark:text-slate-600 dark:group-hover:text-emerald-400" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
