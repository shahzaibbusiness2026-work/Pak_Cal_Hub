import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getCalculatorBySlug, getCategoryById, ALL_CALCULATORS } from '../../../lib/data/categories';
import DynamicCalculator from '../../../components/calculators/DynamicCalculator';
import CalculatorCard from '../../../components/ui/CalculatorCard';
import { ChevronRight, Home, ShieldCheck, Sparkles, BookOpen, HelpCircle, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CalculatorPageProps {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  return ALL_CALCULATORS.map((calc) => ({
    category: calc.category,
    slug: calc.slug,
  }));
}

export async function generateMetadata({ params }: CalculatorPageProps): Promise<Metadata> {
  const calculator = getCalculatorBySlug(params.slug);
  if (!calculator) return { title: 'Calculator Not Found' };

  return {
    title: `${calculator.metaTitle} | Pak Calc Hub`,
    description: calculator.metaDescription,
    keywords: calculator.tags,
    openGraph: {
      title: `${calculator.title} | Pak Calc Hub`,
      description: calculator.description,
      type: 'website',
      url: `https://pakcalchub.com/${calculator.category}/${calculator.slug}`,
    },
    alternates: {
      canonical: `https://pakcalchub.com/${calculator.category}/${calculator.slug}`,
    },
  };
}

export default function CalculatorPage({ params }: CalculatorPageProps) {
  const calculator = getCalculatorBySlug(params.slug);
  const category = getCategoryById(params.category);

  if (!calculator || !category) notFound();

  // Related calculators in same category
  const relatedCalculators = category.tools
    .filter((t) => t.slug !== calculator.slug)
    .slice(0, 3);

  // SEO Schema Generation (WebApplication + FAQPage)
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calculator.title,
    description: calculator.description,
    url: `https://pakcalchub.com/${calculator.category}/${calculator.slug}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PKR',
    },
    dateModified: '2026-08-28',
    publisher: {
      '@type': 'Organization',
      name: 'Pak Calc Hub',
      url: 'https://pakcalchub.com',
    },
  };

  const faqSchema = calculator.faqs && calculator.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: calculator.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      {/* Structured SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-800 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href={`/${category.slug}`} className="hover:text-emerald-800">
            {category.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold dark:text-white truncate">
            {calculator.shortTitle || calculator.title}
          </span>
        </nav>

        {/* Calculator Header Title Banner */}
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {category.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Verified Official Gazette Rules
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Updated: August 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
            {calculator.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {calculator.description}
          </p>
        </div>

        {/* Main Interactive Calculation Engine Workspace */}
        <DynamicCalculator slug={calculator.slug} />

        {/* Context Guide & Methodological Transparency */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Calculation Transparency & Statutory Rules
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                This calculation engine is modeled directly on official notifications from the <strong>Finance Division Government of Pakistan</strong>, <strong>Provincial Finance Departments (Punjab, Sindh, KPK, Balochistan)</strong>, and the <strong>Federal Board of Revenue (FBR)</strong>. All computations execute on client-side state in real time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Supports Multi-Government rules (Federal, Punjab, Sindh, KPK, Balochistan)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Multi-Year comparison (2024-25, 2025-26, 2026-27 RBPS)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Official Appendix I Commutation purchase factors</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero server data retention — 100% client-side privacy</span>
                </div>
              </div>
            </div>

            {/* FAQs Accordion/List if present */}
            {calculator.faqs && calculator.faqs.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {calculator.faqs.map((faq, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {faq.question}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Tools Sidebar */}
          {relatedCalculators.length > 0 && (
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Related {category.name} Tools
              </h3>
              <div className="space-y-3">
                {relatedCalculators.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/${rel.category}/${rel.slug}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-600/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-800">
                      {rel.title}
                    </h4>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {rel.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
