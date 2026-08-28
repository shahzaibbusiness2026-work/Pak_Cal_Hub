import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Fuel Cost, Trip Expense & Cost per Kilometer Calculator
 */
export function calculateFuelCost(inputs: Record<string, any>): CalculatorOutput {
  const distanceKm = safeNumber(inputs.distanceKm, 380); // e.g. Lahore to Islamabad
  const fuelAverageKmPerLiter = safeNumber(inputs.fuelAverageKmPerLiter, 14.5); // 14.5 km/L
  const fuelPricePerLiter = safeNumber(inputs.fuelPricePerLiter, 330); // Rs. 330/L petrol benchmark (August 2026 OGRA rolling rate)
  const roundTrip = inputs.roundTrip === true;

  const effectiveDistance = roundTrip ? distanceKm * 2 : distanceKm;
  const litersConsumed = fuelAverageKmPerLiter > 0 ? effectiveDistance / fuelAverageKmPerLiter : 0;
  const totalFuelCost = litersConsumed * fuelPricePerLiter;
  const costPerKm = effectiveDistance > 0 ? totalFuelCost / effectiveDistance : 0;

  return {
    primaryResult: {
      id: 'totalFuelCost',
      label: 'Estimated Fuel Cost',
      value: formatPKR(totalFuelCost),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `Cost: Rs. ${costPerKm.toFixed(2)} / km`,
    },
    secondaryResults: [
      { id: 'liters', label: 'Fuel Required', value: `${litersConsumed.toFixed(2)} Litres`, type: 'text' },
      { id: 'costPerKm', label: 'Running Cost per KM', value: formatPKR(costPerKm), type: 'currency' },
      { id: 'distance', label: 'Total Distance', value: `${effectiveDistance} km`, type: 'text' },
    ],
    breakdown: [
      { label: `Journey Distance (${roundTrip ? 'Round Trip' : 'One Way'})`, amount: `${effectiveDistance} km` },
      { label: 'Vehicle Fuel Average', amount: `${fuelAverageKmPerLiter} km / Litre` },
      { label: 'Fuel Rate (OGRA)', amount: `Rs. ${fuelPricePerLiter} / Litre` },
      { label: 'Fuel Required for Journey', amount: `${litersConsumed.toFixed(2)} Litres` },
      { label: 'Total Estimated Fuel Expense', amount: formatPKR(totalFuelCost), isTotal: true },
    ],
    notes: [
      'As of August 2026, OGRA prices fuel on daily rolling international benchmarks. Users can overwrite the rate with today\'s pump price.',
    ],
  };
}

/**
 * Punjab/Sindh/Islamabad Vehicle Token Tax & Transfer Fee Estimator
 */
export function calculateTokenTax(inputs: Record<string, any>): CalculatorOutput {
  const engineCapacityCc = safeNumber(inputs.engineCapacityCc, 1300); // 1300cc
  const isFiler = inputs.isFiler !== false;
  const province = inputs.province || 'punjab';

  let annualTokenTax = 0;
  let incomeTaxAdvance = 0;

  // Standard Pakistan Motor Vehicle Token Tax Slabs
  if (engineCapacityCc <= 1000) {
    annualTokenTax = 1800;
    incomeTaxAdvance = isFiler ? 0 : 2500;
  } else if (engineCapacityCc <= 1300) {
    annualTokenTax = 4000;
    incomeTaxAdvance = isFiler ? 2500 : 7500;
  } else if (engineCapacityCc <= 1500) {
    annualTokenTax = 6000;
    incomeTaxAdvance = isFiler ? 3750 : 11250;
  } else if (engineCapacityCc <= 1600) {
    annualTokenTax = 9000;
    incomeTaxAdvance = isFiler ? 4500 : 13500;
  } else if (engineCapacityCc <= 1800) {
    annualTokenTax = 12000;
    incomeTaxAdvance = isFiler ? 7500 : 22500;
  } else if (engineCapacityCc <= 2000) {
    annualTokenTax = 18000;
    incomeTaxAdvance = isFiler ? 10000 : 30000;
  } else {
    // Above 2000cc
    annualTokenTax = 25000;
    incomeTaxAdvance = isFiler ? 20000 : 60000;
  }

  const totalAnnualPayable = annualTokenTax + incomeTaxAdvance;

  return {
    primaryResult: {
      id: 'totalTokenTax',
      label: 'Annual Token Tax & Advance Tax',
      value: formatPKR(totalAnnualPayable),
      type: 'currency',
      highlight: true,
      color: 'warning',
      subtext: `${engineCapacityCc}cc (${isFiler ? 'Active Filer' : 'Non-Filer'})`,
    },
    secondaryResults: [
      { id: 'tokenTax', label: 'Provincial Motor Vehicle Tax', value: formatPKR(annualTokenTax), type: 'currency' },
      { id: 'fbrAdvanceTax', label: 'FBR Income Tax (234)', value: formatPKR(incomeTaxAdvance), type: 'currency' },
      { id: 'status', label: 'Taxpayer Status', value: isFiler ? 'Filer' : 'Non-Filer', type: 'badge' },
    ],
    breakdown: [
      { label: `Engine Capacity (${engineCapacityCc} CC)`, amount: `${engineCapacityCc} cc` },
      { label: `Provincial Token Tax (${province.toUpperCase()})`, amount: formatPKR(annualTokenTax) },
      { label: `FBR Section 234 Advance Tax (${isFiler ? 'Filer' : 'Non-Filer 3x Penalty'})`, amount: formatPKR(incomeTaxAdvance) },
      { label: 'Total Annual Excise Challan Payable', amount: formatPKR(totalAnnualPayable), isTotal: true },
    ],
    notes: [
      'Excise & Taxation Department motor vehicle schedule.',
      'Active tax filers on the FBR ATL receive significant rebates on annual advance vehicle tax.',
    ],
  };
}
