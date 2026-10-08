import Link from 'next/link';
import { Home, Search, Calculator } from 'lucide-react';
import { SITE_NAME } from '../lib/site';

export const metadata = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: 'The page you are looking for does not exist. Browse 49 free Pakistan calculators.',
  robots: { index: false, follow: true },
};

const POPULAR = [
  { href: '/government-salary-calculator-2026', label: 'Government Salary Calculator 2026-27' },
  { href: '/pension-calculator-pakistan', label: 'Pension Calculator' },
  { href: '/electricity-bill-calculator-lesco', label: 'Electricity Bill Calculator' },
  { href: '/fuel-cost-calculator-pakistan', label: 'Fuel Cost Calculator' },
  { href: '/gold-rate-calculator-pakistan', label: 'Gold Rate Calculator' },
  { href: '/tax/income-tax-calculator', label: 'FBR Income Tax Calculator' },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
        <Search className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        The page you are looking for does not exist or was moved. Try one of our
        popular calculators below.
      </p>
      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        {POPULAR.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-600/40 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-emerald-900/20"
          >
            <Calculator className="h-4 w-4 shrink-0 text-emerald-600" />
            {item.label}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
