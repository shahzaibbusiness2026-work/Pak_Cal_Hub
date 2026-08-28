import React from 'react';
import Link from 'next/link';
import { Calculator, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { CATEGORIES_DATA } from '../../lib/data/categories';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md">
                <Calculator className="h-5 w-5 text-emerald-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pak Calc <span className="text-emerald-700 dark:text-emerald-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Pakistan&apos;s most comprehensive, accurate, and free online calculation suite. Engineered for civil servants, taxpayers, students, homeowners, and businesses with 100% verified local formulas and standards.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Compliant with FBR 2024-2026, NEPRA & SBP Regulations</span>
            </div>
          </div>

          {/* Quick Categories Columns */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Government & Tax
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/salary/bps-salary-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  BPS Salary Calculator
                </Link>
              </li>
              <li>
                <Link href="/salary/pension-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Pension & Commutation
                </Link>
              </li>
              <li>
                <Link href="/tax/income-tax-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  FBR Salary Tax 2025
                </Link>
              </li>
              <li>
                <Link href="/tax/freelancer-tax-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Freelancer 1% Tax
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Property & Power
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/electricity/electricity-bill-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Electricity Bill Calculator
                </Link>
              </li>
              <li>
                <Link href="/electricity/solar-system-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Solar System & Net Metering
                </Link>
              </li>
              <li>
                <Link href="/property/property-area-converter" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Marla & Kanal Converter
                </Link>
              </li>
              <li>
                <Link href="/property/construction-cost-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  House Construction Cost
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Finance & Faith
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/islamic/zakat-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Zakat & Nisab Calculator
                </Link>
              </li>
              <li>
                <Link href="/islamic/islamic-inheritance-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Islamic Inheritance (Faraid)
                </Link>
              </li>
              <li>
                <Link href="/education/university-merit-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  MDCAT & ECAT Aggregate
                </Link>
              </li>
              <li>
                <Link href="/data-tools/gold-price-calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                  Sarafa Gold Rates
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Pakistan Calculator Hub (Pak Calc Hub). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for the people of Pakistan 🇵🇰
          </p>
        </div>
      </div>
    </footer>
  );
}
