'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, User, Sparkles } from 'lucide-react';
import { ARTICLES_DATA } from '../../lib/data/articles-data';

export default function ArticlesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-5 dark:border-slate-800 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <BookOpen className="h-4 w-4" />
            <span>Guides & Knowledge Base</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Latest Pakistan Financial Guides & Articles
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Authoritative explanations of tax laws, government pay rules, solar economics, and property standards
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES_DATA.map((article) => (
          <article
            key={article.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div>
              {/* Category Badge & Read Time */}
              <div className="flex items-center justify-between text-[11px] mb-3.5">
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 ring-1 ring-emerald-600/10 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold leading-snug text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-400 transition-colors">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
            </div>

            {/* Bottom Meta & Read Action */}
            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">{article.author}</span>
                </div>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 group-hover:underline dark:text-emerald-400">
                  <span>Read Guide</span>
                  <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
