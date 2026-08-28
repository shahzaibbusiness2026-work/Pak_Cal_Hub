import React from 'react';
import Link from 'next/link';
import { Calculator, ShieldCheck, Heart, AlertTriangle, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md group-hover:shadow-emerald-900/30 transition-shadow">
                <Calculator className="h-5 w-5 text-emerald-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pak Calc <span className="text-emerald-700 dark:text-emerald-400">Hub</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Pakistan&apos;s most comprehensive free calculation engine. Built for civil servants, taxpayers,
              students, homeowners, and businesses with 100% verified local formulas and regulations.
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-emerald-600/20 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>RBPS-2026 · FBR Finance Act 2026 · NEPRA 2026 · SBP Prudential Regulations</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Rates &amp; formulas last verified: <strong className="text-slate-700 dark:text-slate-300">28 August 2026</strong></span>
            </div>
          </div>

          {/* Column 1: Government & Tax */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Government &amp; Tax
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              {[
                { label: 'BPS Salary 2026', href: '/salary/bps-salary-calculator' },
                { label: 'Pension & Commutation', href: '/salary/pension-calculator' },
                { label: 'Family Pension', href: '/salary/family-pension-calculator' },
                { label: 'FBR Income Tax 2026-27', href: '/tax/income-tax-calculator' },
                { label: 'Freelancer IT Tax (0.25%)', href: '/tax/freelancer-tax-calculator' },
                { label: 'Property Tax 236C/236K', href: '/tax/property-tax-calculator' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Property & Power */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Property &amp; Power
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              {[
                { label: 'Electricity Bill (NEPRA)', href: '/electricity/electricity-bill-calculator' },
                { label: 'Solar System & Net Billing', href: '/electricity/solar-system-calculator' },
                { label: 'Marla · Kanal · Sq Ft', href: '/property/property-area-converter' },
                { label: 'House Construction Cost', href: '/property/construction-cost-calculator' },
                { label: 'Cement Bags Required', href: '/property/cement-calculator' },
                { label: 'EV Charging Cost', href: '/vehicles/ev-charging-calculator' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Finance, Education & Islamic */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Finance, Education &amp; Islamic
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              {[
                { label: 'Zakat & Nisab (2.5%)', href: '/islamic/zakat-calculator' },
                { label: 'Islamic Inheritance (Faraid)', href: '/islamic/islamic-inheritance-calculator' },
                { label: 'MDCAT / ECAT Aggregate', href: '/education/university-merit-calculator' },
                { label: 'GPA & CGPA Calculator', href: '/education/gpa-calculator' },
                { label: 'Loan EMI (Islamic/Conv.)', href: '/loans/loan-emi-calculator' },
                { label: 'PKR Currency Converter', href: '/currency/currency-converter' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800/40 dark:bg-amber-950/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              <strong>Legal Disclaimer:</strong> All calculators on Pak Calc Hub are provided for informational
              and educational purposes only. Results are estimates based on publicly notified government
              schedules (Finance Division, FBR, NEPRA, SBP, PM&amp;DC). They do not constitute legal, financial,
              or tax advice. Always verify with official sources or a qualified professional. Market-linked rates
              (electricity, fuel, gold, currency) are updated periodically and may not reflect real-time values.
              Pak Calc Hub assumes no liability for decisions made based on these calculations.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} Pakistan Calculator Hub (Pak Calc Hub). All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Engineered with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for Pakistan 🇵🇰
          </p>
        </div>
      </div>
    </footer>
  );
}
