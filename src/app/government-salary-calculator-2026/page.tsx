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
      'The 2026-27 salary is calculated by taking the Revised Basic Pay Stage (RBPS-2026) plus station-specific House Rent Allowance (45% or 30% of 2008/2011 frozen ceilings), Conveyance Allowance, Medical Allowance, and the latest Ad-hoc Relief Allowances (7% ARA-2026, 25% ARA-2024), minus GP Fund, Benevolent Fund, and Group Insurance.',
  },
  {
    question: 'What is the difference between Big City and Other Station House Rent?',
    answer:
      'Specified Big Cities (Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Quetta, Faisalabad, Multan, Hyderabad, Gujranwala) receive the higher 45% ceiling. Non-specified stations receive the 30% ceiling. If you occupy government official accommodation, HRA is Rs. 0 and a 5% Maintenance Deduction is applied to running basic pay.',
  },
  {
    question: 'How much GP Fund is deducted from BPS employees?',
    answer:
      'For BPS 1 to 15, the standard GP Fund subscription rate is approx. 5% of monthly basic pay. For Gazetted Officers (BPS 16 to 22), the deduction rate is approx. 8% of running basic pay.',
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
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              RBPS-2026 Notification Validated
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
        <DataSource
          sourceName="Finance Division (Regulations Wing) OM No. F.1(2)Imp/2026"
          sourceUrl="https://finance.gov.pk"
          notificationNo="F.1(2)Imp/2026-RBPS"
          effectiveDate="1st July 2026"
          verifiedAt="28th August 2026"
        />

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
                  <div>Includes 7% ARA-2026, 25% ARA-2024 (BPS 1-16) / 20% (BPS 17-22), and provincial Special Allowances.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">4. Statutory Deductions</div>
                  <div>Mandatory deductions for General Provident Fund (GPF), Benevolent Fund (2%), and Group Insurance.</div>
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
