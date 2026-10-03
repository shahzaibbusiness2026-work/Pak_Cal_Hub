import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncItemChange, SyncOptions } from './types';
import { fetchLiveMetals, LiveMetalResult } from './live/metalLive';

/**
 * Bullion rate sync — LIVE pipeline with validated fallback.
 *
 * Primary: DERIVED indicative rates from international XAU/XAG spot × USD/PKR
 * (free, no-key public APIs — see src/lib/sync/live/metalLive.ts for the
 * documented formula: PKR/tola = usdPerTroyOz × usdPkr × 0.375 × 1.02).
 *
 * This is NOT the official All Pakistan Sarafa Gems & Jewellers Association
 * (APSGJA) announcement — the sarafa market publishes no machine-readable
 * feed. Every row and UI surface labels the derived rate as indicative.
 *
 * Safety: the live payload is validated (spot/FX ranges, ±12% jump guard vs
 * stored values) in fetchLiveMetals(). On ANY fetch/validation failure the DB
 * is left untouched, the failure is recorded in SyncLog, and previously
 * stored (or manually verified constant) values keep serving.
 */
export const GOLD_VERIFIED_ON = '2026-10-04';

export const LATEST_FEED_GOLD = [
  { key: 'gold_24k_tola', label: 'Gold 24K (per Tola)', value: 440636, unit: 'PKR / Tola (11.66g)', source: 'All Pakistan Sarafa Gems and Jewellers Association — manually verified' },
  { key: 'gold_22k_tola', label: 'Gold 22K (per Tola)', value: 403916, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark — derived from 24K' },
  { key: 'gold_21k_tola', label: 'Gold 21K (per Tola)', value: 385557, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark — derived from 24K' },
  { key: 'gold_18k_tola', label: 'Gold 18K (per Tola)', value: 330477, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark — derived from 24K' },
  { key: 'silver_tola', label: 'Silver (per Tola)', value: 6528, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark — manually verified' },
];

interface PublishItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  source: string;
  sourceUrl?: string;
  notes?: string;
}

export async function syncGoldRates(options: SyncOptions = {}): Promise<SyncServiceResult> {
  const timestamp = new Date().toISOString();
  const changes: SyncItemChange[] = [];
  let changesDetected = 0;

  try {
    const connected = await isDatabaseConnected();
    if (!connected) {
      return {
        service: 'gold',
        success: true,
        timestamp,
        itemsProcessed: LATEST_FEED_GOLD.length,
        changesDetected: 0,
        changes: [],
        message: 'Database in fallback mode: manually verified gold constants served from memory.',
        syncMode: 'manual-verified',
        verifiedOn: GOLD_VERIFIED_ON,
      };
    }

    // Current stored values feed the ±12% jump guard in fetchLiveMetals().
    const [storedGold, storedSilver] = await Promise.all([
      prisma.marketRate.findUnique({ where: { key: 'gold_24k_tola' } }),
      prisma.marketRate.findUnique({ where: { key: 'silver_tola' } }),
    ]);

    // 1. Try the live derived feed first — validated inside fetchLiveMetals().
    let live: LiveMetalResult | null = null;
    let liveError: string | null = null;
    try {
      live = await fetchLiveMetals(
        storedGold?.value,
        storedSilver?.value
      );
    } catch (err) {
      liveError = err instanceof Error ? err.message : String(err);
    }

    if (!live) {
      // Live fetch failed: keep every stored value untouched, record the failure.
      try {
        await prisma.syncLog.create({
          data: {
            type: 'gold',
            status: 'FAILED',
            message: `Live bullion fetch failed — stored values kept: ${liveError}`,
            source: 'live-sync',
          },
        });
      } catch (e) {}
      return {
        service: 'gold',
        success: false,
        timestamp,
        itemsProcessed: 0,
        changesDetected: 0,
        changes: [],
        message: `Live bullion fetch failed, stored values untouched: ${liveError}`,
        error: liveError || 'unknown live-fetch error',
        syncMode: 'manual-verified',
      };
    }

    const liveSource =
      'Live derived rate (indicative): international XAU/XAG spot × USD/PKR — not the official APGJSA sarafa announcement, which may differ slightly.';
    const provenance = `XAU $${live.xauUsd.toFixed(2)}/oz, XAG $${live.xagUsd.toFixed(2)}/oz, USD/PKR ${live.usdPkr.toFixed(2)}; formula PKR/tola = spot × FX × 0.375 × 1.02; fetched ${timestamp}`;

    const g24 = live.goldTola;
    const itemsToPublish: PublishItem[] = [
      { key: 'gold_24k_tola', label: 'Gold 24K (per Tola)', value: g24, unit: 'PKR / Tola (11.66g)', source: liveSource, notes: provenance },
      { key: 'gold_22k_tola', label: 'Gold 22K (per Tola)', value: Math.round((g24 * 22) / 24), unit: 'PKR / Tola', source: 'Derived from live 24K rate (22/24 purity factor) — indicative', notes: provenance },
      { key: 'gold_21k_tola', label: 'Gold 21K (per Tola)', value: Math.round((g24 * 21) / 24), unit: 'PKR / Tola', source: 'Derived from live 24K rate (21/24 purity factor) — indicative', notes: provenance },
      { key: 'gold_18k_tola', label: 'Gold 18K (per Tola)', value: Math.round((g24 * 18) / 24), unit: 'PKR / Tola', source: 'Derived from live 24K rate (18/24 purity factor) — indicative', notes: provenance },
      { key: 'silver_tola', label: 'Silver (per Tola)', value: live.silverTola, unit: 'PKR / Tola', source: liveSource, notes: provenance },
    ];

    for (const item of itemsToPublish) {
      const existing = await prisma.marketRate.findUnique({
        where: { key: item.key },
      });

      const oldValue = existing ? existing.value : item.value;
      const newValue = item.value;
      const isChanged = existing ? Math.abs(oldValue - newValue) > 1 : true;

      if (isChanged || options.forceUpdate) {
        changesDetected++;
        const diff = newValue - oldValue;
        const pct = oldValue > 0 ? (diff / oldValue) * 100 : 0;

        const updated = await prisma.marketRate.upsert({
          where: { key: item.key },
          update: {
            value: newValue,
            label: item.label,
            unit: item.unit,
            category: 'gold',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl ?? undefined,
            verifiedAt: new Date(),
            updatedBy: 'live-sync',
            notes: item.notes ?? undefined,
          },
          create: {
            key: item.key,
            value: newValue,
            label: item.label,
            unit: item.unit,
            category: 'gold',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl ?? undefined,
            verifiedAt: new Date(),
            updatedBy: 'live-sync',
            notes: item.notes ?? undefined,
          },
        });

        await prisma.priceHistory.create({
          data: {
            marketRateId: updated.id,
            rateKey: item.key,
            previousVal: oldValue,
            newVal: newValue,
            changeAmount: diff,
            changePct: pct,
            source: item.source,
          },
        });

        await prisma.syncLog.create({
          data: {
            type: 'gold',
            status: 'SUCCESS',
            oldValue: `Rs. ${oldValue.toLocaleString()}`,
            newValue: `Rs. ${newValue.toLocaleString()}`,
            message: `Updated ${item.label} to Rs. ${newValue.toLocaleString()} (${diff >= 0 ? '+' : ''}${diff.toLocaleString()})`,
            source: 'live-sync',
          },
        });

        changes.push({
          key: item.key,
          label: item.label,
          category: 'gold',
          oldValue,
          newValue,
          difference: diff,
          percentChange: pct,
          unit: item.unit,
          source: item.source,
          status: 'UPDATED',
        });
      } else {
        changes.push({
          key: item.key,
          label: item.label,
          category: 'gold',
          oldValue,
          newValue,
          difference: 0,
          percentChange: 0,
          unit: item.unit,
          source: item.source,
          status: 'UNCHANGED',
        });
      }
    }

    return {
      service: 'gold',
      success: true,
      timestamp,
      itemsProcessed: itemsToPublish.length,
      changesDetected,
      changes,
      message: `Gold sync completed (live derived from XAU $${live.xauUsd.toFixed(2)} × USD/PKR ${live.usdPkr.toFixed(2)}): ${changesDetected} rate changes detected.`,
      syncMode: 'live-fetch',
      verifiedOn: new Date().toISOString().slice(0, 10),
    };
  } catch (err: any) {
    try {
      await prisma.syncLog.create({
        data: {
          type: 'gold',
          status: 'FAILED',
          message: `Gold sync failed: ${err.message}`,
        },
      });
    } catch (e) {}

    return {
      service: 'gold',
      success: false,
      timestamp,
      itemsProcessed: 0,
      changesDetected: 0,
      changes: [],
      message: `Gold sync failed: ${err.message}`,
      error: err.message,
    };
  }
}
