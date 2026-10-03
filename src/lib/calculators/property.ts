import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Pakistani Land Area Units Converter (Standard 272.25 sq ft Marla vs Lahore LDA 225 sq ft Marla)
 */
export function calculateAreaConverter(inputs: Record<string, any>): CalculatorOutput {
  const value = safeNumber(inputs.value, 10);
  const fromUnit = inputs.fromUnit || 'marla';
  const marlaStandard = String(inputs.marlaType) === '225' ? 225 : 272.25; // standard Revenue Board vs Lahore LDA

  // Convert everything to Square Feet first
  let sqFt = 0;
  switch (fromUnit) {
    case 'sqft':
      sqFt = value;
      break;
    case 'sqyard':
    case 'gaj':
      sqFt = value * 9;
      break;
    case 'marla':
      sqFt = value * marlaStandard;
      break;
    case 'kanal':
      sqFt = value * marlaStandard * 20;
      break;
    case 'acre':
      sqFt = value * 43560;
      break;
    case 'sqmeter':
      sqFt = value * 10.7639;
      break;
    case 'karam':
      // 1 Sarsahi = 1 sq karam = 30.25 sq ft (5.5 ft x 5.5 ft)
      sqFt = value * 30.25;
      break;
    default:
      sqFt = value * marlaStandard;
  }

  // Derive all other units
  const marlas = sqFt / marlaStandard;
  const kanals = marlas / 20;
  const acres = sqFt / 43560;
  const sqYards = sqFt / 9;
  const sqMeters = sqFt / 10.7639;

  return {
    primaryResult: {
      id: 'marlaResult',
      label: 'Calculated Land Area in Marlas',
      value: `${marlas.toFixed(2)} Marla`,
      type: 'text',
      highlight: true,
      subtext: `Using 1 Marla = ${marlaStandard} Sq. Ft.`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'kanalResult', label: 'Kanals', value: `${kanals.toFixed(3)} Kanal`, type: 'text' },
      { id: 'sqftResult', label: 'Square Feet (sq ft)', value: `${formatNumber(sqFt, 1)} Sq. Ft.`, type: 'text' },
      { id: 'sqyardResult', label: 'Square Yards (Gaj)', value: `${formatNumber(sqYards, 1)} Sq. Yards`, type: 'text' },
      { id: 'acreResult', label: 'Acres', value: `${acres.toFixed(4)} Acre`, type: 'text' },
    ],
    breakdown: [
      { label: `Square Feet (Sq. Ft.)`, amount: `${formatNumber(sqFt, 2)} sq ft` },
      { label: `Square Yards (Gaj)`, amount: `${formatNumber(sqYards, 2)} sq yard` },
      { label: `Marlas (at ${marlaStandard} sq ft/marla)`, amount: `${marlas.toFixed(3)} Marla` },
      { label: `Kanals (20 Marlas = 1 Kanal)`, amount: `${kanals.toFixed(4)} Kanal` },
      { label: `Acres (8 Kanals = 1 Acre)`, amount: `${acres.toFixed(5)} Acre` },
      { label: `Square Meters`, amount: `${formatNumber(sqMeters, 2)} sq m` },
    ],
    notes: [
      'Pakistan Revenue Record (Patwari) standard: 1 Marla = 272.25 sq ft (9 Sarsahis).',
      'Lahore Development Authority (LDA) and urban societies standard: 1 Marla = 225 sq ft.',
    ],
  };
}

/**
 * Complete House Construction Cost Estimator (Grey Structure + Finishing)
 */
export function calculateConstructionCost(inputs: Record<string, any>): CalculatorOutput {
  const coveredArea = safeNumber(inputs.coveredArea, 2200); // 5 Marla double story is ~2000-2400 sq ft
  const constructionGrade = inputs.grade || 'a-standard'; // economy, a-standard, a-plus, luxury

  // Rates in Pakistan — August 2026 prevailing market rates
  // Grey Structure: Rs. 2,600–3,800/sq ft | Finishing: Rs. 2,200–4,800/sq ft
  let greyRate = 2900;
  let finishRate = 2500;

  if (constructionGrade === 'a-plus') {
    greyRate = 3300;
    finishRate = 3300;
  } else if (constructionGrade === 'luxury') {
    greyRate = 3800;
    finishRate = 4800;
  } else if (constructionGrade === 'economy') {
    greyRate = 2600;
    finishRate = 2000;
  }

  const totalRatePerSqFt = greyRate + finishRate;
  const totalGreyCost = coveredArea * greyRate;
  const totalFinishCost = coveredArea * finishRate;
  const totalCost = coveredArea * totalRatePerSqFt;

  // Material Breakdown Estimations for Grey Structure.
  // Single source of truth for material rates: src/lib/db/dataProvider.ts (DEFAULT_MARKET_RATES).
  // These fallbacks must match 'steel_grade60' and 'cement_bag' there.
  const STEEL_RATE_PER_TON = 255000; // Pakistan Steel Re-rolling Mills Association
  const CEMENT_RATE_PER_BAG = 1450; // All Pakistan Cement Manufacturers Association
  const BRICK_RATE_PER_1000 = 21000; // Awwal grade

  // Bricks: ~26 bricks per sq ft covered area
  const bricksCount = Math.round(coveredArea * 26);
  const bricksCost = (bricksCount / 1000) * BRICK_RATE_PER_1000;

  // Cement: ~0.46 bags per sq ft covered area
  const cementBags = Math.round(coveredArea * 0.46);
  const cementCost = cementBags * CEMENT_RATE_PER_BAG;

  // Steel / Rebar: ~3.5 kg per sq ft covered area (Grade 60 deformed)
  const steelTons = (coveredArea * 3.5) / 1000;
  const steelCost = steelTons * STEEL_RATE_PER_TON;

  // Sand & Crush:
  const sandCost = coveredArea * 200;
  const crushCost = coveredArea * 300;

  // Labour & rough-in plumbing/electrical:
  const labourCost = coveredArea * 600;

  return {
    primaryResult: {
      id: 'totalCost',
      label: 'Estimated Total Construction Cost',
      value: formatPKR(totalCost),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `@ Rs. ${totalRatePerSqFt.toLocaleString()} / Sq. Ft. (${coveredArea.toLocaleString()} sq ft)`,
    },
    secondaryResults: [
      { id: 'greyCost', label: 'Grey Structure Cost', value: formatPKR(totalGreyCost), type: 'currency' },
      { id: 'finishCost', label: 'Finishing Cost', value: formatPKR(totalFinishCost), type: 'currency' },
      { id: 'ratePerSqFt', label: 'All-In Rate per Sq. Ft.', value: `Rs. ${totalRatePerSqFt.toLocaleString()}`, type: 'text' },
      { id: 'cementBags', label: 'Estimated Cement Required', value: `${cementBags.toLocaleString()} Bags`, type: 'text' },
    ],
    breakdown: [
      { label: `Grey Structure (${coveredArea.toLocaleString()} sq ft × Rs. ${greyRate.toLocaleString()})`, amount: formatPKR(totalGreyCost) },
      { label: `Bricks — ${bricksCount.toLocaleString()} Awwal (@ Rs. ${BRICK_RATE_PER_1000.toLocaleString()} per 1,000)`, amount: formatPKR(bricksCost) },
      { label: `Cement — ${cementBags.toLocaleString()} Bags (@ Rs. ${CEMENT_RATE_PER_BAG.toLocaleString()} per bag)`, amount: formatPKR(cementCost) },
      { label: `Steel Rebar Grade 60 — ${steelTons.toFixed(2)} Tons (@ Rs. ${STEEL_RATE_PER_TON.toLocaleString()}/ton)`, amount: formatPKR(steelCost) },
      { label: `Sand (Ravi/Chenab) & Margalla Crush`, amount: formatPKR(sandCost + crushCost) },
      { label: `Labour Charges — Grey Structure`, amount: formatPKR(labourCost) },
      { label: `Complete Finishing (Tiles, Paint, Woodwork, Sanitary, Electricals)`, amount: formatPKR(totalFinishCost) },
      { label: `Total Estimated Construction Budget`, amount: formatPKR(totalCost), isTotal: true },
    ],
    chartType: 'pie',
    chartData: [
      { name: 'Grey Structure', value: Math.round(totalGreyCost), color: '#475569' },
      { name: 'Finishing & Fittings', value: Math.round(totalFinishCost), color: '#16a34a' },
    ],
    notes: [
      'Rates based on Pakistan construction market benchmarks (Grade-A quality). Material fallback rates match the market-rate table in src/lib/db/dataProvider.ts.',
      `Steel: Grade-60 deformed rebar @ Rs. ${STEEL_RATE_PER_TON.toLocaleString()}/ton. Cement: OPC @ Rs. ${CEMENT_RATE_PER_BAG.toLocaleString()}/bag. Bricks: Awwal-grade @ Rs. ${BRICK_RATE_PER_1000.toLocaleString()} per 1,000.`,
      'Finishing cost includes flooring tiles, sanitary ware, kitchen cabinets, internal doors, ceiling plaster, and paint.',
    ],
  };
}
