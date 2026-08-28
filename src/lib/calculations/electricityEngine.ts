import { CalculatorOutput, ResultItem, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';

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

export interface ElectricityInputs {
  units: number;
  provider?: DiscoProvider;
  consumerType?: 'protected' | 'unprotected';
  isTaxExempt?: boolean;
  fpaRate?: number; // Fuel Price Adjustment per unit (default ~Rs. 3.50)
  previousMonthUnits?: number;
}

export const DISCO_NAMES: Record<DiscoProvider, string> = {
  lesco: 'Lahore Electric Supply Company (LESCO)',
  iesco: 'Islamabad Electric Supply Company (IESCO)',
  kelectric: 'K-Electric (Karachi)',
  mepco: 'Multan Electric Power Company (MEPCO)',
  fesco: 'Faisalabad Electric Supply Company (FESCO)',
  gepco: 'Gujranwala Electric Power Company (GEPCO)',
  pesco: 'Peshawar Electric Supply Company (PESCO)',
  hesco: 'Hyderabad Electric Supply Company (HESCO)',
  sepco: 'Sukkur Electric Power Company (SEPCO)',
  qesco: 'Quetta Electric Supply Company (QESCO)',
  tesco: 'Tribal Electric Supply Company (TESCO)',
};

/**
 * Official NEPRA Tariff Slabs (RBPS / NEPRA Schedule FY 2026-27)
 */
export const PROTECTED_SLABS = [
  { min: 1, max: 50, rate: 9.87, label: '1 - 50 Units (Life Line / Protected)' },
  { min: 51, max: 100, rate: 16.48, label: '51 - 100 Units (Protected)' },
  { min: 101, max: 200, rate: 22.95, label: '101 - 200 Units (Protected)' },
];

export const UNPROTECTED_SLABS = [
  { min: 1, max: 100, rate: 23.59, label: '1 - 100 Units' },
  { min: 101, max: 200, rate: 30.07, label: '101 - 200 Units' },
  { min: 201, max: 300, rate: 34.26, label: '201 - 300 Units' },
  { min: 301, max: 400, rate: 39.15, label: '301 - 400 Units' },
  { min: 401, max: 500, rate: 41.36, label: '401 - 500 Units' },
  { min: 501, max: 600, rate: 42.78, label: '501 - 600 Units' },
  { min: 601, max: 700, rate: 43.92, label: '601 - 700 Units' },
  { min: 701, max: Infinity, rate: 48.84, label: 'Above 700 Units' },
];

/**
 * Pure Electricity Bill Calculation Engine for Pakistan DISCOs
 * Computes Base Energy Charges, Fuel Price Adjustment (FPA), Electricity Duty (1.5%),
 * General Sales Tax (18%), TV Fee (Rs. 35), and Financing Cost Surcharge (FC Surcharge).
 */
export function calculateElectricityBill(inputs: ElectricityInputs): CalculatorOutput {
  const units = Math.max(0, Math.floor(inputs.units || 0));
  const provider = inputs.provider || 'lesco';
  const fpaRate = inputs.fpaRate !== undefined ? inputs.fpaRate : 3.50; // Default NEPRA FPA
  const isProtected = units <= 200 && (inputs.consumerType === 'protected' || inputs.consumerType === undefined);

  if (units === 0) {
    return {
      primaryResult: { id: 'bill', label: 'Estimated Total Bill', value: 'Rs. 0' },
      secondaryResults: [
        { id: 'units', label: 'Units Consumed', value: '0 kWh' },
        { id: 'baseEnergy', label: 'Base Energy Cost', value: 'Rs. 0' },
        { id: 'taxes', label: 'Total Taxes & Surcharges', value: 'Rs. 0' },
      ],
      breakdown: [],
    };
  }

  // 1. Calculate Base Energy Charges across slabs
  let remainingUnits = units;
  let baseEnergyCharges = 0;
  const slabBreakdowns: BreakdownRow[] = [];

  const slabsToUse = isProtected ? PROTECTED_SLABS : UNPROTECTED_SLABS;

  for (const slab of slabsToUse) {
    if (remainingUnits <= 0) break;
    const slabCapacity = slab.max === Infinity ? remainingUnits : (slab.max - slab.min + 1);
    const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
    const slabCost = unitsInThisSlab * slab.rate;
    baseEnergyCharges += slabCost;
    remainingUnits -= unitsInThisSlab;

    slabBreakdowns.push({
      label: `${slab.label} (${unitsInThisSlab} units @ Rs. ${slab.rate.toFixed(2)})`,
      amount: formatPKR(slabCost),
      type: 'earning',
    });
  }

  // 2. Fuel Price Adjustment (FPA)
  const fpaCharges = units * fpaRate;

  // 3. Financing Cost Surcharge (FC Surcharge @ Rs. 3.23 per unit for non-lifeline)
  const fcSurchargeRate = units > 50 ? 3.23 : 0;
  const fcSurcharge = units * fcSurchargeRate;

  // 4. Electricity Duty (ED - approx 1.5% of base energy charges)
  const electricityDuty = baseEnergyCharges * 0.015;

  // 5. General Sales Tax (GST - 18% on energy + FPA + FC surcharge for >200 units, 0% for protected lifeline)
  const taxableAmount = baseEnergyCharges + fpaCharges + fcSurcharge;
  const gst = units > 200 && !inputs.isTaxExempt ? taxableAmount * 0.18 : 0;

  // 6. PTV Fee
  const tvFee = units > 0 ? 35 : 0;

  // 7. Total Estimated Bill
  const totalTaxes = fpaCharges + fcSurcharge + electricityDuty + gst + tvFee;
  const totalBill = Math.round(baseEnergyCharges + totalTaxes);
  const averageRatePerUnit = units > 0 ? totalBill / units : 0;

  const breakdown: BreakdownRow[] = [
    ...slabBreakdowns,
    { label: 'Total Base Energy Charges', amount: formatPKR(baseEnergyCharges), type: 'earning' },
    { label: `Fuel Price Adjustment (FPA @ Rs. ${fpaRate.toFixed(2)}/unit)`, amount: formatPKR(fpaCharges), type: 'earning' },
    { label: `Financing Cost Surcharge (FC @ Rs. ${fcSurchargeRate.toFixed(2)}/unit)`, amount: formatPKR(fcSurcharge), type: 'earning' },
    { label: 'Electricity Duty (1.5% of Base)', amount: formatPKR(electricityDuty), type: 'deduction' },
    { label: `General Sales Tax (18% GST)`, amount: formatPKR(gst), type: 'deduction' },
    { label: 'PTV License Fee', amount: formatPKR(tvFee), type: 'deduction' },
    { label: 'Net Payable Bill Amount', amount: formatPKR(totalBill), type: 'total' },
  ];

  return {
    primaryResult: {
      id: 'totalBill',
      label: 'Estimated Total Electricity Bill',
      value: formatPKR(totalBill),
      subtext: `${DISCO_NAMES[provider]} • ${isProtected ? 'Protected Tariff' : 'Unprotected Tariff'}`,
    },
    secondaryResults: [
      { id: 'units', label: 'Units Consumed', value: `${units} kWh` },
      { id: 'avgRate', label: 'Average Cost / Unit', value: `Rs. ${averageRatePerUnit.toFixed(2)} / kWh` },
      { id: 'baseCost', label: 'Base Energy Charges', value: formatPKR(baseEnergyCharges) },
      { id: 'taxAmount', label: 'Govt Taxes & Surcharges', value: formatPKR(totalTaxes) },
    ],
    breakdown,
  };
}
