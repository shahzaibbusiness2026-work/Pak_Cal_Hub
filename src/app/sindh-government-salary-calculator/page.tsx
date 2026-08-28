import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import DynamicCalculator from '../../components/calculators/DynamicCalculator';
import DataSource from '../../components/ui/DataSource';
import ShareButtons from '../../components/ui/ShareButtons';
import FAQSection from '../../components/ui/FAQSection';
import { BookOpen, ChevronRight, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sindh Government Salary Calculator 2026-27 | Karachi & Hyderabad HRA',
  description:
    'Calculate Government of Sindh Employee Salary for 2026-27. Supports Differential Allowance, BPS 1-22 running pay, Karachi 45% HRA, and Sindh GP Fund schedules.',
  keywords: [
    'Sindh Government Salary Calculator 2026',
    'Sindh Pay Scale 2026-27',
    'Karachi Govt Employee Salary Slip',
    'Sindh Differential Allowance',
  ],
  alternates: {
    canonical: 'https://pakcalchub.com/sindh-government-salary-calculator',
  },
};

const SINDH_FAQS = [
  {
    question: 'How is House Rent Allowance calculated in Sindh?',
    answer:
      'Karachi and Hyderabad are classified as Big Cities in Sindh, receiving the higher 45% ceiling. Other districts (Sukkur, Larkana, Mirpurkhas, Nawabshah) receive the 30% ceiling.',
  },
  {
    question: 'What Ad-hoc relief allowances apply to Sindh Government employees?',
    answer:
      'Sindh civil servants receive the latest Ad-hoc Relief Allowances (ARA-2026 7%, ARA-2024, ARA-2023 35%/30%) on running basic pay, and Differential Allowance for eligible departments.',
  },
];

export default function SindhGovernmentSalaryCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sindh Government Salary Calculator',
    url: 'https://pakcalchub.com/sindh-government-salary-calculator',
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
            Civil Service Salaries
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white">
            Sindh Govt Salary Calculator
          </span>
        </nav>

        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Government of Sindh
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Finance Department Sindh Notification Validated
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Sindh Government Employee Salary Calculator 2026-27
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Instant salary calculator for Government of Sindh secretariat, police, teachers, and municipal staff. Incorporates Differential Allowance, BPS 1-22 pay fixation, and Karachi/Hyderabad HRA rules.
          </p>
        </div>

        <DynamicCalculator slug="bps-salary-calculator" />

        <DataSource
          sourceName="Government of Sindh, Finance Department Notification No. FD(SR-I)1(32)/2026"
          sourceUrl="https://finance.sindh.gov.pk"
          notificationNo="FD(SR-I)1(32)/2026-RBPS"
          effectiveDate="1st July 2026"
          verifiedAt="28th August 2026"
        />

        <ShareButtons title="Sindh Government Salary Calculator 2026-27" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Sindh Provincial Allowances & Slabs
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Sindh civil servants receive comprehensive allowances determined by station posting:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Karachi & Hyderabad Big City HRA</div>
                  <div>45% ceiling applies to provincial staff stationed in Karachi and Hyderabad municipal limits.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Differential Allowance</div>
                  <div>Applied to narrow disparities between secretariat cadres and field formations.</div>
                </div>
              </div>
            </div>

            <FAQSection faqs={SINDH_FAQS} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Other Provinces</h3>
              <div className="space-y-2">
                <Link href="/punjab-government-salary-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Punjab Govt Salary Calculator
                </Link>
                <Link href="/government-salary-calculator-2026" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Federal Govt Salary Calculator
                </Link>
                <Link href="/pension-calculator-pakistan" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Sindh Pension Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
