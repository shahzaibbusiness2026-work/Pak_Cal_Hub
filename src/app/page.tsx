import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  HeartHandshake,
  ClipboardList,
  Award,
  TrendingDown,
  BadgeCheck,
  Laptop,
  Home,
  Fuel,
  Zap,
  Receipt,
  Car,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { CATEGORIES_DATA, ALL_CALCULATORS } from '../lib/data/categories-meta';
import CalculatorCard from '../components/ui/CalculatorCard';
import LiveRatesStrip from '../components/ui/LiveRatesStrip';
import { getSiteSettings } from '../lib/cms/settings';
import { parseToolOverrides, applyToolOverride, isToolDisabled, parseCategoryOverrides } from '../lib/cms/overrides';
import HeroSearch from '../components/ui/HeroSearch';
import ArticlesSection from '../components/ui/ArticlesSection';
import NewsletterSection from '../components/ui/NewsletterSection';
import { CategoryIcon } from '../components/ui/categoryIcons';
import { SITE_URL, SITE_NAME, SITE_FULL_NAME, canonicalUrl } from '../lib/site';

export const metadata: Metadata = {
  title: `${SITE_FULL_NAME} (${SITE_NAME}) | 53 Free Pakistan Calculators 2026`,
  description:
    'Pakistan\'s free calculator hub: RBPS-2026 Government Salary, FBR Income Tax 2026-27, Electricity Bills, Pension, GP Fund, Zakat, Solar, Gold Rates & more. Accurate, official-source linked, updated October 2026.',
  alternates: { canonical: canonicalUrl('/') },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_FULL_NAME,
    title: `${SITE_FULL_NAME} | 53 Free Pakistan Calculators 2026`,
    description:
      'Free Pakistan calculators: Government Salary (RBPS-2026), FBR Tax, Electricity Bills, Pension, GP Fund, Zakat, Solar & more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_FULL_NAME} | 53 Free Pakistan Calculators`,
    description: 'RBPS-2026 Salary, FBR Tax, Electricity Bills, Pension, Zakat & 53 free Pakistan calculators.',
  },
};

export default async function HomePage() {
  const settingsRaw = await getSiteSettings();
  const toolOverrides = parseToolOverrides(settingsRaw);
  const categoryOverrides = parseCategoryOverrides(settingsRaw);
  const heroTitle = (settingsRaw.hero_title || 'Pakistan Calculator').toString();
  const heroAccent = (settingsRaw.hero_accent || 'Hub').toString();
  const heroSubtitle = (settingsRaw.hero_subtitle || "Pakistan's authoritative financial, governmental, and daily calculation engine. 100% verified, fast, and completely free.").toString();
  const displayCategories = CATEGORIES_DATA.map((c) => {
    const cov = categoryOverrides.categories[c.id];
    return {
      ...c,
      name: cov?.name?.trim() || c.name,
      description: cov?.description?.trim() || c.description,
      tools: c.tools.filter((tool) => !isToolDisabled(tool.id, toolOverrides)).map((tool) => applyToolOverride(tool, toolOverrides)),
    };
  });
  const DAILY_DEMAND_IDS = [
    'bps-salary-calculator',
    'income-tax-calculator',
    'electricity-bill-calculator',
    'solar-system-calculator',
    'property-area-converter',
    'university-merit-calculator',
    'zakat-calculator',
    'token-tax-calculator',
    'gold-price-calculator',
    'loan-emi-calculator',
    'freelancer-tax-calculator',
    'construction-cost-calculator',
  ];

  const NEW_TRENDING_IDS = [
    'percentage-calculator',
    'hijri-date-converter',
    'tenant-bill-splitter',
    'prize-bond-draw-checker',
    'ev-charging-cost-calculator',
    'compound-interest-calculator',
    'appliance-electricity-cost-calculator',
    'gpa-calculator',
  ];
  const newAndTrendingTools = NEW_TRENDING_IDS
    .map((toolId) => ALL_CALCULATORS.find((c) => c.id === toolId))
    .filter((c) => Boolean(c) && !isToolDisabled((c as any).id, toolOverrides))
    .map((c) => applyToolOverride(c as any, toolOverrides)) as typeof ALL_CALCULATORS;

  const topHeroQuickLaunch = [
    { title: 'BPS Salary 2026', subtitle: 'RBPS-2026 Net Pay & GP Fund', href: '/salary/bps-salary-calculator', badge: 'Updated 2026', color: 'emerald' },
    { title: 'FBR Income Tax', subtitle: 'TY 2027 Monthly TDS Slabs', href: '/tax/income-tax-calculator', badge: 'New Slabs', color: 'rose' },
    { title: 'Electricity Bill', subtitle: 'WAPDA & K-Electric Units', href: '/electricity/electricity-bill-calculator', badge: 'NEPRA 2026', color: 'amber' },
    { title: 'Solar System ROI', subtitle: 'Net Billing & Payback', href: '/electricity/solar-system-calculator', badge: 'Rs 10.20 Buyback', color: 'amber' },
    { title: 'Marla to Sq. Ft.', subtitle: '272.25 & 225 LDA Standard', href: '/property/property-area-converter', badge: 'Revenue Board', color: 'blue' },
    { title: 'MDCAT Aggregate', subtitle: '50-40-10 PM&DC Formula', href: '/education/university-merit-calculator', badge: 'PM&DC 2026', color: 'purple' },
    { title: 'Zakat & Nisab', subtitle: '2.5% on Gold, Silver & Cash', href: '/islamic/zakat-calculator', badge: 'Sarafa Nisab', color: 'emerald' },
    { title: 'Vehicle Token Tax', subtitle: 'Annual Challan & Sec 234', href: '/vehicles/token-tax-calculator', badge: 'Punjab / ICT', color: 'teal' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section: Clean Modern CSS Emerald Gradient Background */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 px-4 pt-8 sm:pt-14 pb-12 sm:pb-16 sm:px-6 lg:px-8 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 transition-colors">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Official Trust Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-600/20 bg-emerald-100/80 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-800 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-300 max-w-full">
            <Sparkles className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Updated October 2026: RBPS-2026 Pay Scales, FBR TY2027 &amp; NEPRA Tariffs</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="font-display mt-4 sm:mt-5 text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            {heroTitle}{' '}
            <span className="ml-2 bg-gradient-to-r from-emerald-800 to-emerald-950 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-200">
              {heroAccent}
            </span>
          </h1>

          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Prominent Hero Search Bar */}
          <HeroSearch />

          {/* Quick Jump Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Direct Jump:</span>
            {[
              { label: 'Top Tools', href: '#quick-launch' },
              { label: 'New & Trending', href: '#daily-demand' },
              { label: 'All 13 Categories', href: '#categories' },
              { label: 'Guides & Blog', href: '/blog' },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-600 hover:text-emerald-800 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-emerald-400 transition-all touch-manipulation"
              >
                {tag.label}
              </Link>
            ))}
          </div>

          {/* Live rates strip — today's petrol, diesel, gold, silver, USD */}
          <div className="mt-8 -mx-4 sm:mx-0 text-left">
            <LiveRatesStrip />
          </div>

          {/* ⚡ High-Visibility Quick Launch Matrix (Top 8 Daily Tools) */}
          <div id="quick-launch" className="mt-8 scroll-mt-24 pt-6 border-t border-slate-200/70 dark:border-slate-800/70 text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Daily Most-Searched Calculators — Quick Launch
              </span>
              <Link href="#daily-demand" className="text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400">
                New & trending →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {topHeroQuickLaunch.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-800 dark:text-slate-600 dark:group-hover:text-emerald-400 transform transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.subtitle}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
           GOVERNMENT EMPLOYEE SUITE — Premium Featured Section
          ═══════════════════════════════════════════════════════ */}
      <section id="daily-demand" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 ring-1 ring-amber-600/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                New &amp; Trending Calculators
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Fresh tools Pakistan is searching for right now — added October 2026
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 self-start sm:self-auto">
            100% Free · Real-Time Calculations
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {newAndTrendingTools.map((calc) => (
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
            53 precision calculation engines across government, tax, property, and finance
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/10 group-hover:bg-emerald-800 group-hover:text-white transition-colors dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CategoryIcon icon={cat.icon} className="h-6 w-6" />
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
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-12 text-white shadow-2xl dark:border dark:border-slate-800">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Pakistani Verified Calculations</span>
            </div>
            <h2 className="mt-4 text-xl sm:text-3xl font-extrabold tracking-tight">
              Engineered to Official Pakistan Government & Financial Standards
            </h2>
            <p className="mt-3 text-xs sm:text-base text-slate-300 leading-relaxed">
              Every single formula on Pak Calc Hub is modeled against official notifications, gazettes, and standards:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Federal & Provincial RBPS-2026 Pay Scales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>FBR Finance Act 2026-27 Tax Year Slabs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>NEPRA 2026 Prosumer Net Billing & Uniform Tariffs</span>
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
