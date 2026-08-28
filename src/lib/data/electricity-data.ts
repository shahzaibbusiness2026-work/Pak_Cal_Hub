export interface TariffSlab {
  min: number;
  max: number;
  rate: number; // PKR per unit (kWh)
}

// 2026 Protected Domestic Consumers (Consistently <= 200 units for last 6 months)
export const PROTECTED_SLABS: TariffSlab[] = [
  { min: 1, max: 50, rate: 7.74 },
  { min: 51, max: 100, rate: 10.06 },
  { min: 101, max: 200, rate: 14.16 },
];

// 2026 Unprotected Domestic Consumers (NEPRA Base Tariff Slabs)
export const UNPROTECTED_SLABS: TariffSlab[] = [
  { min: 1, max: 100, rate: 23.59 },
  { min: 101, max: 200, rate: 30.07 },
  { min: 201, max: 300, rate: 34.26 },
  { min: 301, max: 400, rate: 39.15 },
  { min: 401, max: 500, rate: 41.36 },
  { min: 501, max: 600, rate: 42.78 },
  { min: 601, max: 700, rate: 43.92 },
  { min: 701, max: Infinity, rate: 48.84 },
];

// 2026 Fixed Monthly Charges Schedule (NEPRA Notification)
export function getFixedCharges(units: number, isProtected: boolean): number {
  if (isProtected || units <= 300) return 0;
  if (units <= 400) return 200;
  if (units <= 500) return 400;
  if (units <= 600) return 600;
  if (units <= 700) return 800;
  return 1000;
}

// 2026 Surcharges, Levies & Taxes for Pakistan DISCO Bills
export const ELECTRICITY_CONSTANTS = {
  electricityDutyPct: 0.015, // 1.5% Electricity Duty (Punjab/Federal)
  generalSalesTaxPct: 0.18, // 18% GST (applies to unprotected / commercial)
  tvFee: 35, // Rs. 35 PTV License Fee
  fpaPerUnitEstimate: 3.50, // Estimated Fuel Price Adjustment per unit
  fcSurchargePerUnit: 3.23, // Financing Cost (FC) Surcharge per unit
  quarterlyTariffAdjustment: 1.75, // QTA per unit
};
