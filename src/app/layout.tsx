import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeRegistry from '../components/ui/ThemeRegistry';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Pakistan Calculator Hub (Pak Calc Hub) | 100+ Free Pakistan Calculators',
  description:
    'Free, accurate Pakistan calculators for BPS Government Salary, FBR Income Tax 2024-2026, WAPDA Electricity Bills, Solar Sizing, Marla/Kanal Land conversions, MDCAT Entry Test Aggregates, Zakat Nisab & KIBOR Loans.',
  keywords: [
    'Pakistan Calculator Hub',
    'BPS Salary Calculator',
    'FBR Income Tax 2024-2025',
    'Pakistan Electricity Bill Calculator',
    'Marla to Sq Ft Calculator',
    'MDCAT Aggregate Calculator',
    'Zakat Calculator Pakistan',
    'Solar Calculator Pakistan',
  ],
  authors: [{ name: 'Pakistan Calculator Hub' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col justify-between">
        <ThemeRegistry>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
