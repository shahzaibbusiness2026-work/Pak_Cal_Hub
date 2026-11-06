'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Fuel, Coins, DollarSign, Gem } from 'lucide-react';

interface RatesPayload {
  petrol: number;
  diesel: number;
  gold24kTola: number;
  silverTola: number;
  usdPkr: number;
  asOf: string;
  live: boolean;
  sources: Record<string, string>;
  liveByRate: Record<string, boolean>;
  asOfByRate: Record<string, string>;
}

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('en-PK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export default function LiveRatesStrip() {
  const [data, setData] = useState<RatesPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetch('/api/rates/live', { cache: 'no-store', signal: AbortSignal.timeout(12000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad'))))
      .then((d) => {
        if (!cancelled) { setData(d as RatesPayload); setFailed(false); }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setData((previous) => previous ? { ...previous, live: false, liveByRate: {} } : previous);
        }
      });
    load();
    const interval = setInterval(load, 300000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (failed && !data) return null;

  const tiles = data
    ? [
        { key: 'petrol', icon: Fuel, label: 'Petrol (per litre)', value: `Rs ${fmt(data.petrol)}`, href: '/vehicles/fuel-cost-calculator' },
        { key: 'diesel', icon: Fuel, label: 'Diesel (per litre)', value: `Rs ${fmt(data.diesel)}`, href: '/vehicles/fuel-cost-calculator' },
        { key: 'gold24kTola', icon: Coins, label: 'Gold 24K (per tola)', value: `Rs ${fmt(data.gold24kTola, 0)}`, href: '/data-tools/gold-price-calculator' },
        { key: 'usdPkr', icon: DollarSign, label: 'USD to PKR', value: `Rs ${fmt(data.usdPkr)}`, href: '/currency/pkr-currency-converter' },
        { key: 'silverTola', icon: Gem, label: 'Silver (per tola)', value: `Rs ${fmt(data.silverTola, 0)}`, href: '/islamic/zakat-calculator' },
      ]
    : [];

  return (
    <section aria-label="Today's live rates in Pakistan" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-emerald-900/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider text-emerald-200">
            <span className="live-dot" aria-hidden="true" />
            Today&apos;s Rates in Pakistan
          </h2>
          <span className="text-[11px] font-semibold text-emerald-300/80">
            {data
              ? `${data.live ? 'Live sources available' : 'Saved reference rates'} · source dates on each card`
              : 'Loading latest rates…'}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
          {data
            ? tiles.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="group rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200/85">
                    <t.icon className="h-3.5 w-3.5 text-emerald-400" />
                    {t.label}
                  </span>
                  <span className="mt-1.5 block font-mono text-base sm:text-lg font-bold text-white tnum group-hover:text-emerald-200">
                    {t.value}
                  </span>
                  <span className="mt-1 block text-[10px] text-emerald-200/75">
                    {data.liveByRate?.[t.key] ? 'Live reference' : 'Saved reference'}
                    {data.asOfByRate?.[t.key] && ` · ${new Date(data.asOfByRate[t.key]).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', timeZone: 'Asia/Karachi' })}`}
                  </span>
                </Link>
              ))
            : [0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[74px] animate-pulse rounded-2xl bg-white/5 ring-1 ring-white/10" />
              ))}
        </div>
        <p className="mt-3.5 text-[11px] leading-relaxed text-emerald-200/70">
          Fuel follows the upstream published price. Gold and silver are indicative spot/FX conversions; retail Sarafa rates can differ.
          Each card shows its source date and whether it uses a live or saved reference.
        </p>
      </div>
    </section>
  );
}
