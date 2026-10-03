import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncItemChange, SyncOptions } from './types';
import { DEFAULT_MARKET_RATES } from '../db/dataProvider';
import { fetchLiveFuel, LiveFuelResult } from './live/fuelLive';

/**
 * Fuel price sync — LIVE pipeline with validated fallback.
 *
 * Primary: autoones.com free fuel-prices API (no key), which republishes
 * OGRA-notified ex-depot prices. This is an AGGREGATOR, not OGRA itself —
 * provenance is recorded honestly on every DB row and in tool-sources.ts.
 *
 * Safety: the live payload is validated (range, freshness, petrol/diesel
 * ratio) in fetchLiveFuel(). On ANY fetch/validation failure the DB is left
 * untouched, the failure is recorded in SyncLog, and the previously stored
 * (or manually verified constant) values keep serving.
 *
 * CNG has no live source and remains a manually verified constant.
 */
export const FUEL_VERIFIED_ON = '2026-10-04';

export const LATEST_FEED_FUEL = [
  { key: 'petrol', label: 'Petrol (Super RON-92)', value: 392.76, unit: 'PKR / Litre', source: 'Petroleum Division & OGRA Notification (3 Oct 2026) — manually verified', sourceUrl: 'https://ogra.org.pk' },
  { key: 'diesel', label: 'High Speed Diesel (HSD)', value: 399.64, unit: 'PKR / Litre', source: 'Petroleum Division & OGRA Notification (3 Oct 2026) — manually verified', sourceUrl: 'https://ogra.org.pk' },
  { key: 'cng', label: 'CNG (Region I/II)', value: 215.00, unit: 'PKR / kg', source: 'All Pakistan CNG Association (APCNGA) — manually verified', sourceUrl: 'https://apcnga.org.pk' },
];

interface PublishItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  source: string;
  sourceUrl?: string;
  updatedBy: string;
  notes?: string;
}

/**
 * Synchronizes Fuel Prices with change detection, historical audit, and system alerts
 */
export async function syncFuelPrices(options: SyncOptions = {}): Promise<SyncServiceResult> {
  const timestamp = new Date().toISOString();
  const changes: SyncItemChange[] = [];
  let changesDetected = 0;

  try {
    const connected = await isDatabaseConnected();
    if (!connected) {
      return {
        service: 'fuel',
        success: true,
        timestamp,
        itemsProcessed: LATEST_FEED_FUEL.length,
        changesDetected: 0,
        changes: [],
        message: 'Database in fallback mode: manually verified fuel constants served from memory.',
        syncMode: 'manual-verified',
        verifiedOn: FUEL_VERIFIED_ON,
      };
    }

    // 1. Try the live feed first — validated inside fetchLiveFuel().
    let live: LiveFuelResult | null = null;
    let liveError: string | null = null;
    try {
      live = await fetchLiveFuel();
    } catch (err) {
      liveError = err instanceof Error ? err.message : String(err);
    }

    if (!live) {
      // Live fetch failed: keep every stored value untouched, record the failure.
      try {
        await prisma.syncLog.create({
          data: {
            type: 'fuel',
            status: 'FAILED',
            message: `Live fuel fetch failed — stored values kept: ${liveError}`,
            source: 'live-sync',
          },
        });
      } catch (e) {}
      return {
        service: 'fuel',
        success: false,
        timestamp,
        itemsProcessed: 0,
        changesDetected: 0,
        changes: [],
        message: `Live fuel fetch failed, stored values untouched: ${liveError}`,
        error: liveError || 'unknown live-fetch error',
        syncMode: 'manual-verified',
      };
    }

    const itemsToPublish: PublishItem[] = [
      {
        key: 'petrol',
        label: 'Petrol (Super RON-92)',
        value: live.petrol,
        unit: 'PKR / Litre',
        source: `Live via autoones.com fuel-prices API (republishes OGRA-notified ex-depot prices — aggregator, not OGRA itself). Upstream effective date: ${live.effectiveDate}.`,
        sourceUrl: live.sourceUrl,
        updatedBy: 'live-sync',
        notes: `autoones effective_date=${live.effectiveDate}; fetched ${timestamp}`,
      },
      {
        key: 'diesel',
        label: 'High Speed Diesel (HSD)',
        value: live.diesel,
        unit: 'PKR / Litre',
        source: `Live via autoones.com fuel-prices API (republishes OGRA-notified ex-depot prices — aggregator, not OGRA itself). Upstream effective date: ${live.effectiveDate}.`,
        sourceUrl: live.sourceUrl,
        updatedBy: 'live-sync',
        notes: `autoones effective_date=${live.effectiveDate}; fetched ${timestamp}`,
      },
      // CNG: no live source — manual constant as before.
      {
        key: 'cng',
        label: 'CNG (Region I/II)',
        value: LATEST_FEED_FUEL[2].value,
        unit: LATEST_FEED_FUEL[2].unit,
        source: LATEST_FEED_FUEL[2].source,
        sourceUrl: LATEST_FEED_FUEL[2].sourceUrl,
        updatedBy: options.adminUser || 'Automated Cron Service',
      },
    ];

    for (const item of itemsToPublish) {
      const existing = await prisma.marketRate.findUnique({
        where: { key: item.key },
      });

      const oldValue = existing ? existing.value : item.value;
      const newValue = item.value;
      const isChanged = existing ? Math.abs(oldValue - newValue) > 0.001 : true;

      if (isChanged || options.forceUpdate) {
        changesDetected++;
        const diff = newValue - oldValue;
        const pct = oldValue > 0 ? (diff / oldValue) * 100 : 0;

        // 1. Update MarketRate
        const updated = await prisma.marketRate.upsert({
          where: { key: item.key },
          update: {
            value: newValue,
            label: item.label,
            unit: item.unit,
            category: 'fuel',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl,
            verifiedAt: new Date(),
            updatedBy: item.updatedBy,
            notes: item.notes ?? undefined,
          },
          create: {
            key: item.key,
            value: newValue,
            label: item.label,
            unit: item.unit,
            category: 'fuel',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl,
            verifiedAt: new Date(),
            updatedBy: item.updatedBy,
            notes: item.notes ?? undefined,
          },
        });

        // 2. Save Historical Record in PriceHistory
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

        // 3. Log in SyncLog
        await prisma.syncLog.create({
          data: {
            type: 'fuel',
            status: 'SUCCESS',
            oldValue: `Rs. ${oldValue.toFixed(2)}`,
            newValue: `Rs. ${newValue.toFixed(2)}`,
            message: `Updated ${item.label} from Rs. ${oldValue.toFixed(2)} to Rs. ${newValue.toFixed(2)} (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})`,
            source: item.updatedBy === 'live-sync' ? 'live-sync' : item.source,
          },
        });

        // 4. Create in-app system notification
        if (Math.abs(diff) > 0.01) {
          await prisma.systemNotification.create({
            data: {
              title: `Fuel Price Update: ${item.label}`,
              message: `${item.label} has been updated to Rs. ${newValue.toFixed(2)} / ${item.unit} as per the latest OGRA-notified price.`,
              type: diff > 0 ? 'WARNING' : 'INFO',
              category: 'fuel',
              linkUrl: '/vehicles/fuel-cost-calculator',
            },
          });
        }

        changes.push({
          key: item.key,
          label: item.label,
          category: 'fuel',
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
          category: 'fuel',
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
      service: 'fuel',
      success: true,
      timestamp,
      itemsProcessed: itemsToPublish.length,
      changesDetected,
      changes,
      message: `Fuel sync completed (live via autoones.com, upstream effective ${live.effectiveDate}): ${changesDetected} rate changes detected.`,
      syncMode: 'live-fetch',
      verifiedOn: new Date().toISOString().slice(0, 10),
    };
  } catch (err: any) {
    // Log failure
    try {
      await prisma.syncLog.create({
        data: {
          type: 'fuel',
          status: 'FAILED',
          message: `Fuel sync failed: ${err.message}`,
        },
      });
    } catch (e) {}

    return {
      service: 'fuel',
      success: false,
      timestamp,
      itemsProcessed: 0,
      changesDetected: 0,
      changes: [],
      message: `Fuel sync failed: ${err.message}`,
      error: err.message,
    };
  }
}
