import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { BPS_SCALES_2026, ADHOC_ALLOWANCES } from '../data/bps-data';
import { SALARIED_TAX_SLABS, NON_SALARIED_TAX_SLABS } from '../data/tax-slabs-data';
import { PROTECTED_SLABS, UNPROTECTED_SLABS, ELECTRICITY_CONSTANTS } from '../data/electricity-data';
import { BASELINE_FX_RATES } from './currency';
import { ZAKAT_DEFAULTS } from '../data/zakat-data';
import { PAK_UNIVERSITY_FORMULAS } from '../data/universities-data';

import { calculateLeaveEncashment as calcLeaveEncashmentEngine, calculateFamilyPension as calcFamilyPensionEngine, calculatePromotion as calcPromotionEngine } from '../calculations';

// ==========================================
// 1. SALARY & GOVT EMPLOYEES ENGINES
// ==========================================

export function calculateLeaveEncashment(inputs: Record<string, any>): CalculatorOutput {
  return calcLeaveEncashmentEngine({
    government: inputs.government,
    year: inputs.year,
    basicPay: inputs.lastBasic || inputs.basicPay,
    leaveDays: inputs.leaveDays,
  });
}

export function calculateFamilyPension(inputs: Record<string, any>): CalculatorOutput {
  return calcFamilyPensionEngine({
    government: inputs.jurisdiction || inputs.government,
    lastBasicPay: inputs.pensionerBasicPay || inputs.lastBasicPay,
    serviceYears: inputs.serviceYears,
    deceasedBps: inputs.deceasedBps || inputs.bps,
  });
}

export function calculatePromotionPay(inputs: Record<string, any>): CalculatorOutput {
  return calcPromotionEngine({
    government: inputs.government,
    year: inputs.year,
    currentBps: inputs.currentBps,
    promotedBps: inputs.nextBps || inputs.promotedBps,
    currentBasic: inputs.currentBasic,
  });
}

// ==========================================
// 2. PROPERTY UNITS & CONSTRUCTION MATERIAL ENGINES
// ==========================================

export function calculateCementRequirement(inputs: Record<string, any>): CalculatorOutput {
  const coveredArea = safeNumber(inputs.coveredArea, 2000);
  const structureType = inputs.structureType || 'double-story';

  // Standard engineering factor: ~0.45 to 0.50 bags per sq ft covered area
  const bagFactor = structureType === 'double-story' ? 0.48 : 0.42;
  const totalBags = Math.ceil(coveredArea * bagFactor);
  const bagPrice = safeNumber(inputs.bagPrice, 1480); // Rs. 1,480 per bag (August 2026 market benchmark)
  const totalCost = totalBags * bagPrice;

  return {
    primaryResult: {
      id: 'totalBags',
      label: 'Estimated Cement Bags Required',
      value: `${totalBags.toLocaleString()} Bags`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `Total Cost: ${formatPKR(totalCost)}`,
    },
    secondaryResults: [
      { id: 'cost', label: 'Total Cement Expense', value: formatPKR(totalCost), type: 'currency' },
      { id: 'rate', label: 'Price per Bag', value: `Rs. ${bagPrice}`, type: 'text' },
    ],
    breakdown: [
      { label: `Covered Construction Area`, amount: `${coveredArea} sq ft` },
      { label: `Average Consumption Index`, amount: `${bagFactor} Bags / sq ft` },
      { label: `Total Cement Bags`, amount: `${totalBags.toLocaleString()} Bags` },
      { label: `Total Estimated Cement Budget`, amount: formatPKR(totalCost), isTotal: true },
    ],
  };
}

export function calculateBricksRequirement(inputs: Record<string, any>): CalculatorOutput {
  const coveredArea = safeNumber(inputs.coveredArea, 2000);
  const brickFactor = 26; // ~26 bricks per sq ft covered area for 9" external & 4.5" internal walls
  const totalBricks = Math.ceil(coveredArea * brickFactor);
  const ratePer1000 = safeNumber(inputs.ratePer1000, 21000); // Rs. 21,000 per 1000 bricks Awwal (August 2026 market benchmark)
  const totalCost = (totalBricks / 1000) * ratePer1000;

  return {
    primaryResult: {
      id: 'totalBricks',
      label: 'Total Bricks Required (Awwal)',
      value: `${totalBricks.toLocaleString()} Bricks`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `Estimated Cost: ${formatPKR(totalCost)}`,
    },
    secondaryResults: [
      { id: 'cost', label: 'Total Brick Expense', value: formatPKR(totalCost), type: 'currency' },
      { id: 'thousands', label: 'Quantity in Thousands', value: `${(totalBricks / 1000).toFixed(1)}k Bricks`, type: 'text' },
    ],
    breakdown: [
      { label: 'Covered Area', amount: `${coveredArea} sq ft` },
      { label: 'Estimated Brick Count (9" & 4.5" walls)', amount: `${totalBricks.toLocaleString()} Bricks` },
      { label: 'A-Grade Rate per 1,000 Bricks', amount: `Rs. ${ratePer1000.toLocaleString()}` },
      { label: 'Total Brick Cost', amount: formatPKR(totalCost), isTotal: true },
    ],
  };
}

export function calculateSteelRequirement(inputs: Record<string, any>): CalculatorOutput {
  const coveredArea = safeNumber(inputs.coveredArea, 2000);
  const kgFactor = 3.5; // ~3.5 kg steel per sq ft covered area for Grade 60 de-formed bars
  const totalKg = coveredArea * kgFactor;
  const totalTons = totalKg / 1000;
  const ratePerTon = safeNumber(inputs.ratePerTon, 275000); // Rs. 275,000 per ton Grade 60 (August 2026 market benchmark)
  const totalCost = totalTons * ratePerTon;

  return {
    primaryResult: {
      id: 'totalSteel',
      label: 'Steel / Rebar Required (Grade 60)',
      value: `${totalTons.toFixed(2)} Metric Tons`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `Cost: ${formatPKR(totalCost)} (${totalKg.toLocaleString()} kg)`,
    },
    secondaryResults: [
      { id: 'totalCost', label: 'Total Steel Cost', value: formatPKR(totalCost), type: 'currency' },
      { id: 'ratePerKg', label: 'Rate per KG', value: `Rs. ${(ratePerTon / 1000).toFixed(0)} / kg`, type: 'text' },
    ],
    breakdown: [
      { label: 'Covered Area', amount: `${coveredArea} sq ft` },
      { label: 'Steel Consumption (3.5 kg / sq ft)', amount: `${totalKg.toLocaleString()} kg` },
      { label: 'Metric Tons Required', amount: `${totalTons.toFixed(3)} Tons` },
      { label: 'Total Steel Budget', amount: formatPKR(totalCost), isTotal: true },
    ],
  };
}

export function calculateTilesRequirement(inputs: Record<string, any>): CalculatorOutput {
  const roomLength = safeNumber(inputs.roomLength, 14); // ft
  const roomWidth = safeNumber(inputs.roomWidth, 12);  // ft
  const tileLengthInch = safeNumber(inputs.tileLengthInch, 24); // 24" x 24" = 2ft x 2ft
  const tileWidthInch = safeNumber(inputs.tileWidthInch, 24);
  const wastagePct = safeNumber(inputs.wastagePct, 10); // 10% wastage

  const roomAreaSqFt = roomLength * roomWidth;
  const tileAreaSqFt = (tileLengthInch * tileWidthInch) / 144;
  const rawTilesNeeded = tileAreaSqFt > 0 ? roomAreaSqFt / tileAreaSqFt : 0;
  const totalTilesWithWastage = Math.ceil(rawTilesNeeded * (1 + wastagePct / 100));
  const totalSqFtWithWastage = roomAreaSqFt * (1 + wastagePct / 100);

  const pricePerSqFt = safeNumber(inputs.pricePerSqFt, 180);
  const totalCost = totalSqFtWithWastage * pricePerSqFt;

  return {
    primaryResult: {
      id: 'totalTiles',
      label: 'Total Tiles Required',
      value: `${totalTilesWithWastage} Tiles`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `${totalSqFtWithWastage.toFixed(1)} sq ft (incl. ${wastagePct}% cutting wastage)`,
    },
    secondaryResults: [
      { id: 'roomArea', label: 'Room Floor Area', value: `${roomAreaSqFt} Sq. Ft.`, type: 'text' },
      { id: 'totalCost', label: 'Estimated Tile Cost', value: formatPKR(totalCost), type: 'currency' },
    ],
    breakdown: [
      { label: `Room Dimensions (${roomLength}ft × ${roomWidth}ft)`, amount: `${roomAreaSqFt} sq ft` },
      { label: `Tile Dimensions (${tileLengthInch}" × ${tileWidthInch}")`, amount: `${tileAreaSqFt.toFixed(2)} sq ft / tile` },
      { label: `Cutting & Laying Wastage (${wastagePct}%)`, amount: `+${(totalSqFtWithWastage - roomAreaSqFt).toFixed(1)} sq ft` },
      { label: `Total Tiles to Buy`, amount: `${totalTilesWithWastage} Pieces`, isTotal: true },
    ],
  };
}

// ==========================================
// 3. VEHICLE RUNNING, EV & DEPRECIATION ENGINES
// ==========================================

export function calculateEvChargingCost(inputs: Record<string, any>): CalculatorOutput {
  const batteryCapacityKwh = safeNumber(inputs.batteryCapacityKwh, 60); // 60 kWh battery (e.g. Deepal / MG4 / BYD)
  const fullRangeKm = safeNumber(inputs.fullRangeKm, 420); // 420 km range
  const chargingMode = inputs.chargingMode || 'home-standard';
  
  let defaultRate = 48; // Standard domestic peak/upper slab
  if (chargingMode === 'home-offpeak') defaultRate = 23.57; // NEPRA off-peak subsidized residential tariff (SRO 279(I)/2026)
  else if (chargingMode === 'public-fast') defaultRate = 125; // Retail public fast charging pump rate (PSO/Shell/Go Green)
  else if (chargingMode === 'wholesale-commercial') defaultRate = 39.70; // NEPRA discounted wholesale EV charger tariff
  
  const electricityRate = safeNumber(inputs.homeElectricityRate || inputs.electricityRate, defaultRate);

  const fullChargeCost = batteryCapacityKwh * electricityRate;
  const costPerKm = fullRangeKm > 0 ? fullChargeCost / fullRangeKm : 0;
  const monthlyKm = safeNumber(inputs.monthlyKm, 1500);
  const monthlyCost = costPerKm * monthlyKm;

  // Comparison with Petrol car doing 12 km/L at OGRA August 2026 RON-92 rate: Rs. 254.63/L (~Rs. 21.22/km)
  const petrolPricePerLiter = 254.63;
  const petrolCostPerKm = petrolPricePerLiter / 12;
  const monthlyPetrolCost = petrolCostPerKm * monthlyKm;
  const monthlySavingsVsPetrol = monthlyPetrolCost - monthlyCost;

  return {
    primaryResult: {
      id: 'costPerKm',
      label: 'EV Running Cost per Kilometer',
      value: `Rs. ${costPerKm.toFixed(2)} / km`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `Full 0-100% Charge: ${formatPKR(fullChargeCost)}`,
    },
    secondaryResults: [
      { id: 'monthlyCost', label: 'Monthly Charging Cost', value: formatPKR(monthlyCost), type: 'currency' },
      { id: 'monthlySavings', label: 'Monthly Fuel Savings vs Petrol', value: formatPKR(monthlySavingsVsPetrol), type: 'currency', color: 'success' },
      { id: 'petrolComparison', label: `Petrol Car Equiv. (12 km/L @ Rs.${petrolPricePerLiter}/L)`, value: formatPKR(monthlyPetrolCost), type: 'currency' },
    ],
    breakdown: [
      { label: `Battery Usable Capacity (${batteryCapacityKwh} kWh)`, amount: `${batteryCapacityKwh} Units` },
      { label: `Electricity Charging Tariff`, amount: `Rs. ${electricityRate.toFixed(2)} / Unit` },
      { label: `Cost of Full Charge (${fullRangeKm} km Range)`, amount: formatPKR(fullChargeCost) },
      { label: `Monthly EV Cost (${monthlyKm} km / month)`, amount: formatPKR(monthlyCost) },
      { label: `Monthly Fuel Savings vs Petrol Car @ Rs. ${petrolPricePerLiter}/L`, amount: formatPKR(monthlySavingsVsPetrol), isTotal: true },
    ],
    notes: [
      'NEPRA off-peak residential rate is ~Rs. 23.57/kWh under SRO 279(I)/2026. Public fast charging pumps retail at ~Rs. 110–140/kWh.',
      `Comparison assumes a 1.5L petrol car averaging 12 km/L at Rs. ${petrolPricePerLiter}/L (OGRA RON-92 rate, August 2026).`,
    ],
  };
}

export function calculateCarDepreciation(inputs: Record<string, any>): CalculatorOutput {
  const purchasePrice = safeNumber(inputs.purchasePrice, 4500000); // 45 Lakh
  const ageYears = safeNumber(inputs.ageYears, 3);
  const annualDepreciationPct = safeNumber(inputs.annualDepreciationPct, 10); // 10% per year typical

  const residualValue = purchasePrice * Math.pow(1 - annualDepreciationPct / 100, ageYears);
  const totalDepreciation = purchasePrice - residualValue;

  return {
    primaryResult: {
      id: 'residualValue',
      label: `Estimated Market Value after ${ageYears} Years`,
      value: formatPKR(residualValue),
      type: 'currency',
      highlight: true,
      color: 'info',
      subtext: `Depreciation Lost: ${formatPKR(totalDepreciation)}`,
    },
    secondaryResults: [
      { id: 'totalLoss', label: 'Total Depreciation Loss', value: formatPKR(totalDepreciation), type: 'currency', color: 'error' },
      { id: 'annualLoss', label: 'Average Annual Loss', value: formatPKR(totalDepreciation / ageYears), type: 'currency' },
    ],
    breakdown: [
      { label: 'Original Vehicle Purchase Price', amount: formatPKR(purchasePrice) },
      { label: `Annual Depreciation Rate`, amount: `${annualDepreciationPct}% per annum` },
      { label: `Total Depreciation over ${ageYears} Years`, amount: formatPKR(totalDepreciation), isDeduction: true },
      { label: 'Estimated Current Market Resale Value', amount: formatPKR(residualValue), isTotal: true },
    ],
  };
}
