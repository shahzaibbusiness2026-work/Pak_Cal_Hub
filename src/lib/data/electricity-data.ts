export interface TariffSlab {
  min: number;
  max: number;
  rate: number; // PKR per unit (kWh)
}

/**
 * NEPRA Uniform Domestic Schedule of Tariff (SOT) — Calendar Year 2026.
 * Effective 1 January 2026 (rebased to calendar-year framework); fixed charges
 * restructured to per-kW of sanctioned load in Feb 2026.
 *
 * Corroborated Oct 2026 from: The News, Pakistan Today, Pakistan Observer, TechJuice.
 * Upper-slab variable rates (301+) reflect the Feb-2026 revision
 * (Rs 1.53 / 1.27 / 1.40 / 0.91 / 0.49 per-unit cuts on 301-400 / 401-500 / 501-600 / 601-700 / 700+).
 * ALWAYS verify against the latest NEPRA SOT notification before publishing rate changes.
 */

export type DomesticConsumerCategory = 'lifeline' | 'protected' | 'unprotected';

// Lifeline: up to 100 units/month, NO fixed charge, no cross-slab benefit.
// (Lifeline status is lost above 100 units.)
export const LIFELINE_SLABS: TariffSlab[] = [
  { min: 1, max: 50, rate: 3.95 },
  { min: 51, max: 100, rate: 7.74 },
];

// Protected: consistently <= 200 units for the last 6 months.
export const PROTECTED_SLABS: TariffSlab[] = [
  { min: 1, max: 100, rate: 10.54 },
  { min: 101, max: 200, rate: 13.01 },
];

// Unprotected domestic consumers (NEPRA base tariff slabs).
export const UNPROTECTED_SLABS: TariffSlab[] = [
  { min: 1, max: 100, rate: 22.44 },
  { min: 101, max: 200, rate: 28.91 },
  { min: 201, max: 300, rate: 33.10 },
  { min: 301, max: 400, rate: 36.46 },
  { min: 401, max: 500, rate: 38.95 },
  { min: 501, max: 600, rate: 40.22 },
  { min: 601, max: 700, rate: 41.85 },
  { min: 701, max: Infinity, rate: 47.20 },
];

// Fixed charges per kW of sanctioned load per month (Feb 2026 restructuring).
// Lifeline consumers are exempt (no fixed charge; Rs 75/150 minimum monthly charge may apply instead).
const FIXED_CHARGE_PER_KW: Record<
  Exclude<DomesticConsumerCategory, 'lifeline'>,
  Array<{ maxUnits: number; ratePerKw: number }>
> = {
  protected: [
    { maxUnits: 100, ratePerKw: 200 },
    { maxUnits: 200, ratePerKw: 300 },
  ],
  unprotected: [
    { maxUnits: 100, ratePerKw: 275 },
    { maxUnits: 200, ratePerKw: 300 },
    { maxUnits: 300, ratePerKw: 350 },
    { maxUnits: 400, ratePerKw: 400 },
    { maxUnits: 500, ratePerKw: 500 },
    { maxUnits: Infinity, ratePerKw: 675 },
  ],
};

/**
 * Fixed monthly charge = per-kW rate for the consumption tier × sanctioned load (kW).
 * The sanctioned load is printed on the consumer's electricity bill.
 */
export function getFixedCharges(
  units: number,
  category: DomesticConsumerCategory,
  sanctionedLoadKw: number = 1
): number {
  if (category === 'lifeline') return 0;
  const load = Math.max(0, sanctionedLoadKw || 0);
  const schedule = FIXED_CHARGE_PER_KW[category];
  const tier = schedule.find((t) => units <= t.maxUnits) ?? schedule[schedule.length - 1];
  return tier.ratePerKw * load;
}

// Surcharges, levies & taxes for Pakistan DISCO bills.
export const ELECTRICITY_CONSTANTS = {
  electricityDutyPct: 0.015, // 1.5% Electricity Duty — levied on base energy charges
  generalSalesTaxPct: 0.18, // 18% GST
  tvFee: 35, // Rs. 35 PTV License Fee
  fcSurchargePerUnit: 3.23, // Financing Cost (FC) surcharge per unit
  meterRentDefault: 7.5, // Rs. 7.50 single-phase meter rent
  // Historical reference only (NOT used in billing — FPA/QTA are user inputs since they vary monthly/quarterly per NEPRA):
  // fpaPerUnitEstimate was ~Rs 3.50/unit; quarterlyTariffAdjustment was ~Rs 1.75/unit.
};
