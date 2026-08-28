import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import DynamicCalculator from '../../components/calculators/DynamicCalculator';
import DataSource from '../../components/ui/DataSource';
import ShareButtons from '../../components/ui/ShareButtons';
import FAQSection from '../../components/ui/FAQSection';
import { BookOpen, ChevronRight, Home, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LESCO Electricity Bill Calculator 2026 | NEPRA Unit Rates & Taxes',
  description:
    'Calculate your LESCO, IESCO, MEPCO, FESCO, GEPCO, and K-Electric monthly domestic electricity bill online. Accurate NEPRA base slabs, FPA, GST, and PTV fee calculator.',
  keywords: [
    'LESCO Bill Calculator 2026',
    'Electricity Bill Calculator Pakistan',
    'NEPRA Tariff Rates 2026',
    'Protected vs Unprotected Electricity Units',
    'IESCO MEPCO Bill Estimator',
  ],
  alternates: {
    canonical: 'https://pakcalchub.com/electricity-bill-calculator-lesco',
  },
};

const ELECTRICITY_FAQS = [
  {
    question: 'What is a Protected electricity consumer in Pakistan?',
    answer:
      'A domestic consumer whose electricity consumption has remained at or below 200 units per month consistently for the preceding 6 consecutive billing cycles is categorized as Protected. Protected consumers benefit from significantly subsidized base rates.',
  },
  {
    question: 'What taxes and surcharges are included in my Pakistan electricity bill?',
    answer:
      'Electricity bills include Base Energy Charges, Fuel Price Adjustment (FPA), Financing Cost (FC) Surcharge, Electricity Duty (ED ~1.5%), General Sales Tax (18% GST for >200 units), and the PTV license fee (Rs. 35).',
  },
  {
    question: 'How do I reduce my electricity bill using Solar Net Metering?',
    answer:
      'By installing an On-Grid or Hybrid solar PV system with a three-phase green bidirectional meter, you can export surplus daytime solar generation back to your DISCO grid at NEPRA approved national export rates.',
  },
];

export default function ElectricityBillCalculatorLescoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LESCO Electricity Bill Calculator',
    url: 'https://pakcalchub.com/electricity-bill-calculator-lesco',
    applicationCategory: 'UtilityApplication',
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
          <Link href="/electricity" className="hover:text-emerald-800">
            Electricity & Energy
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white">
            LESCO Bill Calculator
          </span>
        </nav>

        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              NEPRA Domestic Schedule
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              LESCO, IESCO, K-Electric, MEPCO, FESCO
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            LESCO & Pakistan Electricity Bill Calculator 2026
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Estimate your exact monthly domestic electricity bill based on units consumed (kWh). Accurately incorporates NEPRA tariff slabs, Fuel Price Adjustment (FPA), FC Surcharge, Electricity Duty, and 18% GST.
          </p>
        </div>

        <DynamicCalculator slug="electricity-bill-calculator" />

        <DataSource
          sourceName="National Electric Power Regulatory Authority (NEPRA) Domestic Tariff Schedule"
          sourceUrl="https://nepra.org.pk"
          notificationNo="NEPRA/TRF-100/2026"
          effectiveDate="1st July 2026"
          verifiedAt="28th August 2026"
        />

        <ShareButtons title="LESCO & Pakistan Electricity Bill Calculator 2026" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  NEPRA Slabs Comparison (Protected vs Unprotected)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <tr>
                      <th className="py-2.5 px-3">Units Range</th>
                      <th className="py-2.5 px-3">Protected Base Rate</th>
                      <th className="py-2.5 px-3">Unprotected Base Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 px-3 font-semibold">1 – 50 Units</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold dark:text-emerald-400">Rs. 9.87 / unit</td>
                      <td className="py-2 px-3">Rs. 23.59 / unit</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">51 – 100 Units</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold dark:text-emerald-400">Rs. 16.48 / unit</td>
                      <td className="py-2 px-3">Rs. 23.59 / unit</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">101 – 200 Units</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold dark:text-emerald-400">Rs. 22.95 / unit</td>
                      <td className="py-2 px-3">Rs. 30.07 / unit</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">201 – 300 Units</td>
                      <td className="py-2 px-3 text-slate-400">—</td>
                      <td className="py-2 px-3 font-bold text-amber-700 dark:text-amber-400">Rs. 34.26 / unit</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">301 – 400 Units</td>
                      <td className="py-2 px-3 text-slate-400">—</td>
                      <td className="py-2 px-3 font-bold text-amber-700 dark:text-amber-400">Rs. 39.15 / unit</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Above 700 Units</td>
                      <td className="py-2 px-3 text-slate-400">—</td>
                      <td className="py-2 px-3 font-bold text-red-600 dark:text-red-400">Rs. 48.84 / unit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <FAQSection faqs={ELECTRICITY_FAQS} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Energy Tools</h3>
              <div className="space-y-2">
                <Link href="/electricity/solar-panel-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Solar Panel System Sizing Calculator
                </Link>
                <Link href="/electricity/appliance-wattage-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  AC & Refrigerator Power Calculator
                </Link>
                <Link href="/electricity/ups-battery-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  UPS Backup Time & Battery Sizing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
