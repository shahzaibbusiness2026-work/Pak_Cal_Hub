'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2, Printer } from 'lucide-react';

interface ExportActionButtonsProps {
  title: string;
  resultSummary: string;
}

export default function ExportActionButtons({ title, resultSummary }: ExportActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${title} Result - Pak Calc Hub\n${resultSummary}\nCalculate yours at: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`*${title}*\n${resultSummary}\nCheck full calculation on Pak Calc Hub:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
      <button
        onClick={handleCopy}
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-800 active:scale-95 transition-all touch-manipulation dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-800" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
      </button>

      <button
        onClick={handleWhatsAppShare}
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 active:scale-95 transition-all touch-manipulation dark:bg-emerald-950/60 dark:text-emerald-300"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share WhatsApp</span>
      </button>

      <button
        onClick={handlePrint}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-800 active:scale-95 transition-all touch-manipulation dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      >
        <Printer className="h-3.5 w-3.5" />
        <span>Print Statement</span>
      </button>
    </div>
  );
}
