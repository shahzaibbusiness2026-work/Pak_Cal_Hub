/**
 * Live rate pipeline tests — src/lib/sync/live/* and /api/rates/live shape.
 *
 * All network is mocked: fetchLiveFuel/fetchLiveMetals accept an injectable
 * fetch implementation, and the /api/rates/live shape is tested through the
 * pure buildLiveRatesResponse(). No real network calls happen in this file.
 *
 * Run: npx tsx src/tests/live-rates.test.ts
 */

import { fetchLiveFuel } from '../lib/sync/live/fuelLive';
import { fetchLiveFx } from '../lib/sync/live/fxLive';
import { fetchLiveMetals, tolaFromSpot } from '../lib/sync/live/metalLive';
import { buildLiveRatesResponse } from '../lib/sync/live/liveRatesPayload';
import { LiveFetchError } from '../lib/sync/live/http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function assertRejects(fn: () => Promise<unknown>, message: string) {
  try {
    await fn();
  } catch (err) {
    if (err instanceof LiveFetchError) {
      console.log(`✅ PASS: ${message} (rejected: ${err.kind} — ${err.message.slice(0, 90)})`);
      return;
    }
    throw new Error(`❌ TEST FAILED: ${message} — rejected with unexpected error: ${String(err)}`);
  }
  throw new Error(`❌ TEST FAILED: ${message} — did NOT reject`);
}

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const goodFuelMock = async () => ({
  prices: [
    { fuel: 'Petrol', slug: 'petrol', price_pkr: 392.76, effective_date: daysAgo(2) },
    { fuel: 'Diesel', slug: 'diesel', price_pkr: 399.64, effective_date: daysAgo(2) },
  ],
  source: 'OGRA notified prices, Government of Pakistan',
});

const goodMetalMock = async () => ({
  // default mock ignores the URL; each test below overrides per-endpoint
});

async function runLiveRatesTests() {
  console.log('\n======================================================');
  console.log('📡 LIVE RATE PIPELINE TESTS (mocked network)');
  console.log('======================================================\n');

  // ── 1. fuelLive: good data passes ──────────────────────────────────────────
  const fuel = await fetchLiveFuel(goodFuelMock);
  assert(fuel.petrol === 392.76 && fuel.diesel === 399.64, 'fuelLive accepts good data (392.76 / 399.64)');
  assert(fuel.source.includes('autoones.com') && fuel.source.includes('not OGRA itself'), 'fuelLive provenance labels the aggregator honestly');

  // ── 2. fuelLive: out-of-range price rejected ───────────────────────────────
  await assertRejects(
    () => fetchLiveFuel(async () => ({ prices: [{ slug: 'petrol', price_pkr: 50, effective_date: daysAgo(1) }, { slug: 'diesel', price_pkr: 399.64, effective_date: daysAgo(1) }] })),
    'fuelLive rejects out-of-range petrol price (50 PKR/L)'
  );

  // ── 3. fuelLive: stale effective_date rejected ─────────────────────────────
  await assertRejects(
    () => fetchLiveFuel(async () => ({ prices: [{ slug: 'petrol', price_pkr: 392.76, effective_date: daysAgo(30) }, { slug: 'diesel', price_pkr: 399.64, effective_date: daysAgo(30) }] })),
    'fuelLive rejects stale effective_date (30 days old)'
  );

  // ── 4. fuelLive: malformed payload rejected ────────────────────────────────
  await assertRejects(
    () => fetchLiveFuel(async () => ({ nope: true }) as any),
    'fuelLive rejects malformed payload (missing prices array)'
  );

  // ── 5. fuelLive: implausible petrol/diesel ratio rejected ──────────────────
  await assertRejects(
    () => fetchLiveFuel(async () => ({ prices: [{ slug: 'petrol', price_pkr: 500, effective_date: daysAgo(1) }, { slug: 'diesel', price_pkr: 200, effective_date: daysAgo(1) }] })),
    'fuelLive rejects implausible petrol/diesel ratio (500 vs 200)'
  );

  // ── 6. Formula math: XAU 4141.80 × USD/PKR 276.82 × 0.375 × 1.02 ───────────
  // 4141.80 × 276.82 = 1,146,533.08; × 0.375 = 429,949.90; × 1.02 ≈ 438,549
  const derived = tolaFromSpot(4141.8, 276.82);
  assert(Math.abs(derived - 438549) < 1, `tolaFromSpot(4141.80, 276.82) ≈ 438,549 (got ${derived.toFixed(2)})`);

  // ── 7. metalLive: good data passes, values match the formula ───────────────
  const metalMock = async (url: string) => {
    if (url.includes('XAU')) return { price: 4141.8, currency: 'USD', updatedAt: '2026-10-03T21:29:33Z' };
    if (url.includes('XAG')) return { price: 60.524, currency: 'USD', updatedAt: '2026-10-03T21:29:33Z' };
    return { rates: { PKR: 276.82 }, time_last_update_utc: 'Sat, 03 Oct 2026 00:02:32 +0000' };
  };
  const metals = await fetchLiveMetals(440636, 6528, metalMock);
  assert(metals.goldTola === Math.round(tolaFromSpot(4141.8, 276.82)), 'metalLive gold matches formula (rounded)');
  assert(metals.silverTola === Math.round(tolaFromSpot(60.524, 276.82)), 'metalLive silver matches formula (rounded)');
  assert(metals.usdPkr === 276.82, 'metalLive returns USD/PKR');
  assert(metals.source.includes('indicative') && metals.source.includes('APGJSA'), 'metalLive provenance is honest (indicative, not APGJSA)');

  // ── 8. metalLive: ±12% spike guard rejects ─────────────────────────────────
  // XAU 5000 → 5000×276.82×0.375×1.02 = 529,544 vs stored 440,636 = +20.2%
  const spikeMock = async (url: string) => {
    if (url.includes('XAU')) return { price: 5000, currency: 'USD' };
    if (url.includes('XAG')) return { price: 60.524, currency: 'USD' };
    return { rates: { PKR: 276.82 } };
  };
  await assertRejects(
    () => fetchLiveMetals(440636, 6528, spikeMock),
    'metalLive ±12% guard rejects a +20% gold spike'
  );

  // ── 9. metalLive: XAU out of range rejected ─────────────────────────────────
  const badXauMock = async (url: string) => {
    if (url.includes('XAU')) return { price: 1500, currency: 'USD' };
    if (url.includes('XAG')) return { price: 60.524, currency: 'USD' };
    return { rates: { PKR: 276.82 } };
  };
  await assertRejects(
    () => fetchLiveMetals(undefined, undefined, badXauMock),
    'metalLive rejects XAU spot 1500 (below 2000 floor)'
  );

  // ── 10. metalLive: ±12% guard skipped when no stored baseline ──────────────
  const noBaseline = await fetchLiveMetals(undefined, undefined, metalMock);
  assert(noBaseline.goldTola === Math.round(tolaFromSpot(4141.8, 276.82)), 'metalLive works with no stored baseline (guard skipped)');

  // ── 11. /api/rates/live fallback shape ─────────────────────────────────────
  const fallback = buildLiveRatesResponse([]);
  assert(
    fallback.petrol === 392.76 && fallback.diesel === 399.64 && fallback.gold24kTola === 440636 && fallback.silverTola === 6528 && fallback.usdPkr === 277.1,
    'live endpoint fallback serves hardcoded constants'
  );
  assert(fallback.live === false, 'live endpoint fallback reports live=false');
  assert(typeof fallback.asOf === 'string' && Object.keys(fallback.sources).length === 5, 'live endpoint shape has asOf + 5 sources');

  // ── 12. /api/rates/live with live-sync rows ────────────────────────────────
  const liveRows: any[] = [
    { key: 'petrol', value: 395.1, source: 'Live via autoones.com', verifiedAt: new Date('2026-10-04T06:00:00Z'), updatedBy: 'live-sync' },
    { key: 'diesel', value: 401.2, source: 'Live via autoones.com', verifiedAt: new Date('2026-10-04T06:00:00Z'), updatedBy: 'live-sync' },
    { key: 'gold_24k_tola', value: 438549, source: 'Live derived rate (indicative)', verifiedAt: new Date('2026-10-04T06:00:00Z'), updatedBy: 'live-sync' },
    { key: 'silver_tola', value: 6408, source: 'Live derived rate (indicative)', verifiedAt: new Date('2026-10-04T06:00:00Z'), updatedBy: 'live-sync' },
    { key: 'usd_pkr', value: 276.82, source: 'open.er-api.com', verifiedAt: new Date('2026-10-04T06:00:00Z'), updatedBy: 'live-sync' },
  ];
  const livePayload = buildLiveRatesResponse(liveRows);
  assert(livePayload.live === true, 'live endpoint reports live=true when rows are live-synced');
  assert(livePayload.petrol === 395.1 && livePayload.gold24kTola === 438549, 'live endpoint serves DB values over fallbacks');

  // ── 13. fxLive: good data converts every code to PKR-per-unit ─────────────
  const fxMock = async () => ({
    result: 'success',
    rates: { PKR: 278.4, USD: 1, GBP: 0.7435, EUR: 0.8612, AED: 3.6725, SAR: 3.75, CAD: 1.3931, AUD: 1.5239, CNY: 7.1188, QAR: 3.64, KWD: 0.3081, JPY: 153.21, TRY: 41.52 },
    time_last_update_utc: 'Fri, 09 Oct 2026 00:02:31 +0000',
  });
  const fx = await fetchLiveFx(fxMock);
  assert(fx.usdPkr === 278.4 && fx.fx.USD === 278.4 && fx.fx.PKR === 1, 'fxLive anchors USD/PKR from open.er-api');
  assert(Math.abs(fx.fx.GBP - 278.4 / 0.7435) < 1e-9 && Math.abs(fx.fx.JPY - 278.4 / 153.21) < 1e-9, 'fxLive derives PKR-per-unit for GBP and JPY correctly');
  assert(fx.source.includes('indicative') && fx.source.includes('not the SBP'), 'fxLive provenance is honest (mid-market, not SBP)');

  // ── 14. fxLive: garbage anchor rejected ───────────────────────────────────
  await assertRejects(() => fetchLiveFx(async () => ({ rates: { PKR: 25 } })), 'fxLive rejects absurd USD/PKR (25)');

  // ── 15. Payload overlay: live values beat stored fallbacks ────────────────
  const overlaid = buildLiveRatesResponse([], { petrol: 395.5, fx: { PKR: 1, USD: 278.4 }, usdPkr: 278.4 });
  assert(overlaid.petrol === 395.5 && overlaid.usdPkr === 278.4 && overlaid.fx.USD === 278.4 && overlaid.live === true, 'live endpoint overlay wins over fallbacks and flags live=true');

  console.log('\n======================================================');
  console.log('🎉 ALL LIVE RATE PIPELINE TESTS PASSED');
  console.log('======================================================\n');
}

runLiveRatesTests().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
