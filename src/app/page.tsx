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
  Banknote,
  HeartHandshake,
  ClipboardList,
  Award,
  TrendingDown,
  BadgeCheck,
  FileText,
  Coins,
  Laptop,
  Home,
  Fuel,
  Scale,
  FileCheck,
  Percent,
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

  const dailyHighDemandTools = DAILY_DEMAND_IDS.map((id) =>
    ALL_CALCULATORS.find((c) => c.id === id)
  ).filter(Boolean) as typeof ALL_CALCULATORS;

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
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-600/20 bg-emerald-100/80 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-800 backdrop-blur-xs dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-300 max-w-full">
            <Sparkles className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Updated August 2026: RBPS-2026 Pay Scales, FBR TY2027 &amp; NEPRA Tariffs</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pakistan Calculator{' '}
            <span className="bg-gradient-to-r from-emerald-800 to-emerald-950 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-200">
              Hub
            </span>
          </h1>

          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Pakistan&apos;s authoritative financial, governmental, and daily calculation engine. 100% verified, fast, and completely free.
          </p>

          {/* Prominent Hero Search Bar */}
          <HeroSearch />

          {/* Quick Jump Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Direct Jump:</span>
            {[
              { label: '🏛️ Govt Suite', href: '#govt-suite' },
              { label: '💼 FBR Tax Portal', href: '#fbr-tax-suite' },
              { label: '🚗 Excise & Vehicles', href: '#excise-suite' },
              { label: '⚡ Top Daily Tools', href: '#daily-demand' },
              { label: '📂 All 13 Categories', href: '#categories' },
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

          {/* ⚡ High-Visibility Quick Launch Matrix (Top 8 Daily Tools) */}
          <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800/70 text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Daily Most-Searched Calculators — Quick Launch
              </span>
              <Link href="#daily-demand" className="text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400">
                View all 12 tools →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {topHeroQuickLaunch.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90"
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
      <section id="govt-suite" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">

        {/* Section Header — Official Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 sm:p-8 shadow-xl">
          {/* Decorative background circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-600/20 blur-3xl" />
          <div className="pointer-events-none absolute right-32 bottom-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Badge icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/30 ring-1 ring-emerald-400/30">
                <BadgeCheck className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    🏛️ Pakistan Government Employees
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    RBPS-2026 Verified
                  </span>
                </div>
                <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Government Employee Suite
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-lg">
                  All salary, pension, tax &amp; service-related calculators for Pakistan civil servants — modeled on Finance Division OM F.1(2)IMP/2026 &amp; Pension-cum-Gratuity Rules.
                </p>
              </div>
            </div>
            <Link
              href="/salary"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              View All Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Card 1: BPS Salary */}
          <Link href="/salary/bps-salary-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/15 group-hover:bg-emerald-800 group-hover:text-white transition-colors dark:bg-emerald-950/60 dark:text-emerald-400">
                <Banknote className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Most Used
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              BPS Salary Calculator
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              RBPS-2026 gross &amp; net salary with GP Fund, conveyance, HRA &amp; ARA-2026 (7%).
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Pension */}
          <Link href="/salary/pension-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-600/15 group-hover:bg-blue-700 group-hover:text-white transition-colors dark:bg-blue-950/60 dark:text-blue-400">
                <Award className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Commutation Table
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              Pension Calculator
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Pre &amp; post-July 2024 schemes. Lump sum commutation using official Finance Div table.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Family Pension */}
          <Link href="/salary/family-pension-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-600/15 group-hover:bg-rose-700 group-hover:text-white transition-colors dark:bg-rose-950/60 dark:text-rose-400">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                Punjab 2026
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              Family Pension
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Spouse/dependent pension entitlement. Punjab lifetime &amp; federal 10-year rules.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: GP Fund */}
          <Link href="/salary/gp-fund-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-600/15 group-hover:bg-violet-700 group-hover:text-white transition-colors dark:bg-violet-950/60 dark:text-violet-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                12.05% Rate
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              GP Fund Calculator
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              General Provident Fund balance growth at 12.05% compound. Maturity projection.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Leave Encashment */}
          <Link href="/salary/leave-encashment-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-600/15 group-hover:bg-amber-700 group-hover:text-white transition-colors dark:bg-amber-950/60 dark:text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Max 365 Days
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              Leave Encashment
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Earned / privilege leave cash-out on retirement or LPR. Per-day basic formula.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Promotion Pay Fixation */}
          <Link href="/salary/promotion-pay-fixation"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/15 group-hover:bg-teal-700 group-hover:text-white transition-colors dark:bg-teal-950/60 dark:text-teal-400">
                <ClipboardList className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                FR-22 Rule
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              Promotion Pay Fixation
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              New grade pay fixation on promotion per FR-22 — one stage benefit &amp; re-fixation.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 7: Salary Income Tax */}
          <Link href="/tax/income-tax-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700 ring-1 ring-red-600/15 group-hover:bg-red-700 group-hover:text-white transition-colors dark:bg-red-950/60 dark:text-red-400">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                FY 2026-27
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              Salary Income Tax
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              FBR salaried tax slabs Tax Year 2027. Monthly TDS, effective &amp; marginal rates.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 8: Arrears Tax / Income Averaging */}
          <Link href="/salary/increment-arrears-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700 ring-1 ring-orange-600/15 group-hover:bg-orange-700 group-hover:text-white transition-colors dark:bg-orange-950/60 dark:text-orange-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                Tax Relief
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
              Increment &amp; Arrears
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Annual increment calculation &amp; backdated salary arrears with tax averaging relief.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Calculate Now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Bottom CTA Row */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">8 tools</span> tailored for Pakistan civil servants — federal &amp; provincial, BPS 1–22.
          </p>
          <Link
            href="/salary"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Full Government Suite →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
           FBR TAX PORTAL — Federal Board of Revenue Featured Suite
          ═══════════════════════════════════════════════════════ */}
      <section id="fbr-tax-suite" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">

        {/* Section Header — Official FBR Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-slate-950 p-6 sm:p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-600/20 blur-3xl" />
          <div className="pointer-events-none absolute right-32 bottom-0 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600/30 ring-1 ring-rose-400/30">
                <Receipt className="h-6 w-6 text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    💼 Federal Board of Revenue
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    Tax Year 2027 (FY 2026-27)
                  </span>
                </div>
                <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  FBR Income Tax &amp; Withholding Portal
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-lg">
                  Official tax engines under Finance Act 2026: Salaried slabs, Freelancer 0.25% PSEB regime, Property 236C/236K, and Monthly TDS deductions.
                </p>
              </div>
            </div>
            <Link
              href="/tax"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              All Tax Calculators
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* FBR Tools Cards Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Card 1: Salaried Income Tax */}
          <Link href="/tax/income-tax-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-600/15 group-hover:bg-rose-700 group-hover:text-white transition-colors dark:bg-rose-950/60 dark:text-rose-400">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                Surcharge Abolished
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-rose-700 dark:text-white dark:group-hover:text-rose-400 transition-colors">
              Salaried Income Tax
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Tax Year 2027 slabs (0% up to 600k, 1% up to 1.2M). Monthly TDS and marginal rate calculator.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              Calculate Tax <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Freelancer Section 154A */}
          <Link href="/tax/freelancer-tax-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/15 group-hover:bg-emerald-800 group-hover:text-white transition-colors dark:bg-emerald-950/60 dark:text-emerald-400">
                <Laptop className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                0.25% PSEB Final
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-rose-700 dark:text-white dark:group-hover:text-rose-400 transition-colors">
              Freelancer &amp; IT Export Tax
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Section 154A 0.25% concessionary final tax for PSEB exporters &amp; 1.25% foreign remittance tax.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              Calculate Tax <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Property Tax 236C & 236K */}
          <Link href="/tax/property-tax-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-600/15 group-hover:bg-blue-700 group-hover:text-white transition-colors dark:bg-blue-950/60 dark:text-blue-400">
                <Home className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                236C &amp; 236K
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-rose-700 dark:text-white dark:group-hover:text-rose-400 transition-colors">
              Property Advance Tax
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Seller 236C (flat 2.75% Filer / 10% Non-Filer) and Buyer 236K (1.5% Filer / 10.5% Non-Filer).
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              Calculate Tax <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Business / Non-Salaried Tax */}
          <Link href="/tax/income-tax-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-600/15 group-hover:bg-amber-700 group-hover:text-white transition-colors dark:bg-amber-950/60 dark:text-amber-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Business &amp; AOP
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-rose-700 dark:text-white dark:group-hover:text-rose-400 transition-colors">
              Business &amp; Non-Salaried Tax
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Sole proprietors, AOPs &amp; business income tax slabs with 10% surcharge on income &gt; Rs. 10M.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              Calculate Tax <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Bottom Cheat-Sheet Row */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">FBR Slabs FY 2026-27:</span> Exempt up to Rs. 600,000/yr · 1% up to Rs. 1.2M · 11% up to Rs. 2.2M · Max 35%.
          </p>
          <Link
            href="/tax"
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 active:scale-95 transition-all shrink-0"
          >
            <Receipt className="h-3.5 w-3.5" />
            FBR Tax Slabs Overview →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
           EXCISE & TAXATION DEPARTMENT HUB — Motor Vehicles & Rates
          ═══════════════════════════════════════════════════════ */}
      <section id="excise-suite" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">

        {/* Section Header — Official Excise Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="pointer-events-none absolute right-32 bottom-0 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/30 ring-1 ring-blue-400/30">
                <Car className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    🚗 Excise &amp; Taxation Department
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    Punjab · Sindh · KPK · ICT
                  </span>
                </div>
                <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Excise, Motor Vehicle &amp; Fuel Hub
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-lg">
                  Calculate annual motor vehicle token tax, FBR Section 234 advance tax (filers vs non-filers), registration transfer fees, and trip fuel expenses.
                </p>
              </div>
            </div>
            <Link
              href="/vehicles"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              All Vehicle Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Excise Tools Cards Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Card 1: Token Tax */}
          <Link href="/vehicles/token-tax-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-600/15 group-hover:bg-blue-700 group-hover:text-white transition-colors dark:bg-blue-950/60 dark:text-blue-400">
                <Car className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Section 234
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400 transition-colors">
              Vehicle Token Tax Calculator
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Annual motor vehicle excise tax + FBR advance tax for 1000cc, 1300cc, 1500cc, 1800cc &amp; 2000cc+.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              Calculate Challan <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Fuel Trip Cost */}
          <Link href="/vehicles/fuel-cost-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/15 group-hover:bg-emerald-800 group-hover:text-white transition-colors dark:bg-emerald-950/60 dark:text-emerald-400">
                <Fuel className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Rs. 254.63/L
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400 transition-colors">
              Fuel Cost &amp; Trip Expense
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Calculate liters required, total trip cost (one-way / return), and cost per kilometer at OGRA rates.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              Plan Journey <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: EV Charging Running Cost */}
          <Link href="/vehicles/ev-charging-cost-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/15 group-hover:bg-teal-700 group-hover:text-white transition-colors dark:bg-teal-950/60 dark:text-teal-400">
                <Zap className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                NEPRA Off-Peak
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400 transition-colors">
              EV Charging &amp; Running Cost
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Compare electric car running costs (Rs. ~4.5/km) vs petrol car (Rs. ~21.2/km) and monthly savings.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              Calculate EV Cost <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Car Depreciation */}
          <Link href="/vehicles/car-depreciation-calculator"
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-600/15 group-hover:bg-violet-700 group-hover:text-white transition-colors dark:bg-violet-950/60 dark:text-violet-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                Resale Value
              </span>
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400 transition-colors">
              Car Depreciation &amp; Resale
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Estimate annual depreciation loss and residual fair market value of used cars in Pakistan.
            </p>
            <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              Estimate Resale <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Bottom Excise Cheat Sheet Row */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Excise Schedules:</span> Active Tax Filers on the FBR ATL receive up to 66% discount on annual advance motor vehicle tax.
          </p>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shrink-0"
          >
            <Car className="h-3.5 w-3.5" />
            Excise &amp; Vehicle Tools →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
           TOP 12 MOST-DEMANDED DAILY CALCULATORS IN PAKISTAN
          ═══════════════════════════════════════════════════════ */}
      <section id="daily-demand" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 ring-1 ring-amber-600/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Top 12 Most-Demanded Daily Calculators
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Pakistan&apos;s most searched tools for salary, taxes, utility bills, property, admissions &amp; banking
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 self-start sm:self-auto">
            100% Free · Real-Time Calculations
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dailyHighDemandTools.map((calc) => (
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
