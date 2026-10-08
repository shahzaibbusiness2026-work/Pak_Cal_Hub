import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | Pak Calc Hub',
  description: 'Terms for using Pak Calc Hub calculators: estimates only, official sources prevail, and fair-use rules.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Use</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: 9 October 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Estimates, not official decisions</h2><p className="mt-2">Every result on Pak Calc Hub is an estimate based on publicly notified schedules from bodies such as FBR, Finance Division, NEPRA, OGRA, PM&amp;DC and provincial departments at the date shown on the tool. Rates change with budgets, notifications and tariff determinations. A result here is <strong>not</strong> a tax assessment, bill, challan, merit list or legal/financial advice, and it never overrides the official figure issued by the relevant authority or a qualified professional.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Verify before you pay or apply</h2><p className="mt-2">Always confirm amounts on the official portal (for example e-Pay Punjab, PTA DIRBS, your DISCO, FBR IRIS or your university prospectus) before paying money or submitting an application based on a calculation.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Fair use</h2><p className="mt-2">You may use and share results for personal, educational and workplace planning. Do not scrape the site at abusive rates, misrepresent results as official documents, or use the tools to prepare fraudulent salary slips or certificates — generated documents are samples for planning, not proof of employment or income.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Availability and liability</h2><p className="mt-2">Tools are provided free and &quot;as is&quot;. We work to keep rates current and show the verified date on each tool, but we accept no liability for decisions made solely on an estimate. If you find a wrong rate, tell us via the Contact page and we will correct it with the official source.</p></section>
      </div>
    </main>
  );
}
