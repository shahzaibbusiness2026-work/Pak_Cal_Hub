import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getCalculatorBySlug, getCategoryById, ALL_CALCULATORS } from '../../../lib/data/categories';
import DynamicCalculator from '../../../components/calculators/DynamicCalculator';
import CalculatorCard from '../../../components/ui/CalculatorCard';
import { ChevronRight, Home, ShieldCheck, Sparkles, BookOpen, HelpCircle } from 'lucide-react';

interface CalculatorPageProps {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  return ALL_CALCULATORS.map((calc) => ({
    category: calc.category,
    slug: calc.slug,
  }));
}

export async function generateMetadata({ params }: CalculatorPageProps): Promise<Metadata> {
  const calculator = getCalculatorBySlug(params.slug);
  if (!calculator) return { title: 'Calculator Not Found' };

  return {
    title: `${calculator.metaTitle} | Pak Calc Hub`,
    description: calculator.metaDescription,
    keywords: calculator.tags,
  };
}

export default function CalculatorPage({ params }: CalculatorPageProps) {
  const calculator = getCalculatorBySlug(params.slug);
  const category = getCategoryById(params.category);

  if (!calculator || !category) notFound();

  // Related calculators in same category
  const relatedCalculators = category.tools
    .filter((t) => t.slug !== calculator.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-emerald-800 flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link href={`/${category.slug}`} className="hover:text-emerald-800">
          {category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold dark:text-white truncate">
          {calculator.shortTitle || calculator.title}
        </span>
      </nav>

      {/* Calculator Header Title Banner */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {category.name}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
            Official Pakistan Standard Formula
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
          {calculator.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {calculator.description}
        </p>
      </div>

      {/* Main Interactive Calculation Engine Workspace */}
      <DynamicCalculator slug={calculator.slug} />

      {/* Context Guide & FAQs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                How this Calculation Works
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This engine incorporates official Pakistan statutory rules, tax brackets, and regulatory guidelines. All calculations execute instantly and securely on your device without storing personal financial data.
            </p>
          </div>
        </div>

        {/* Related Tools Sidebar */}
        {relatedCalculators.length > 0 && (
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Related {category.name} Tools
            </h3>
            <div className="space-y-3">
              {relatedCalculators.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${rel.category}/${rel.slug}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-600/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-800">
                    {rel.title}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {rel.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
