import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { BPS_SCALES_2026, ADHOC_ALLOWANCES } from '../data/bps-data';
import { SALARIED_TAX_SLABS, NON_SALARIED_TAX_SLABS } from '../data/tax-slabs-data';
import { PROTECTED_SLABS, UNPROTECTED_SLABS, ELECTRICITY_CONSTANTS } from '../data/electricity-data';
import { BASELINE_FX_RATES } from './currency';
import { ZAKAT_DEFAULTS } from '../data/zakat-data';
import { PAK_UNIVERSITY_FORMULAS } from '../data/universities-data';

// ==========================================
// 1. SALARY & GOVT EMPLOYEES ENGINES
// ==========================================

export function calculateLeaveEncashment(inputs: Record<string, any>): CalculatorOutput {
  const lastBasic = safeNumber(inputs.lastBasic, 75000);
  const leaveDays = Math.min(safeNumber(inputs.leaveDays, 365), 365); // Max 365 days / 1 year

  // Leave Encashment = (Last Basic Pay * Leave Days) / 30
  const encashmentAmount = (lastBasic * leaveDays) / 30;

  return {
    primaryResult: {
      id: 'encashment',
      label: 'Total Leave Encashment Amount',
      value: formatPKR(encashmentAmount),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `For ${leaveDays} Days of Accumulated LPR`,
    },
    secondaryResults: [
      { id: 'dailyRate', label: 'Daily Basic Rate', value: formatPKR(lastBasic / 30), type: 'currency' },
      { id: 'lastBasic', label: 'Last Drawn Basic Pay', value: formatPKR(lastBasic), type: 'currency' },
    ],
    breakdown: [
      { label: 'Last Drawn Basic Pay', amount: formatPKR(lastBasic) },
      { label: `Accumulated Un-availed Leave Days (LPR)`, amount: `${leaveDays} Days` },
      { label: 'Calculated Encashment Lump Sum', amount: formatPKR(encashmentAmount), isTotal: true },
    ],
    notes: ['Under Revised Leave Rules, maximum encashment payable in lieu of LPR is 365 days basic pay.'],
  };
}

export function calculateFamilyPension(inputs: Record<string, any>): CalculatorOutput {
  const jurisdiction = inputs.jurisdiction || 'punjab'; // 'punjab' or 'federal'
  const pensionerBasicPay = safeNumber(inputs.pensionerBasicPay, 80000);
  const serviceYears = Math.min(safeNumber(inputs.serviceYears, 28), 30);
  
  // Full gross pension
  const grossPension = (pensionerBasicPay * serviceYears * 7) / 300;
  // Family pension is 75% of Gross Pension in federal and provincial rules
  const familyPensionMonthly = grossPension * 0.75;
  const medicalAllowance = grossPension * 0.25;
  const totalFamilyPension = Math.max(10000, familyPensionMonthly + medicalAllowance);

  const durationNote = jurisdiction === 'punjab'
    ? 'Punjab Notification (July 2026): Lifetime family pension for widows and unmarried daughters (10-year limit abolished).'
    : 'Federal / General OM: Lifetime for widow until remarriage; eligible dependent children up to age 21.';

  return {
    primaryResult: {
      id: 'familyPension',
      label: 'Monthly Net Family Pension',
      value: formatPKR(totalFamilyPension),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: '75% of Gross Pension + Medical Allowance',
    },
    secondaryResults: [
      { id: 'grossPension', label: 'Original Gross Pension', value: formatPKR(grossPension), type: 'currency' },
      { id: 'medical', label: 'Medical Allowance (25%)', value: formatPKR(medicalAllowance), type: 'currency' },
      { id: 'jurisdiction', label: 'Jurisdiction & Duration', value: jurisdiction === 'punjab' ? 'Punjab: Lifetime Restored' : 'Federal: Standard', type: 'badge' },
    ],
    breakdown: [
      { label: 'Deceased Employee Basic Pay', amount: formatPKR(pensionerBasicPay) },
      { label: `Service Rendered (${serviceYears} Years)`, amount: `${serviceYears} Years` },
      { label: 'Base Family Pension (75%)', amount: formatPKR(familyPensionMonthly) },
      { label: 'Pensioner Medical Allowance', amount: formatPKR(medicalAllowance) },
      { label: 'Total Monthly Family Pension (Min Rs 10,000)', amount: formatPKR(totalFamilyPension), isTotal: true },
    ],
    notes: [
      durationNote,
      'If multiple surviving widows exist, the pension is divided in equal shares among them.',
    ],
  };
}

export function calculatePromotionPay(inputs: Record<string, any>): CalculatorOutput {
  const currentBps = safeNumber(inputs.currentBps, 16);
  const currentBasic = safeNumber(inputs.currentBasic, 48000);
  const nextBps = safeNumber(inputs.nextBps, 17);

  const currentScale = BPS_SCALES_2026[currentBps] || BPS_SCALES_2026[16];
  const nextScale = BPS_SCALES_2026[nextBps] || BPS_SCALES_2026[17];

  // In Pakistan Pay Fixation rules on promotion:
  // Add 1 presumptive premature increment of the lower scale to current basic pay
  const presumptiveBasic = currentBasic + currentScale.increment;

  // Fix in higher scale at equal stage, or next higher stage if not equal, or minimum if below minimum
  let newFixedBasic = nextScale.minPay;
  if (presumptiveBasic > nextScale.minPay) {
    const diff = presumptiveBasic - nextScale.minPay;
    const stage = Math.ceil(diff / nextScale.increment);
    newFixedBasic = nextScale.minPay + stage * nextScale.increment;
  }

  const monthlyGain = newFixedBasic - currentBasic;

  return {
    primaryResult: {
      id: 'newFixedBasic',
      label: `New Fixed Basic Pay (BPS-${nextBps})`,
      value: formatPKR(newFixedBasic),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `Monthly Basic Pay Increase: +${formatPKR(monthlyGain)}`,
    },
    secondaryResults: [
      { id: 'presumptive', label: 'Premature Increment Added', value: formatPKR(currentScale.increment), type: 'currency' },
      { id: 'annualGain', label: 'Annual Basic Gain', value: formatPKR(monthlyGain * 12), type: 'currency' },
    ],
    breakdown: [
      { label: `Current Basic Pay (BPS-${currentBps})`, amount: formatPKR(currentBasic) },
      { label: `Premature Increment of BPS-${currentBps}`, amount: formatPKR(currentScale.increment) },
      { label: 'Presumptive Pay for Fixation', amount: formatPKR(presumptiveBasic) },
      { label: `New Fixed Basic in BPS-${nextBps}`, amount: formatPKR(newFixedBasic), isTotal: true },
    ],
  };
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
