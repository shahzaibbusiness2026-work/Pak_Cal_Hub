import React from 'react';
import Link from 'next/link';
import {
  Calculator,
  Sparkles,
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
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CATEGORIES_DATA, ALL_CALCULATORS } from '../lib/data/categories';
import CalculatorCard from '../components/ui/CalculatorCard';
import HeroSearch from '../components/ui/HeroSearch';
import ArticlesSection from '../components/ui/ArticlesSection';
import NewsletterSection from '../components/ui/NewsletterSection';

// Category Icon Mapping helper
const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-6 w-6" />,
  Receipt: <Receipt className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Building: <Building className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  Landmark: <Landmark className="h-6 w-6" />,
  Moon: <Moon className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  Car: <Car className="h-6 w-6" />,
  DollarSign: <DollarSign className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Calendar: <Calendar className="h-6 w-6" />,
  Compass: <Compass className="h-6 w-6" />,
};

export default function HomePage() {
  const trendingTools = ALL_CALCULATORS.filter((c) => c.trending || c.featured);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section: Clean Modern CSS Emerald Gradient Background */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 transition-colors">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-100/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 backdrop-blur-xs dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400" />
            <span>Updated for 2026: FBR Tax Slabs, NEPRA Tariffs & BPS Pay Scales</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Pakistan Calculator{' '}
            <span className="bg-gradient-to-r from-emerald-800 to-emerald-950 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-200">
              Hub
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            The authoritative financial, governmental, and daily calculation engine built specifically for Pakistan. Fast, precise, and completely free.
          </p>

          {/* Prominent Hero Search Bar */}
          <HeroSearch />

          {/* Quick Search Jump Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Popular:</span>
            {[
              { label: 'BPS Salary 2026', href: '/salary/bps-salary-calculator' },
              { label: 'FBR Income Tax', href: '/tax/income-tax-calculator' },
              { label: 'Electricity Bill', href: '/electricity/electricity-bill-calculator' },
              { label: 'Solar Sizing & ROI', href: '/electricity/solar-system-calculator' },
              { label: 'Marla to Sq Ft', href: '/property/property-area-converter' },
              { label: 'MDCAT Aggregate', href: '/education/university-merit-calculator' },
              { label: 'Zakat & Nisab', href: '/islamic/zakat-calculator' },
              { label: 'Freelancer 1% Tax', href: '/tax/freelancer-tax-calculator' },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-600 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-emerald-400 transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Tools Section: Trending & Essential Tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Trending & Essential Calculators
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Most used tools by professionals, students, and citizens in Pakistan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingTools.slice(0, 8).map((calc) => (
            <CalculatorCard key={calc.id} calc={calc} />
          ))}
        </div>
      </section>

      {/* 3. Tools Section: All 13 Categories Exploration Grid */}
      <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Explore All 13 Categories
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Over 100+ precision calculation engines across government, tax, property, and finance
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES_DATA.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/10 group-hover:bg-emerald-800 group-hover:text-white transition-colors dark:bg-emerald-950/60 dark:text-emerald-300">
                    {iconMap[cat.icon] || <Calculator className="h-6 w-6" />}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {cat.tools.length} Tools
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
                  {index + 1}. {cat.name}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {cat.shortDesc}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-emerald-800 dark:border-slate-800 dark:text-emerald-400">
                <span>Browse {cat.name}</span>
                <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trust & Official Standards Assurance */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-12 text-white shadow-2xl dark:border dark:border-slate-800">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Pakistani Verified Calculations</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Engineered to Official Pakistan Government & Financial Standards
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Every single formula on Pak Calc Hub is modeled against official notifications, gazettes, and standards:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Federal & Provincial BPS 2022 Pay Scales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>FBR Finance Act 2024-2026 Salaried Tax Slabs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>NEPRA Multi-slab Electricity Tariff Matrix</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Revenue Board & LDA Marla (272.25 & 225 sq ft)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>PM&DC MDCAT & University Merit Formulas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Islamic Faraid & Nisab Shariah Jurisprudence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest Articles & Blogs Section */}
      <ArticlesSection />

      {/* 6. Interactive Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
