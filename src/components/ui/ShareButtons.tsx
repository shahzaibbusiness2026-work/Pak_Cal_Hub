'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Twitter, Facebook, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
  title?: string;
  url?: string;
}

export default function ShareButtons({ title = 'Pakistan Calculation Hub', url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? (url || window.location.href) : 'https://pakcalchub.com';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(`${title} — Calculate accurately on Pak Calc Hub`);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" />
        Share Calculator:
      </span>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
      >
        <MessageCircle className="h-3.5 w-3.5 fill-current" />
        <span>WhatsApp</span>
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
      >
        <Facebook className="h-3.5 w-3.5 fill-current" />
        <span>Facebook</span>
      </a>

      {/* Twitter */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
      >
        <Twitter className="h-3.5 w-3.5 fill-current" />
        <span>X (Twitter)</span>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}
