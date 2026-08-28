'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 text-xs sm:text-sm"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
