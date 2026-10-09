import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Pak Calc Hub | Pakistan Calculator Hub',
  description: 'Pak Calc Hub builds free, official-source calculators for Pakistan: government salary, FBR tax, electricity, pension, admissions and more.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const { getSiteSettings } = await import('../../lib/cms/settings');
  const settingsRaw = await getSiteSettings();
  const customAbout = typeof settingsRaw.about_content === 'string' ? settingsRaw.about_content.trim() : '';
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">About Pak Calc Hub</h1>
      {customAbout ? (
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {customAbout.split(/\n\s*\n/).map((para, i) => (
            <p key={i} className="whitespace-pre-line">{para}</p>
          ))}
        </div>
      ) : (
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>Pak Calc Hub is a free calculator hub built only for Pakistan. Government employees, students, car owners, freelancers and families were doing the same calculations by hand — BPS salary and pension, FBR income tax, electricity units, MDCAT aggregate, vehicle token tax — so we built each one against the official notification behind it and put the verified date on the tool.</p>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">How we work</h2><p className="mt-2">Every engine starts from a published source: a Finance Act slab table, a Finance Division pay notification, a NEPRA tariff schedule, an OGRA price notification or a PM&amp;DC formula. Each calculator is unit-tested with worked examples, and when a rate is uncertain we say so on the tool instead of guessing. Calculations run in your browser — your figures are never stored.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Start with the most-used tools</h2><p className="mt-2">Try the <Link className="font-semibold text-emerald-700 underline" href="/salary/bps-salary-calculator">Government Salary Calculator</Link>, the <Link className="font-semibold text-emerald-700 underline" href="/tax/income-tax-calculator">FBR Income Tax Calculator</Link>, the <Link className="font-semibold text-emerald-700 underline" href="/electricity/electricity-bill-calculator">Electricity Bill Calculator</Link> and the <Link className="font-semibold text-emerald-700 underline" href="/education/mdcat-aggregate-calculator">MDCAT Aggregate Calculator</Link>.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Corrections</h2><p className="mt-2">Rates change every budget. If a number here disagrees with an official notification, send us the notification through the Contact page — corrections with a source are fixed first.</p></section>
      </div>
      )}
    </main>
  );
}
