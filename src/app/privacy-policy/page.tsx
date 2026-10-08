import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pak Calc Hub',
  description: 'How Pak Calc Hub handles your data: calculators run in your browser, what analytics we use, and your choices.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: 9 October 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Calculator data stays with you</h2><p className="mt-2">All calculators on Pak Calc Hub run entirely in your browser. The salary, tax, pension, marks, vehicle and other figures you type are <strong>not sent to or stored on our servers</strong>. Closing the page deletes them. Please do not type your CNIC number, bank account or passwords into any calculator — none of our tools need them, and our IBAN checker only validates the format of a number you enter locally.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">What we do collect</h2><p className="mt-2">If enabled, we use Google Analytics (GA4) to count anonymous page visits so we know which tools to improve. This uses cookies and reports pages viewed, device type and approximate city — never the values you enter into a calculator. Our blog/admin backend (Supabase) stores only content published by the site owner and admin login sessions.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Cookies</h2><p className="mt-2">We use essential cookies for theme/admin login and, if enabled, analytics cookies. You can block cookies in your browser; every calculator will still work.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Third parties</h2><p className="mt-2">Some checker tools link you to official portals (FBR, PTA, NEPRA/DISCOs, provincial Excise departments, NADRA). Once you leave our site, that authority&apos;s own privacy policy applies. We never sell personal data.</p></section>
        <section><h2 className="text-base font-bold text-slate-900 dark:text-white">Your choices & contact</h2><p className="mt-2">Because we do not store calculator inputs, there is nothing to delete on our side. For any privacy question, use the Contact page. If this policy changes, the new version will be posted here with a new date.</p></section>
      </div>
    </main>
  );
}
