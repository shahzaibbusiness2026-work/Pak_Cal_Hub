import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import DynamicCalculator from '../../components/calculators/DynamicCalculator';
import DataSource from '../../components/ui/DataSource';
import ShareButtons from '../../components/ui/ShareButtons';
import FAQSection from '../../components/ui/FAQSection';
import { BookOpen, ChevronRight, Home, Fuel } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pakistan Fuel Cost Calculator 2026 | Petrol Rs. 342.60 & Diesel Rs. 371.61',
  description:
    'Calculate car and bike trip fuel expense, distance cost per kilometer, and daily/monthly commute budgets in Pakistan based on official Petroleum Division and OGRA petrol (Rs. 342.60) and diesel (Rs. 371.61) prices.',
  keywords: [
    'Fuel Cost Calculator Pakistan',
    'Petrol Price Calculator Rs 342.60',
    'Diesel Rate 371.61 Pakistan',
    'Lahore to Islamabad Fuel Cost',
    'Car Fuel Average Calculator',
  ],
  alternates: {
    canonical: 'https://pakcalchub.com/fuel-cost-calculator-pakistan',
  },
};

const FUEL_FAQS = [
  {
    question: 'What is the current official Petrol and Diesel price in Pakistan?',
    answer:
      'As notified by the Petroleum Division and Oil and Gas Regulatory Authority (OGRA) for 28 August 2026, the official price for Petrol (Motor Spirit) is Rs. 342.60 per litre, and High-Speed Diesel (HSD) is Rs. 371.61 per litre.',
  },
  {
    question: 'How do I calculate fuel cost for a road trip in Pakistan?',
    answer:
      'Divide the total trip distance (in km) by your vehicle’s fuel average (km/litre) to find the fuel quantity needed. Then multiply the required litres by the current fuel price per litre (e.g. Rs. 342.60 / litre).',
  },
  {
    question: 'How much fuel does a 1000cc car consume between Lahore and Islamabad?',
    answer:
      'For a 380 km motorway drive (M-2) with a fuel average of 15 km/litre, a 1000cc car consumes approximately 25.33 litres of petrol, costing approximately Rs. 8,680 each way at Rs. 342.60/litre.',
  },
];

export default function FuelCostCalculatorPakistanPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pakistan Fuel Cost Calculator',
    url: 'https://pakcalchub.com/fuel-cost-calculator-pakistan',
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
          <Link href="/vehicles" className="hover:text-emerald-800">
            Vehicles & Transport
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white">
            Fuel Cost Calculator
          </span>
        </nav>

        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" />
              Petroleum Division Notification
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
              Petrol: Rs. 342.60 • Diesel: Rs. 371.61
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Pakistan Fuel Cost &amp; Trip Expense Calculator
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Calculate your journey fuel expense, running cost per kilometer, and daily commute budget based on distance, your vehicle's mileage, and latest official fuel rates.
          </p>
        </div>

        <DynamicCalculator slug="fuel-cost-calculator" />

        <DataSource
          sourceName="Ministry of Energy (Petroleum Division) & OGRA Petroleum Price Notification"
          sourceUrl="https://ogra.org.pk"
          notificationNo="Petroleum Division SRO Notification (28 August 2026)"
          effectiveDate="28th August 2026"
          verifiedAt="28th August 2026"
        />

        <ShareButtons title="Pakistan Fuel Cost & Trip Expense Calculator" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Intercity Road Trip Distances &amp; Fuel Estimates (At Rs. 342.60/Litre)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <tr>
                      <th className="py-2.5 px-3">Route (Motorway / Highway)</th>
                      <th className="py-2.5 px-3">Distance</th>
                      <th className="py-2.5 px-3">Car Fuel (14 km/L)</th>
                      <th className="py-2.5 px-3">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 px-3 font-semibold">Lahore ➔ Islamabad (M-2)</td>
                      <td className="py-2 px-3">380 km</td>
                      <td className="py-2 px-3 font-mono">27.1 Litres</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">Rs. 9,285</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Islamabad ➔ Peshawar (M-1)</td>
                      <td className="py-2 px-3">155 km</td>
                      <td className="py-2 px-3 font-mono">11.1 Litres</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">Rs. 3,803</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Karachi ➔ Hyderabad (M-9)</td>
                      <td className="py-2 px-3">160 km</td>
                      <td className="py-2 px-3 font-mono">11.4 Litres</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">Rs. 3,905</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Lahore ➔ Multan (M-3)</td>
                      <td className="py-2 px-3">340 km</td>
                      <td className="py-2 px-3 font-mono">24.3 Litres</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">Rs. 8,325</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <FAQSection faqs={FUEL_FAQS} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Vehicle Tools</h3>
              <div className="space-y-2">
                <Link href="/vehicles/token-tax-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Motor Vehicle Token Tax Calculator
                </Link>
                <Link href="/vehicles/car-loan-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Auto Financing EMI Calculator
                </Link>
                <Link href="/vehicles/car-import-duty-calculator" className="block p-2.5 rounded-xl border border-slate-100 hover:border-emerald-600/40 hover:bg-slate-50 text-xs font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  Customs Duty on Imported Vehicles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
