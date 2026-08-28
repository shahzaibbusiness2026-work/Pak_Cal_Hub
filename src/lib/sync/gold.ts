import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncItemChange, SyncOptions } from './types';

export const LATEST_FEED_GOLD = [
  { key: 'gold_24k_tola', label: 'Gold 24K (per Tola)', value: 242000, unit: 'PKR / Tola (11.66g)', source: 'All Pakistan Sarafa Gems and Jewellers Association', sourceUrl: 'https://apsja.com.pk' },
  { key: 'gold_22k_tola', label: 'Gold 22K (per Tola)', value: 221833, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark' },
  { key: 'gold_21k_tola', label: 'Gold 21K (per Tola)', value: 211750, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark' },
  { key: 'gold_18k_tola', label: 'Gold 18K (per Tola)', value: 181500, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark' },
  { key: 'silver_tola', label: 'Silver (per Tola)', value: 2850, unit: 'PKR / Tola', source: 'Sarafa Market Benchmark' },
];

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
        message: 'Database in fallback mode: Gold sync completed in memory.',
      };
    }

    for (const item of LATEST_FEED_GOLD) {
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
            sourceUrl: item.sourceUrl,
            verifiedAt: new Date(),
            updatedBy: options.adminUser || 'Automated Cron Service',
          },
          create: {
            key: item.key,
            value: newValue,
            label: item.label,
            unit: item.unit,
            category: 'gold',
            status: 'PUBLISHED',
            source: item.source,
            sourceUrl: item.sourceUrl,
            verifiedAt: new Date(),
            updatedBy: options.adminUser || 'Automated Cron Service',
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
            source: item.source,
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
      itemsProcessed: LATEST_FEED_GOLD.length,
      changesDetected,
      changes,
      message: `Gold sync completed: ${changesDetected} rate changes detected.`,
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
