import { syncFuelPrices } from './fuel';
import { syncGoldRates } from './gold';
import { syncCurrencyRates } from './currency';
import { syncElectricityTariffs } from './electricity';
import { syncGovernmentNotifications } from './government';
import { SyncOptions, SyncServiceResult } from './types';

export * from './types';
export * from './fuel';
export * from './gold';
export * from './currency';
export * from './electricity';
export * from './government';

export interface MasterSyncResult {
  success: boolean;
  timestamp: string;
  totalServices: number;
  successfulServices: number;
  totalChangesDetected: number;
  results: Record<string, SyncServiceResult>;
}

/**
 * Master Synchronizer: Runs all automated data pipelines concurrently
 */
export async function syncAllServices(options: SyncOptions = {}): Promise<MasterSyncResult> {
  const timestamp = new Date().toISOString();

  const [fuelResult, goldResult, currencyResult, elecResult, govtResult] = await Promise.all([
    syncFuelPrices(options),
    syncGoldRates(options),
    syncCurrencyRates(options),
    syncElectricityTariffs(options),
    syncGovernmentNotifications(options),
  ]);

  const results: Record<string, SyncServiceResult> = {
    fuel: fuelResult,
    gold: goldResult,
    currency: currencyResult,
    electricity: elecResult,
    government: govtResult,
  };

  const serviceList = Object.values(results);
  const successfulServices = serviceList.filter((s) => s.success).length;
  const totalChanges = serviceList.reduce((acc, curr) => acc + curr.changesDetected, 0);

  return {
    success: successfulServices === serviceList.length,
    timestamp,
    totalServices: serviceList.length,
    successfulServices,
    totalChangesDetected: totalChanges,
    results,
  };
}
