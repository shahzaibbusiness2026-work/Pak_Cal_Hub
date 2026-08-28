import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';

export interface FuelInputs {
  distanceKm: number;
  fuelAverageKmPerLitre: number;
  fuelType?: 'petrol' | 'diesel' | 'cng';
  fuelPricePerUnit?: number; // Price per litre or per kg
  isRoundTrip?: boolean;
  workingDaysPerMonth?: number;
}

export const DEFAULT_FUEL_PRICES = {
  petrol: 254.63,
  diesel: 258.40,
  cng: 215.00,
};

/**
 * Pure Fuel & Commute Cost Calculation Engine for Pakistan
 */
export function calculateFuelCost(inputs: FuelInputs): CalculatorOutput {
  const oneWayDistance = Math.max(0, inputs.distanceKm || 0);
  const isRoundTrip = inputs.isRoundTrip !== false;
  const totalTripDistance = isRoundTrip ? oneWayDistance * 2 : oneWayDistance;
  const mileage = Math.max(1, inputs.fuelAverageKmPerLitre || 12);
  const fuelType = inputs.fuelType || 'petrol';
  const pricePerUnit = inputs.fuelPricePerUnit && inputs.fuelPricePerUnit > 0
    ? inputs.fuelPricePerUnit
    : DEFAULT_FUEL_PRICES[fuelType] || 254.63;
  const workingDays = inputs.workingDaysPerMonth || 22;

  // 1. Litres consumed for single trip
  const fuelConsumedLitres = totalTripDistance / mileage;
  const singleTripCost = fuelConsumedLitres * pricePerUnit;

  // 2. Cost per KM
  const costPerKm = pricePerUnit / mileage;

  // 3. Monthly Commute Cost (working days)
  const monthlyDistance = totalTripDistance * workingDays;
  const monthlyLitres = fuelConsumedLitres * workingDays;
  const monthlyCost = singleTripCost * workingDays;

  // 4. Annual Commute Cost
  const annualCost = monthlyCost * 12;

  const unitLabel = fuelType === 'cng' ? 'kg' : 'Litres';

  const breakdown: BreakdownRow[] = [
    { label: `Trip Distance (${isRoundTrip ? 'Round Trip' : 'One Way'})`, amount: `${totalTripDistance.toFixed(1)} km`, type: 'earning' },
    { label: `Vehicle Fuel Average`, amount: `${mileage.toFixed(1)} km / ${unitLabel}`, type: 'earning' },
    { label: `Fuel Price Rate (${fuelType.toUpperCase()})`, amount: `Rs. ${pricePerUnit.toFixed(2)} / ${unitLabel}`, type: 'earning' },
    { label: `Running Cost per Kilometer`, amount: `Rs. ${costPerKm.toFixed(2)} / km`, type: 'earning' },
    { label: `Fuel Required per Trip`, amount: `${fuelConsumedLitres.toFixed(2)} ${unitLabel}`, type: 'earning' },
    { label: `Single Trip Expense`, amount: formatPKR(singleTripCost), type: 'total' },
    { label: `Monthly Expense (${workingDays} days)`, amount: formatPKR(monthlyCost), type: 'total' },
  ];

  return {
    primaryResult: {
      id: 'tripCost',
      label: 'Estimated Trip Fuel Cost',
      value: formatPKR(singleTripCost),
      subtext: `${fuelConsumedLitres.toFixed(2)} ${unitLabel} required @ Rs. ${pricePerUnit.toFixed(2)}/${unitLabel}`,
    },
    secondaryResults: [
      { id: 'monthlyCost', label: `Monthly Commute (${workingDays} days)`, value: formatPKR(monthlyCost) },
      { id: 'costPerKm', label: 'Running Cost / KM', value: `Rs. ${costPerKm.toFixed(2)} / km` },
      { id: 'monthlyFuel', label: 'Monthly Fuel Quantity', value: `${monthlyLitres.toFixed(1)} ${unitLabel}` },
      { id: 'annualCost', label: 'Annual Commute Cost', value: formatPKR(annualCost) },
    ],
    breakdown,
  };
}
