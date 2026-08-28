import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '../components/ui/ThemeRegistry';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Analytics from '../components/ui/Analytics';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Pakistan Calculator Hub (Pak Calc Hub) | 100+ Free Pakistan Calculators 2026',
  description:
    'Free, accurate Pakistan calculators: RBPS-2026 Government Salary, FBR Income Tax 2026-27, NEPRA Electricity Bills, Solar Net Billing, Marla/Kanal conversions, MDCAT Aggregates, Zakat Nisab & KIBOR Loans. Updated August 2026.',
  keywords: [
    'Pakistan Calculator Hub',
    'BPS Salary Calculator 2026',
    'RBPS 2026 Pay Scale',
    'FBR Income Tax 2026 2027',
    'Pakistan Electricity Bill Calculator',
    'Solar Calculator Pakistan 2026',
    'Marla to Sq Ft Calculator',
    'MDCAT Aggregate Calculator 2026',
    'Zakat Calculator Pakistan',
    'Pension Calculator Pakistan',
    'Freelancer Tax Pakistan',
    'Pak Calc Hub',
  ],
  authors: [{ name: 'Pakistan Calculator Hub' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${sansFont.variable} ${monoFont.variable}`}>
      <body className="min-h-screen flex flex-col justify-between font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <Analytics />
        <ThemeRegistry>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
