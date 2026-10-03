import { CalculatorOutput } from '../../types/calculator';
import { calculateFuelCost as calculateUiFuelCost } from '../calculators/vehicles';

export interface FuelInputs {
  distanceKm: number;
  fuelAverageKmPerLitre: number;
  fuelType?: 'petrol' | 'diesel' | 'cng';
  fuelPricePerUnit?: number; // Price per litre or per kg
  isRoundTrip?: boolean;
  workingDaysPerMonth?: number;
}

export const DEFAULT_FUEL_PRICES = {
  petrol: 392.76, // Petroleum Division / OGRA notification of 3 Oct 2026 (see src/lib/sync/fuel.ts)
  diesel: 399.64,
  cng: 215.00,
};

/**
 * Fuel & Commute Cost Calculation Engine for Pakistan.
 * Delegates to the canonical UI-wired implementation in src/lib/calculators/vehicles.ts
 * so fuel math exists in exactly one place.
 */
export function calculateFuelCost(inputs: FuelInputs): CalculatorOutput {
  const fuelType = inputs.fuelType || 'petrol';
  const pricePerUnit =
    inputs.fuelPricePerUnit && inputs.fuelPricePerUnit > 0
      ? inputs.fuelPricePerUnit
      : DEFAULT_FUEL_PRICES[fuelType] || 392.76;

  return calculateUiFuelCost({
    distanceKm: inputs.distanceKm,
    fuelAverageKmPerLiter: inputs.fuelAverageKmPerLitre,
    fuelPricePerLiter: pricePerUnit,
    roundTrip: inputs.isRoundTrip !== false,
  });
}
