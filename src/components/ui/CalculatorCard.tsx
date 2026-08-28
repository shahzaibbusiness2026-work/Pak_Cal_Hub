import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Building2,
  Receipt,
  Zap,
  Building,
  GraduationCap,
  Landmark,
  Moon,
  Briefcase,
  Car,
  DollarSign,
  Compass,
  Calculator,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { CalculatorDefinition } from '../../types/calculator';
import { CATEGORIES_DATA } from '../../lib/data/categories';

interface CalculatorCardProps {
  calc: CalculatorDefinition;
}

// Category Icon & Color Mapping
const categoryStyleMap: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  salary: {
    icon: <Building2 className="h-5 w-5" />,
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'hover:border-emerald-600/50',
  },
  tax: {
    icon: <Receipt className="h-5 w-5" />,
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'hover:border-rose-600/50',
  },
  electricity: {
    icon: <Zap className="h-5 w-5" />,
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'hover:border-amber-600/50',
  },
  property: {
    icon: <Building className="h-5 w-5" />,
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'hover:border-blue-600/50',
  },
  education: {
    icon: <GraduationCap className="h-5 w-5" />,
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'hover:border-purple-600/50',
  },
  loans: {
    icon: <Landmark className="h-5 w-5" />,
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'hover:border-indigo-600/50',
  },
  islamic: {
    icon: <Moon className="h-5 w-5" />,
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'hover:border-emerald-600/50',
  },
  business: {
    icon: <Briefcase className="h-5 w-5" />,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'hover:border-slate-600/50',
  },
  vehicles: {
    icon: <Car className="h-5 w-5" />,
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'hover:border-teal-600/50',
  },
  currency: {
    icon: <DollarSign className="h-5 w-5" />,
    bg: 'bg-green-50 dark:bg-green-950/60',
    text: 'text-green-800 dark:text-green-300',
    border: 'hover:border-green-600/50',
  },
};

export default function CalculatorCard({ calc }: CalculatorCardProps) {
  const catDef = CATEGORIES_DATA.find((c) => c.id === calc.category);
  const style = categoryStyleMap[calc.category] || {
    icon: <Calculator className="h-5 w-5" />,
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'hover:border-emerald-600/50',
  };

  return (
    <Link
      href={`/${calc.category}/${calc.slug}`}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 ${style.border}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg} ${style.text} ring-1 ring-black/5 group-hover:scale-105 transition-transform`}
          >
            {style.icon}
          </div>

          <div className="flex items-center gap-1.5">
            {catDef && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {catDef.name.split(' ')[0]}
              </span>
            )}
            {calc.trending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300">
                <TrendingUp className="h-3 w-3" />
                Popular
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-3.5 text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {calc.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {calc.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-emerald-800 dark:border-slate-800 dark:text-emerald-400">
        <span className="group-hover:underline">Open Calculator</span>
        <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
