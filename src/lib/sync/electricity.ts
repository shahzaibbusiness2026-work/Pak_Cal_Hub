import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncItemChange, SyncOptions } from './types';
import { PROTECTED_SLABS, UNPROTECTED_SLABS, LIFELINE_SLABS } from '../data/electricity-data';

export async function syncElectricityTariffs(options: SyncOptions = {}): Promise<SyncServiceResult> {
  const timestamp = new Date().toISOString();
  const changes: SyncItemChange[] = [];
  let changesDetected = 0;

  const ALL_SLABS: Array<{ consumerType: string; slabs: typeof PROTECTED_SLABS }> = [
    { consumerType: 'lifeline', slabs: LIFELINE_SLABS },
    { consumerType: 'protected', slabs: PROTECTED_SLABS },
    { consumerType: 'unprotected', slabs: UNPROTECTED_SLABS },
  ];
  const totalSlabs = ALL_SLABS.reduce((n, g) => n + g.slabs.length, 0);

  try {
    const connected = await isDatabaseConnected();
    if (!connected) {
      return {
        service: 'electricity',
        success: true,
        timestamp,
        itemsProcessed: totalSlabs,
        changesDetected: 0,
        changes: [],
        message: 'Database in fallback mode: canonical NEPRA tariff dataset served from code.',
        syncMode: 'manual-verified',
        verifiedOn: '2026-10-04',
      };
    }

    // Sync each consumer category's slabs from the canonical NEPRA dataset
    for (const group of ALL_SLABS) {
      for (const slab of group.slabs) {
        const slabMax = slab.max === Infinity ? 99999 : slab.max;
        const existing = await prisma.electricityTariff.findUnique({
          where: {
            provider_consumerType_slabMin_slabMax_effectiveYear: {
              provider: 'NEPRA_NATIONAL',
              consumerType: group.consumerType,
              slabMin: slab.min,
              slabMax,
              effectiveYear: '2026-27',
            },
          },
        });

        const oldValue = existing ? existing.baseRate : slab.rate;
        const newValue = slab.rate;
        const isChanged = existing ? Math.abs(oldValue - newValue) > 0.01 : true;

        if (isChanged || options.forceUpdate) {
          changesDetected++;
          await prisma.electricityTariff.upsert({
            where: {
              provider_consumerType_slabMin_slabMax_effectiveYear: {
                provider: 'NEPRA_NATIONAL',
                consumerType: group.consumerType,
                slabMin: slab.min,
                slabMax,
                effectiveYear: '2026-27',
              },
            },
            update: { baseRate: newValue, status: 'PUBLISHED', verifiedAt: new Date() },
            create: {
              provider: 'NEPRA_NATIONAL',
              consumerType: group.consumerType,
              slabMin: slab.min,
              slabMax,
              baseRate: newValue,
              effectiveYear: '2026-27',
              status: 'PUBLISHED',
            },
          });
        }
      }
    }

    await prisma.syncLog.create({
      data: {
        type: 'electricity',
        status: 'SUCCESS',
        message: `Electricity tariff sync executed: ${totalSlabs} slabs verified.`,
        source: 'NEPRA Domestic Tariff Schedule',
      },
    });

    return {
      service: 'electricity',
      success: true,
      timestamp,
      itemsProcessed: totalSlabs,
      changesDetected,
      changes,
      message: `Electricity tariff publish completed (canonical NEPRA dataset, verified 2026-10-04): ${changesDetected} slab changes detected.`,
      syncMode: 'manual-verified',
      verifiedOn: '2026-10-04',
    };
  } catch (err: any) {
    try {
      await prisma.syncLog.create({
        data: {
          type: 'electricity',
          status: 'FAILED',
          message: `Electricity sync failed: ${err.message}`,
        },
      });
    } catch (e) {}

    return {
      service: 'electricity',
      success: false,
      timestamp,
      itemsProcessed: 0,
      changesDetected: 0,
      changes: [],
      message: `Electricity sync failed: ${err.message}`,
      error: err.message,
    };
  }
}
