import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getCategoryById, CATEGORIES_DATA } from '../../lib/data/categories';
import CalculatorCard from '../../components/ui/CalculatorCard';
import { ChevronRight, Home, Sparkles } from 'lucide-react';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return CATEGORIES_DATA.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryById(params.category);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} Calculators | Pak Calc Hub`,
    description: category.description,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryById(params.category);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-emerald-800 flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold dark:text-white">
          {category.name}
        </span>
      </nav>

      {/* Category Header Banner */}
      <div className="rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 sm:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Pakistan Specific Calculation Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {category.name}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Available Calculators ({category.tools.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.tools.map((calc) => (
            <CalculatorCard key={calc.id} calc={calc} />
          ))}
        </div>
      </div>
    </div>
  );
}
