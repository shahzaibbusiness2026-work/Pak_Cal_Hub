'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Bell, Sparkles, Send } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Tax Alerts',
    'NEPRA Tariffs',
    'Salary Budget',
  ]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white shadow-2xl">
        {/* Background ambient lighting accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
          {/* Left Column: Heading and Topic Chips */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/40 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Bell className="h-3.5 w-3.5 text-emerald-400" />
              <span>Official Pakistani Notifications & Tariff Updates</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Stay Informed on Tax Slabs, NEPRA Tariffs & Salary Budget Notifications
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Get immediate alerts whenever FBR amends income tax brackets, NEPRA notifies quarterly fuel price adjustments, or the Federal Government announces civil service ad-hoc relief allowances.
            </p>

            {/* Interest Topics Toggle Chips */}
            <div className="pt-2">
              <span className="text-xs font-medium text-slate-400 block mb-2">
                Choose your alert categories:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Tax Alerts',
                  'NEPRA Tariffs',
                  'Salary Budget',
                  'Gold Sarafa Rates',
                  'MDCAT & ECAT',
                  'SBP KIBOR Rates',
                ].map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Subscription Box */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 backdrop-blur-md">
              {subscribed ? (
                <div className="flex flex-col items-center py-6 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-400 ring-4 ring-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">You&apos;re on the List!</h3>
                  <p className="text-xs text-slate-300 max-w-xs">
                    We will send verified updates regarding {selectedTopics.join(', ')} to <span className="text-emerald-400 font-semibold">{email}</span>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-email" className="text-xs font-semibold text-slate-200">
                      Enter your Email Address
                    </label>
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        id="newsletter-email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="block w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-emerald-600 transition-all cursor-pointer"
                  >
                    <span>Subscribe to Updates</span>
                    <Send className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>100% Free. No spam. Unsubscribe at any time.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
