import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';

export interface SolarInputs {
  monthlyUnitsConsumed?: number; // e.g. 600 units
  targetSystemCapacityKw?: number; // e.g. 10 kW
  peakSunHoursPerDay?: number; // default 4.8 hours
  costPerKwInstalled?: number; // default Rs. 135,000 / kW turnkey
  gridUnitRatePkr?: number; // default Rs. 42 / unit
  systemType?: 'onGrid' | 'hybrid' | 'offGrid';
}

/**
 * Pure Solar System Sizing & Net Metering Payback Engine for Pakistan
 */
export function calculateSolarSystem(inputs: SolarInputs): CalculatorOutput {
  const peakHours = inputs.peakSunHoursPerDay || 4.8;
  const costPerKw = inputs.costPerKwInstalled || 135000;
  const unitRate = inputs.gridUnitRatePkr || 42.0;
  const monthlyUnits = inputs.monthlyUnitsConsumed || 600;

  // 1. Calculate required capacity from monthly units if not directly specified
  let systemCapacityKw = inputs.targetSystemCapacityKw && inputs.targetSystemCapacityKw > 0
    ? inputs.targetSystemCapacityKw
    : (monthlyUnits / 30) / peakHours;

  systemCapacityKw = Math.round(systemCapacityKw * 10) / 10;
  systemCapacityKw = Math.max(1, systemCapacityKw);

  // 2. Generation capacity
  const dailyGenerationUnits = systemCapacityKw * peakHours;
  const monthlyGenerationUnits = dailyGenerationUnits * 30;
  const annualGenerationUnits = dailyGenerationUnits * 365;

  // 3. Financial savings
  const monthlySavings = monthlyGenerationUnits * unitRate;
  const annualSavings = annualGenerationUnits * unitRate;

  // 4. Turnkey System Cost
  const totalSystemCost = systemCapacityKw * costPerKw;

  // 5. Payback Period (in years)
  const paybackYears = annualSavings > 0 ? totalSystemCost / annualSavings : 0;
  const paybackMonths = Math.round(paybackYears * 12);

  // 6. Recommended Inverter and Panel count (580W panels)
  const panelCount580W = Math.ceil((systemCapacityKw * 1000) / 580);
  const recommendedInverterKw = Math.ceil(systemCapacityKw);

  const breakdown: BreakdownRow[] = [
    { label: 'Recommended System Capacity', amount: `${systemCapacityKw.toFixed(1)} kW`, type: 'earning' },
    { label: 'Number of Tier-1 580W Panels', amount: `${panelCount580W} Solar Panels`, type: 'earning' },
    { label: 'Recommended Inverter Size', amount: `${recommendedInverterKw} kW Inverter`, type: 'earning' },
    { label: 'Estimated Daily Generation', amount: `${dailyGenerationUnits.toFixed(1)} Units (kWh)`, type: 'earning' },
    { label: 'Estimated Monthly Generation', amount: `${monthlyGenerationUnits.toFixed(0)} Units (kWh)`, type: 'earning' },
    { label: 'Estimated Turnkey System Investment', amount: formatPKR(totalSystemCost), type: 'total' },
    { label: 'Estimated Monthly Bill Reduction', amount: formatPKR(monthlySavings), type: 'total' },
    { label: 'Estimated Annual Savings', amount: formatPKR(annualSavings), type: 'total' },
  ];

  return {
    primaryResult: {
      id: 'systemSize',
      label: 'Recommended Solar System Size',
      value: `${systemCapacityKw.toFixed(1)} kW System`,
      subtext: `Generates ~${monthlyGenerationUnits.toFixed(0)} Units/month • Saves ~${formatPKR(monthlySavings)}/month`,
    },
    secondaryResults: [
      { id: 'totalCost', label: 'Turnkey System Cost', value: formatPKR(totalSystemCost) },
      { id: 'annualSavings', label: 'Annual Electricity Savings', value: formatPKR(annualSavings) },
      { id: 'payback', label: 'Return on Investment (ROI)', value: `${paybackYears.toFixed(1)} Years (${paybackMonths} Mo)` },
      { id: 'panels', label: 'Panels Required (580W)', value: `${panelCount580W} Panels` },
    ],
    breakdown,
  };
}
