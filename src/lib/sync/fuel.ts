import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncItemChange, SyncOptions } from './types';
import { DEFAULT_MARKET_RATES } from '../db/dataProvider';

/**
 * Manually verified fuel benchmarks.
 *
 * Honesty note: OGRA / the Petroleum Division publish price notifications as
 * human-readable notices, not a machine-readable feed. There is no live
 * ingestion here — the cron "sync" publishes these manually verified
 * constants to the DB. Update the values + VERIFIED_ON below whenever a new
 * notification is issued; the admin freshness report surfaces staleness.
 */
export const FUEL_VERIFIED_ON = '2026-10-04';

export const LATEST_FEED_FUEL = [
  { key: 'petrol', label: 'Petrol (Super RON-92)', value: 392.76, unit: 'PKR / Litre', source: 'Petroleum Division & OGRA Notification (3 Oct 2026) — manually verified', sourceUrl: 'https://ogra.org.pk' },
  { key: 'diesel', label: 'High Speed Diesel (HSD)', value: 399.64, unit: 'PKR / Litre', source: 'Petroleum Division & OGRA Notification (3 Oct 2026) — manually verified', sourceUrl: 'https://ogra.org.pk' },
  { key: 'cng', label: 'CNG (Region I/II)', value: 215.00, unit: 'PKR / kg', source: 'All Pakistan CNG Association (APCNGA) — manually verified', sourceUrl: 'https://apcnga.org.pk' },
];

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

    for (const item of LATEST_FEED_FUEL) {
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
            updatedBy: options.adminUser || 'Automated Cron Service',
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
            updatedBy: options.adminUser || 'Automated Cron Service',
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
            source: item.source,
          },
        });

        // 4. Create in-app system notification
        if (Math.abs(diff) > 0.01) {
          await prisma.systemNotification.create({
            data: {
              title: `Fuel Price Update: ${item.label}`,
              message: `${item.label} has been updated to Rs. ${newValue.toFixed(2)} / ${item.unit} as per Petroleum Division notification.`,
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
      itemsProcessed: LATEST_FEED_FUEL.length,
      changesDetected,
      changes,
      message: `Fuel publish completed (manual-verified constants, verified ${FUEL_VERIFIED_ON}): ${changesDetected} rate changes detected.`,
      syncMode: 'manual-verified',
      verifiedOn: FUEL_VERIFIED_ON,
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
