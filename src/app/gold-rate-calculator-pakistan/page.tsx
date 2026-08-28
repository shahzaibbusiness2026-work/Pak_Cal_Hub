import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import DynamicCalculator from '../../components/calculators/DynamicCalculator';
import DataSource from '../../components/ui/DataSource';
import ShareButtons from '../../components/ui/ShareButtons';
import FAQSection from '../../components/ui/FAQSection';
import { BookOpen, ChevronRight, Home, Coins } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gold Rate Calculator Pakistan 2026 | 24K, 22K, 21K, 18K per Tola & Gram',
  description:
    'Calculate Gold Jewelry price in Pakistan for 24 Karat, 22 Karat, 21 Karat, and 18 Karat across Tola, Gram, Masha, and Ratti weights. Includes making charges and Zakat Nisab threshold.',
  keywords: [
    'Gold Rate Calculator Pakistan',
    '24K Gold Price per Tola',
    '22K Gold Jewelry Calculator',
    'Gold Zakat Calculator Pakistan',
    'Tola to Gram Gold Converter',
  ],
  alternates: {
    canonical: 'https://pakcalchub.com/gold-rate-calculator-pakistan',
  },
};

const GOLD_FAQS = [
  {
    question: 'How many grams are in 1 Tola of gold in Pakistan?',
    answer:
      'In Pakistan, 1 Tola is precisely equal to 11.6638 grams. 1 Tola also equals 12 Mashas or 96 Rattis.',
  },
  {
    question: 'How is the price of 22 Karat and 21 Karat gold calculated from 24 Karat?',
    answer:
      '24 Karat is 99.9% pure gold. 22 Karat is 22÷24 (91.67% pure), and 21 Karat is 21÷24 (87.5% pure). To calculate 22K rate per tola: 24K Rate × 0.9167.',
  },
  {
    question: 'What is the Zakat Nisab threshold for gold in Pakistan?',
    answer:
      'The Islamic Nisab threshold for gold is 7.5 Tolas (87.48 Grams). If a Muslim owns 7.5 tolas or more of gold for one lunar year, 2.5% of the total gold metal value is payable as Zakat.',
  },
];

export default function GoldRateCalculatorPakistanPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Gold Rate Calculator Pakistan',
    url: 'https://pakcalchub.com/gold-rate-calculator-pakistan',
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
          <Link href="/islamic" className="hover:text-emerald-800">
            Gold & Islamic Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white">
            Gold Rate Calculator
          </span>
        </nav>

        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5" />
              Sarafa Association Benchmark
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              24K • 22K • 21K • 18K • Tola & Gram
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Gold Rate & Jewelry Value Calculator Pakistan
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Convert any gold weight between Tola, Gram, Masha, and Ratti. Calculate real-time market value for 24K, 22K, 21K, and 18K purity with making charges and 2.5% Zakat Nisab eligibility.
          </p>
        </div>

        <DynamicCalculator slug="gold-rate-calculator" />

        <DataSource
          sourceName="All Pakistan Sarafa Gems and Jewellers Association (APSGJA) Official Bullion Benchmark"
          sourceUrl="https://apsja.com.pk"
          effectiveDate="August 2026"
          verifiedAt="28th August 2026"
        />

        <ShareButtons title="Gold Rate & Jewelry Value Calculator Pakistan 2026" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Traditional South Asian Gold Weight Units Conversion Table
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <tr>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Grams</th>
                      <th className="py-2.5 px-3">Tolas</th>
                      <th className="py-2.5 px-3">Mashas</th>
                      <th className="py-2.5 px-3">Rattis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">1 Tola</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">11.6638 g</td>
                      <td className="py-2 px-3">1.000</td>
                      <td className="py-2 px-3">12 Masha</td>
                      <td className="py-2 px-3">96 Ratti</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">1 Masha</td>
                      <td className="py-2 px-3 font-mono">0.9719 g</td>
                      <td className="py-2 px-3">0.0833</td>
                      <td className="py-2 px-3">1 Masha</td>
                      <td className="py-2 px-3">8 Ratti</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">1 Ratti</td>
                      <td className="py-2 px-3 font-mono">0.1215 g</td>
                      <td className="py-2 px-3">0.0104</td>
                      <td className="py-2 px-3">0.125</td>
                      <td className="py-2 px-3">1 Ratti</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">1 Troy Ounce</td>
                      <td className="py-2 px-3 font-mono">31.1035 g</td>
                      <td className="py-2 px-3">2.6667</td>
                      <td className="py-2 px-3">32 Masha</td>
                      <td className="py-2 px-3">256 Ratti</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <FAQSection faqs={GOLD_FAQS} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Financial Tools</h3>
              <div className="space-y-2">
                <Link href="/islamic/zakat-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Zakat on Gold & Wealth Calculator
                </Link>
                <Link href="/currency/usd-to-pkr" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  USD to PKR Currency Converter
                </Link>
                <Link href="/investment/compound-profit-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Gold & Mutual Fund Return Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
