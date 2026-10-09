import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
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
  const bagPrice = safeNumber(inputs.bagPrice, 1450); // Canonical market-rate fallback (src/lib/db/dataProvider.ts)
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
      { label: `Foundation, columns & beams (~22%)`, amount: `${Math.ceil(totalBags * 0.22).toLocaleString()} Bags` },
      { label: `Roof slabs / RCC work (~30%)`, amount: `${Math.ceil(totalBags * 0.30).toLocaleString()} Bags` },
      { label: `Brick masonry mortar (~18%)`, amount: `${Math.ceil(totalBags * 0.18).toLocaleString()} Bags` },
      { label: `Plaster work (~20%)`, amount: `${Math.ceil(totalBags * 0.20).toLocaleString()} Bags` },
      { label: `Flooring & miscellaneous (~10%)`, amount: `${Math.max(totalBags - Math.ceil(totalBags * 0.22) - Math.ceil(totalBags * 0.30) - Math.ceil(totalBags * 0.18) - Math.ceil(totalBags * 0.20), 0).toLocaleString()} Bags` },
      { label: `Total Cement Bags`, amount: `${totalBags.toLocaleString()} Bags` },
      { label: `Total Estimated Cement Budget`, amount: formatPKR(totalCost), isTotal: true },
    ],
    notes: ['Stage shares are the standard estimator split for a residential frame (foundation/columns 22%, roof slabs 30%, masonry mortar 18%, plaster 20%, flooring/misc 10%) — useful for staged ordering so cement is not bought all at once and left to spoil.', 'For one 100 sq ft roof slab (6-inch thick, 1:2:4 mix), allow roughly 40–44 bags. Order 5% extra for wastage and never store bags directly on the floor.'],
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
      { label: 'Brick Cost', amount: formatPKR(totalCost) },
      { label: `Mortar cement for laying (~2.2 bags per 1,000 bricks)`, amount: `${Math.ceil((totalBricks / 1000) * 2.2).toLocaleString()} Bags ≈ ${formatPKR(Math.ceil((totalBricks / 1000) * 2.2) * 1450)}` },
      { label: `Mortar sand (~9 cft per 1,000 bricks)`, amount: `${Math.round((totalBricks / 1000) * 9).toLocaleString()} cft ≈ ${formatPKR(Math.round((totalBricks / 1000) * 9) * 65)}` },
      { label: 'Bricks + Laying Mortar (materials)', amount: formatPKR(totalCost + Math.ceil((totalBricks / 1000) * 2.2) * 1450 + Math.round((totalBricks / 1000) * 9) * 65), isTotal: true },
    ],
    notes: ['Mortar for 1,000 Awwal bricks (10mm joints) is about 2.2 cement bags and 9 cft sand — budgeted here at Rs 1,450/bag and Rs 65/cft so you can order everything together.', 'Rule of thumb for a single wall: a 9-inch wall takes ~13 bricks per sq ft of wall, a 4.5-inch partition ~7 per sq ft.'],
  };
}

export function calculateSteelRequirement(inputs: Record<string, any>): CalculatorOutput {
  const coveredArea = safeNumber(inputs.coveredArea, 2000);
  const kgFactor = 3.5; // ~3.5 kg steel per sq ft covered area for Grade 60 de-formed bars
  const totalKg = coveredArea * kgFactor;
  const totalTons = totalKg / 1000;
  const ratePerTon = safeNumber(inputs.ratePerTon, 255000); // Canonical market-rate fallback (src/lib/db/dataProvider.ts)
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
      { label: `Bar #3 (10mm) — main bars ~40%`, amount: `${Math.round(totalKg * 0.40).toLocaleString()} kg ≈ ${formatPKR(totalCost * 0.40)}` },
      { label: `Bar #4 (13mm) — beams/columns ~35%`, amount: `${Math.round(totalKg * 0.35).toLocaleString()} kg ≈ ${formatPKR(totalCost * 0.35)}` },
      { label: `Bar #5 (16mm) — heavy members ~15%`, amount: `${Math.round(totalKg * 0.15).toLocaleString()} kg ≈ ${formatPKR(totalCost * 0.15)}` },
      { label: `Bar #2 (6mm) — stirrups/rings ~10%`, amount: `${Math.round(totalKg * 0.10).toLocaleString()} kg ≈ ${formatPKR(totalCost * 0.10)}` },
      { label: 'Metric Tons Required', amount: `${totalTons.toFixed(3)} Tons` },
      { label: 'Total Steel Budget', amount: formatPKR(totalCost), isTotal: true },
    ],
    notes: ['Bar-size shares follow a typical residential frame (40% 10mm, 35% 13mm, 15% 16mm, 10% stirrups). Your structural drawing governs exact cutting lists — share this split with your steel supplier for bundled pricing.', 'Add roughly 3–5% for cutting waste and laps when placing the order.'],
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
      { label: `Tiles for floor (before wastage)`, amount: `${Math.ceil(rawTilesNeeded)} Pieces` },
      { label: `Cutting & Laying Wastage (${wastagePct}%)`, amount: `+${(totalSqFtWithWastage - roomAreaSqFt).toFixed(1)} sq ft` },
      { label: `Total Tiles to Buy`, amount: `${totalTilesWithWastage} Pieces` },
      { label: `Boxes to order (≈4 large tiles/box)`, amount: `${Math.ceil(totalTilesWithWastage / 4)} Boxes` },
      { label: `Tile material cost @ Rs ${pricePerSqFt}/sq ft`, amount: formatPKR(totalCost) },
      { label: `Adhesive/grout & spacers @ Rs 35/sq ft`, amount: formatPKR(Math.round(totalSqFtWithWastage * 35)) },
      { label: `Laying labour @ Rs 130/sq ft`, amount: formatPKR(Math.round(totalSqFtWithWastage * 130)) },
      { label: 'Tiles + Fixing (complete floor)', amount: formatPKR(totalCost + Math.round(totalSqFtWithWastage * 35) + Math.round(totalSqFtWithWastage * 130)), isTotal: true },
    ],
    notes: ['Box count assumes 4 large-format tiles per box — check the tiles-per-box printed on your chosen tile before ordering, and keep one spare box for future repairs (same batch/shade).', 'Adhesive/grout (Rs 35/sq ft) and laying labour (Rs 130/sq ft) are Oct-2026 market estimates; marble and wooden flooring price very differently.'],
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

  // Comparison with Petrol car doing 12 km/L at OGRA 3 Oct 2026 RON-92 rate: Rs. 392.76/L
  const petrolPricePerLiter = 392.76;
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
      `Comparison assumes a 1.5L petrol car averaging 12 km/L at Rs. ${petrolPricePerLiter}/L (OGRA RON-92 rate, 3 Oct 2026).`,
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
