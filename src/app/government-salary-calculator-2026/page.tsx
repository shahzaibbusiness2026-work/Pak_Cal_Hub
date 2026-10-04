import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import DynamicCalculator from '../../components/calculators/DynamicCalculator';
import DataSource from '../../components/ui/DataSource';
import ShareButtons from '../../components/ui/ShareButtons';
import FAQSection from '../../components/ui/FAQSection';
import { ShieldCheck, Calendar, BookOpen, CheckCircle2, ChevronRight, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pakistan Government Salary Calculator 2026-27 | RBPS-2026 Pay Scale',
  description:
    'Calculate Federal & Provincial Government Employee Salary for 2026-27 (RBPS-2026). Accurately compute Basic Pay, 7% Adhoc Relief, House Rent, Conveyance, Medical, and GP Fund deductions.',
  keywords: [
    'Government Salary Calculator 2026',
    'RBPS 2026 Pay Scale Pakistan',
    'Federal Govt Employee Salary 2026',
    'Adhoc Relief Allowance 2026',
    'BPS Salary Slip Calculator',
  ],
  alternates: {
    canonical: 'https://pakcalchub.com/government-salary-calculator-2026',
  },
};

const SALARY_FAQS = [
  {
    question: 'How is the 2026-27 Government Salary calculated in Pakistan?',
    answer:
      'The 2026-27 salary uses the Revised Basic Pay Scales 2026 (RBPS-2026, notified 21-07-2026, effective 01-07-2026 — with 15% ARA-2022 and 10% ARA-2025 merged into basic pay), plus station-specific frozen House Rent Allowance, Conveyance Allowance (revised +50%), Medical Allowance (15% of basic for officers), 7% Ad-hoc Relief Allowance 2026 and 15% Disparity Reduction Allowance 2026, minus GP Fund slab subscription, Benevolent Fund (max Rs. 155) and Group Insurance.',
  },
  {
    question: 'What is the difference between Big City and Other Station House Rent?',
    answer:
      'Specified Big Cities (Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Quetta, Faisalabad, Multan, Hyderabad, Gujranwala) receive the higher 45% ceiling. Non-specified stations receive the 30% ceiling. If you occupy government official accommodation, HRA is Rs. 0 and a 5% Maintenance Deduction is applied to running basic pay.',
  },
  {
    question: 'How much GP Fund is deducted from BPS employees?',
    answer:
      'GP Fund is a fixed monthly slab by BPS (Finance Division OM dated 18-08-2005) — not a percentage. For example, BPS-17 subscribes Rs. 1,000/month and BPS-22 Rs. 2,410/month. These are minimum rates; subscribers may elect a higher subscription.',
  },
];

export default function GovernmentSalaryCalculator2026Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pakistan Government Salary Calculator 2026',
    url: 'https://pakcalchub.com/government-salary-calculator-2026',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' },
    dateModified: '2026-08-28',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-800 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/salary" className="hover:text-emerald-800">
            Civil Service Salaries
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white">
            Government Salary Calculator 2026
          </span>
        </nav>

        {/* Header Banner */}
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Federal & Provincial Civil Service
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md">
              2026-27 Figures Provisional — Verify Against Finance Division Notification
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Pakistan Government Salary Calculator 2026-27
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Instant, official salary slip generator for Federal, Punjab, Sindh, KPK, and Balochistan civil servants across BPS Grade 1 to 22. Incorporates the latest 7% Adhoc Relief Allowance 2026, Disparity Reduction Allowance (DRA), and revised GP Fund rates.
          </p>
        </div>

        {/* Calculation Widget */}
        <DynamicCalculator slug="bps-salary-calculator" />

        {/* Official Source & Verification Badge */}
        <DataSource toolId="bps-salary-calculator" />

        {/* Social Sharing */}
        <ShareButtons title="Pakistan Government Salary Calculator 2026-27 (BPS 1-22)" />

        {/* Methodological Context & Guide */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Salary Structure & Allowances Breakdown (RBPS-2026)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Pakistan civil servants receive a multi-tiered compensation package designed in accordance with the Revised Basic Pay Scales. The components include:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">1. Running Basic Pay</div>
                  <div>Base salary calculated from Minimum Pay plus completed annual increment stages.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">2. House Rent Allowance (HRA)</div>
                  <div>45% ceiling for Specified Big Cities or 30% for other stations. Official accommodation receives 0 HRA + 5% maintenance deduction.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">3. Ad-hoc Relief Allowances</div>
                  <div>Includes 7% ARA-2026 on running basic and 15% DRA-2026 on frozen 2022 basic (BPS 1-22), plus provincial Special Allowances. Earlier ARAs (2022, 2025) are merged into the RBPS-2026 basic pay.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">4. Statutory Deductions</div>
                  <div>Fixed-slab deductions: GP Fund subscription (BPS-wise slab), Benevolent Fund (2%, max Rs. 155) and Group Insurance (pay-slab, max Rs. 182).</div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <FAQSection faqs={SALARY_FAQS} />
          </div>

          {/* Sidebar Reference */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick BPS Navigation</h3>
              <div className="space-y-2">
                <Link href="/punjab-government-salary-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Punjab Govt Salary Calculator
                </Link>
                <Link href="/sindh-government-salary-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Sindh Govt Salary Calculator
                </Link>
                <Link href="/pension-calculator-pakistan" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Pension & Commutation Calculator
                </Link>
                <Link href="/salary/gp-fund-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  GP Fund Interest Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
