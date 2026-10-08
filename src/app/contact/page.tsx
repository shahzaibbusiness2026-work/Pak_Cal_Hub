import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Pak Calc Hub',
  description: 'Report a wrong rate, request a calculator, or ask a question about Pak Calc Hub.',
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>The fastest way to reach the Pak Calc Hub team is a GitHub issue — it is public, tracked, and nothing gets lost:</p>
        <p><a className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800" href="https://github.com/shahzaibbusiness2026-work/Pak_Cal_Hub/issues" target="_blank" rel="noreferrer">Open an issue on GitHub</a></p>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Report a wrong rate (fastest fix)</h2><p className="mt-2">Tell us the tool name, the figure you expected, and — most important — the official source (notification number, gazette, FBR/NEPRA page or prospectus). Reports with a source are corrected first and credited in the fix.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Request a calculator</h2><p className="mt-2">Tell us what you calculate by hand today and how often. Tools that many Pakistanis repeat every month (bills, salary, fees, aggregates) are built first.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Please do not send</h2><p className="mt-2">Never send your CNIC number, bank details, passwords or tax login. No calculator on this site needs them, and we will never ask for them.</p></section>
      </div>
    </main>
  );
}
