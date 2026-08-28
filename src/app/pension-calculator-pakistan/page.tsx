import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import DynamicCalculator from '../../components/calculators/DynamicCalculator';
import DataSource from '../../components/ui/DataSource';
import ShareButtons from '../../components/ui/ShareButtons';
import FAQSection from '../../components/ui/FAQSection';
import { BookOpen, ChevronRight, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pakistan Pension Calculator 2026 | Commutation & Monthly Gratuity',
  description:
    'Calculate Pakistan Civil Service Pension, Lump Sum Commutation (35%), Net Monthly Pension, and FGDC Defined Contribution VPS fund. Updated with Appendix I official purchase factor table.',
  keywords: [
    'Pakistan Pension Calculator',
    'Commutation Table Pakistan 2026',
    'Federal Pension Calculator',
    'Punjab Pension Rules',
    'Monthly Pension Slip Pakistan',
  ],
  alternates: {
    canonical: 'https://pakcalchub.com/pension-calculator-pakistan',
  },
};

const PENSION_FAQS = [
  {
    question: 'What is the standard pension formula in Pakistan?',
    answer:
      'Gross Pension = (Last Basic Pay × Qualifying Service Years × 7) ÷ 300. Qualifying service is capped at a maximum of 30 years (yielding 70% of Last Basic Pay).',
  },
  {
    question: 'How is the Commutation Lump Sum calculated?',
    answer:
      'Employees can commute up to 35% (or 40% in older notifications) of their Gross Pension. The lump sum formula is: Commuted Amount × 12 × Age Purchase Factor (e.g. 8.48 for Age 60, 10.40 for Age 55).',
  },
  {
    question: 'What is the minimum pension floor in Pakistan?',
    answer:
      'The Federal and Provincial Governments have notified a statutory minimum pension floor of Rs. 25,000 per month for all retired civil servants.',
  },
];

export default function PensionCalculatorPakistanPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pakistan Pension Calculator',
    url: 'https://pakcalchub.com/pension-calculator-pakistan',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' },
    dateModified: '2026-08-28',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-800 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/salary" className="hover:text-emerald-800">
            Retirement & Pension
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white">
            Pension Calculator Pakistan
          </span>
        </nav>

        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Civil Service Retirement Scheme
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Appendix I Factor Table Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Pakistan Pension & Commutation Calculator 2026
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Calculate your exact Gross Pension, 35% Commuted Lump Sum Gratuity, Net Monthly Take-Home Pension, and Post-2024 FGDC Defined Contribution VPS fund accumulation.
          </p>
        </div>

        <DynamicCalculator slug="pension-calculator" />

        <DataSource
          sourceName="Finance Division Pension Regulations (CSR Articles 468-474) & Appendix I Commutation Table"
          sourceUrl="https://finance.gov.pk"
          notificationNo="F.No.1(1)Imp/2024-Pension"
          effectiveDate="1st July 2024 & RBPS-2026 Updates"
          verifiedAt="28th August 2026"
        />

        <ShareButtons title="Pakistan Pension & Commutation Calculator 2026" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Official Appendix I Commutation Factor Reference
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The commutation factor is determined strictly by the retiree's age on the next birthday following the date of retirement:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center font-mono">
                  <div className="text-slate-400 text-[10px]">Age 50</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">12.3516</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center font-mono">
                  <div className="text-slate-400 text-[10px]">Age 55</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">10.3956</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center font-mono">
                  <div className="text-slate-400 text-[10px]">Age 60 (Superannuation)</div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">8.4874</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center font-mono">
                  <div className="text-slate-400 text-[10px]">Age 65</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">7.2208</div>
                </div>
              </div>
            </div>

            <FAQSection faqs={PENSION_FAQS} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Retirement Tools</h3>
              <div className="space-y-2">
                <Link href="/salary/leave-encashment-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Leave Encashment (LPR) Calculator
                </Link>
                <Link href="/salary/family-pension-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Family Pension Entitlement Calculator
                </Link>
                <Link href="/salary/gp-fund-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  GP Fund Final Payment Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
