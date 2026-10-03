/**
 * @deprecated — DO NOT ADD NEW LOGIC HERE.
 *
 * The canonical solar implementation lives in `src/lib/calculators/electricity.ts`
 * (`calculateSolarSystem`) — that is what the UI runs.
 * This module only re-exports it so legacy imports keep working.
 */
export { calculateSolarSystem } from '../calculators/electricity';

/** @deprecated — legacy input shape; the canonical calculator takes a plain input record. */
export interface SolarInputs {
  monthlyUnitsConsumed?: number;
  targetSystemCapacityKw?: number;
  peakSunHoursPerDay?: number;
  costPerKwInstalled?: number;
  gridUnitRatePkr?: number;
  systemType?: 'onGrid' | 'hybrid' | 'offGrid';
}
