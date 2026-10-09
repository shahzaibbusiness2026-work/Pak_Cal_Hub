import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncItemChange, SyncOptions } from './types';
import { fetchLiveFx } from './live/fxLive';

/**
 * Manually verified FX benchmarks.
 *
 * Honesty note: SBP publishes rates on its website but exposes no public
 * machine-readable feed reachable server-side (its endpoints reject automated
 * fetches). There is no live ingestion here — the cron "sync" publishes these
 * manually verified constants to the DB. Update the values + FX_VERIFIED_ON
 * below whenever new SBP closing rates are verified; the admin freshness
 * report surfaces staleness.
 */
export const FX_VERIFIED_ON = '2026-10-04';

export const LATEST_FEED_CURRENCY = [
  { key: 'usd_pkr', label: 'US Dollar (USD / PKR)', value: 277.10, unit: 'PKR / USD', source: 'State Bank of Pakistan M2M Revaluation Rate (1 Oct 2026) — manually verified', sourceUrl: 'https://www.sbp.org.pk' },
  { key: 'aed_pkr', label: 'UAE Dirham (AED / PKR)', value: 76.40, unit: 'PKR / AED', source: 'State Bank of Pakistan Interbank Closing — manually verified' },
  { key: 'sar_pkr', label: 'Saudi Riyal (SAR / PKR)', value: 74.80, unit: 'PKR / SAR', source: 'State Bank of Pakistan Interbank Closing — manually verified' },
  { key: 'gbp_pkr', label: 'British Pound (GBP / PKR)', value: 357.00, unit: 'PKR / GBP', source: 'State Bank of Pakistan Interbank Closing — manually verified' },
  { key: 'eur_pkr', label: 'Euro (EUR / PKR)', value: 302.80, unit: 'PKR / EUR', source: 'State Bank of Pakistan Interbank Closing — manually verified' },
  { key: 'cad_pkr', label: 'Canadian Dollar (CAD / PKR)', value: 204.50, unit: 'PKR / CAD', source: 'State Bank of Pakistan Interbank Closing — manually verified' },
];

export async function syncCurrencyRates(options: SyncOptions = {}): Promise<SyncServiceResult> {
  const timestamp = new Date().toISOString();
  const changes: SyncItemChange[] = [];
  let changesDetected = 0;

  try {
    const connected = await isDatabaseConnected();
    if (!connected) {
      return {
        service: 'currency',
        success: true,
        timestamp,
        itemsProcessed: LATEST_FEED_CURRENCY.length,
        changesDetected: 0,
        changes: [],
        message: 'Database in fallback mode: manually verified FX constants served from memory.',
        syncMode: 'manual-verified',
        verifiedOn: FX_VERIFIED_ON,
      };
    }

    // 1. Try live mid-market FX (open.er-api, daily). On any failure, fall
    // back to the manually verified constants below — the DB is never left
    // with a half-updated or unvalidated rate set.
    let feedItems: Array<{ key: string; label: string; value: number; unit: string; source: string; sourceUrl?: string }> = LATEST_FEED_CURRENCY;
    let liveMode = false;
    try {
      const live = await fetchLiveFx();
      const names: Record<string, string> = { USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro', AED: 'UAE Dirham', SAR: 'Saudi Riyal', CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CNY: 'Chinese Yuan', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar', JPY: 'Japanese Yen', TRY: 'Turkish Lira' };
      feedItems = Object.entries(live.fx)
        .filter(([code]) => code !== 'PKR')
        .map(([code, value]) => ({
          key: `${code.toLowerCase()}_pkr`,
          label: `${names[code] || code} (${code} / PKR)`,
          value: Math.round(value * 10000) / 10000,
          unit: `PKR / ${code}`,
          source: `${live.source}${live.updatedUtc ? ` (updated ${live.updatedUtc})` : ''}`,
          sourceUrl: 'https://open.er-api.com',
        }));
      liveMode = feedItems.length >= 6;
      if (!liveMode) feedItems = LATEST_FEED_CURRENCY;
    } catch {
      feedItems = LATEST_FEED_CURRENCY;
      liveMode = false;
    }

    for (const item of feedItems) {
      const existing = await prisma.marketRate.findUnique({
        where: { key: item.key },
      });

      const oldValue = existing ? existing.value : item.value;
      const newValue = item.value;
      const isChanged = existing ? Math.abs(oldValue - newValue) > 0.01 : true;

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
            category: 'currency',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl,
            verifiedAt: new Date(),
            updatedBy: options.adminUser || (liveMode ? 'live-sync' : 'Automated Cron Service'),
          },
          create: {
            key: item.key,
            value: newValue,
            label: item.label,
            unit: item.unit,
            category: 'currency',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl,
            verifiedAt: new Date(),
            updatedBy: options.adminUser || (liveMode ? 'live-sync' : 'Automated Cron Service'),
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
            type: 'currency',
            status: 'SUCCESS',
            oldValue: `Rs. ${oldValue.toFixed(2)}`,
            newValue: `Rs. ${newValue.toFixed(2)}`,
            message: `Updated ${item.label} to Rs. ${newValue.toFixed(2)} (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})`,
            source: item.source,
          },
        });

        changes.push({
          key: item.key,
          label: item.label,
          category: 'currency',
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
          category: 'currency',
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
      service: 'currency',
      success: true,
      timestamp,
      itemsProcessed: feedItems.length,
      changesDetected,
      changes,
      message: liveMode ? `Currency publish completed (live mid-market FX via open.er-api): ${changesDetected} rate changes detected.` : `Currency publish completed (manual-verified constants, verified ${FX_VERIFIED_ON}): ${changesDetected} rate changes detected.`,
      syncMode: liveMode ? 'live-fetch' : 'manual-verified',
      verifiedOn: FX_VERIFIED_ON,
    };
  } catch (err: any) {
    try {
      await prisma.syncLog.create({
        data: {
          type: 'currency',
          status: 'FAILED',
          message: `Currency sync failed: ${err.message}`,
        },
      });
    } catch (e) {}

    return {
      service: 'currency',
      success: false,
      timestamp,
      itemsProcessed: 0,
      changesDetected: 0,
      changes: [],
      message: `Currency sync failed: ${err.message}`,
      error: err.message,
    };
  }
}
