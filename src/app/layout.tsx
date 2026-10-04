import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '../components/ui/ThemeRegistry';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Analytics from '../components/ui/Analytics';
import { SITE_URL, SITE_NAME, SITE_FULL_NAME } from '../lib/site';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_FULL_NAME} (${SITE_NAME}) | 100+ Free Pakistan Calculators 2026`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Free, accurate Pakistan calculators: RBPS-2026 Government Salary, FBR Income Tax 2026-27, NEPRA Electricity Bills, Solar Net Billing, Marla/Kanal conversions, MDCAT Aggregates, Zakat Nisab & KIBOR Loans. Updated October 2026.',
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
  authors: [{ name: SITE_FULL_NAME }],
  openGraph: {
    type: 'website',
    siteName: SITE_FULL_NAME,
    title: `${SITE_FULL_NAME} (${SITE_NAME}) | 100+ Free Pakistan Calculators 2026`,
    description:
      'Free, accurate Pakistan calculators: RBPS-2026 Government Salary, FBR Income Tax 2026-27, NEPRA Electricity Bills, Solar, Zakat, Pension & more. Updated October 2026.',
    url: SITE_URL,
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_FULL_NAME} | 100+ Free Pakistan Calculators 2026`,
    description:
      'Free, accurate Pakistan calculators: RBPS-2026 Salary, FBR Tax, Electricity Bills, Solar, Zakat, Pension & more.',
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_FULL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    description:
      'Free, accurate Pakistan calculators: RBPS-2026 Government Salary, FBR Income Tax, Electricity Bills, Solar, Zakat, Pension and more.',
    inLanguage: 'en-PK',
  };
  return (
    <html lang="en" className={`scroll-smooth ${sansFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
