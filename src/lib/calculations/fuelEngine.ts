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
  petrol: 362.00, // Petroleum Division / OGRA notification of 5 Nov 2026 (see src/lib/sync/fuel.ts)
  diesel: 387.81,
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
      : DEFAULT_FUEL_PRICES[fuelType] || 362.00;

  return calculateUiFuelCost({
    distanceKm: inputs.distanceKm,
    fuelAverageKmPerLiter: inputs.fuelAverageKmPerLitre,
    fuelPricePerLiter: pricePerUnit,
    roundTrip: inputs.isRoundTrip === true,
  });
}
