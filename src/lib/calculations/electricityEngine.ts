/**
 * @deprecated — DO NOT ADD NEW LOGIC HERE.
 *
 * The canonical electricity implementation lives in `src/lib/calculators/electricity.ts`
 * (tariff data in `src/lib/data/electricity-data.ts`) — that is what the UI runs.
 * This module only re-exports the canonical API so legacy imports keep working.
 * The DB sync (`src/lib/sync/electricity.ts`) and admin seed read from the canonical
 * data file directly.
 */
export { calculateElectricityBill } from '../calculators/electricity';
export { PROTECTED_SLABS, UNPROTECTED_SLABS, LIFELINE_SLABS } from '../data/electricity-data';

/** @deprecated — use the consumerType values on the canonical calculator instead. */
export type DiscoProvider =
  | 'lesco'
  | 'iesco'
  | 'kelectric'
  | 'mepco'
  | 'fesco'
  | 'gepco'
  | 'pesco'
  | 'hesco'
  | 'sepco'
  | 'qesco'
  | 'tesco';

/** @deprecated — kept for backwards compatibility only. */
export const DISCO_NAMES: Record<DiscoProvider, string> = {
  lesco: 'Lahore Electric Supply Company (LESCO)',
  iesco: 'Islamabad Electric Supply Company (IESCO)',
  kelectric: 'K-Electric (Karachi)',
  mepco: 'Multan Electric Power Company (MEPCO)',
  fesco: 'Faisalabad Electric Supply Company (FESCO)',
  gepco: 'Gujranwala Electric Supply Company (GEPCO)',
  pesco: 'Peshawar Electric Supply Company (PESCO)',
  hesco: 'Hyderabad Electric Supply Company (HESCO)',
  sepco: 'Sukkur Electric Power Company (SEPCO)',
  qesco: 'Quetta Electric Supply Company (QESCO)',
  tesco: 'Tribal Electric Supply Company (TESCO)',
};

/** @deprecated — legacy input shape; the canonical calculator takes a plain input record. */
export interface ElectricityInputs {
  units: number;
  provider?: DiscoProvider;
  consumerType?: 'protected' | 'unprotected' | 'lifeline';
  isTaxExempt?: boolean;
  fpaRate?: number;
  qtaRate?: number;
  sanctionedLoadKw?: number;
  meterRent?: number;
  previousMonthUnits?: number;
}
