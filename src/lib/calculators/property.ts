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
      { label: `Acres (${(43560 / (marlaStandard * 20)).toFixed(2)} Kanals = 1 Acre at this Marla standard)`, amount: `${acres.toFixed(5)} Acre` },
      { label: `Square Meters`, amount: `${formatNumber(sqMeters, 2)} sq m` },
    ],
    notes: [
      'Pakistan Revenue Record (Patwari) standard: 1 Marla = 272.25 sq ft (9 Sarsahis), so 8 Kanal = 1 Acre only under this 272.25 sq ft standard.',
      'Lahore Development Authority (LDA) and urban societies standard: 1 Marla = 225 sq ft.',
    ],
  };
}

/**
 * Complete House Construction Cost Estimator (Grey Structure + Finishing)
 */
export function calculateConstructionCost(inputs: Record<string, any>): CalculatorOutput {
  const coveredArea = safeNumber(inputs.coveredArea, 2200); // 5 Marla double storey is ~2000-2400 sq ft
  const constructionGrade = inputs.grade || 'a-standard'; // economy, a-standard, a-plus, luxury

  /* Material price book — 2026 market estimates. Cement/steel/brick anchors
     match src/lib/db/dataProvider.ts (DEFAULT_MARKET_RATES). Quantities come
     from standard Pakistan residential estimating factors per sq ft of
     covered area; labour is the mason/helper (mistri/mazdoor) component. */
  const CEMENT_RATE_PER_BAG = 1450;
  const STEEL_RATE_PER_TON = 255000;
  const BRICK_RATE_PER_1000 = 21000;
  const SAND_RATE_PER_CFT = 65;
  const CRUSH_RATE_PER_CFT = 115; // Margalla/crush bajri

  type GradeFactors = {
    bricksPerSqFt: number; cementBagsPerSqFt: number; steelKgPerSqFt: number;
    greyLabourPerSqFt: number; finishRate: number; label: string;
  };
  const GRADES: Record<string, GradeFactors> = {
    economy: { bricksPerSqFt: 24, cementBagsPerSqFt: 0.42, steelKgPerSqFt: 3.0, greyLabourPerSqFt: 500, finishRate: 2000, label: 'Economy' },
    'a-standard': { bricksPerSqFt: 26, cementBagsPerSqFt: 0.48, steelKgPerSqFt: 3.5, greyLabourPerSqFt: 600, finishRate: 2500, label: 'A-Grade Standard' },
    'a-plus': { bricksPerSqFt: 28, cementBagsPerSqFt: 0.52, steelKgPerSqFt: 4.0, greyLabourPerSqFt: 700, finishRate: 3300, label: 'A+ Premium' },
    luxury: { bricksPerSqFt: 30, cementBagsPerSqFt: 0.56, steelKgPerSqFt: 4.3, greyLabourPerSqFt: 800, finishRate: 4800, label: 'Luxury' },
  };
  const g = GRADES[constructionGrade] || GRADES['a-standard'];

  // ── Grey structure: itemised materials + labour ──
  const bricksCount = Math.round(coveredArea * g.bricksPerSqFt);
  const bricksCost = (bricksCount / 1000) * BRICK_RATE_PER_1000;

  const cementBags = Math.ceil(coveredArea * g.cementBagsPerSqFt);
  const cementCost = cementBags * CEMENT_RATE_PER_BAG;

  const steelKg = coveredArea * g.steelKgPerSqFt;
  const steelTons = steelKg / 1000;
  const steelCost = steelTons * STEEL_RATE_PER_TON;

  const sandCft = Math.round(coveredArea * 0.55);
  const sandCost = sandCft * SAND_RATE_PER_CFT;

  const crushCft = Math.round(coveredArea * 0.38);
  const crushCost = crushCft * CRUSH_RATE_PER_CFT;

  const shutteringCost = coveredArea * 140; // formwork, curing, scaffolding
  const earthworkCost = coveredArea * 90; // excavation, termite/DPC, backfilling
  const greyLabourCost = coveredArea * g.greyLabourPerSqFt;

  const totalGreyCost = bricksCost + cementCost + steelCost + sandCost + crushCost + shutteringCost + earthworkCost + greyLabourCost;
  const greyRate = Math.round(totalGreyCost / coveredArea);

  // ── Finishing: itemised by trade (supply + fixing) ──
  const finishComponents: { label: string; share: number }[] = [
    { label: 'Flooring — tiles / marble / wooden floors', share: 0.38 },
    { label: 'Woodwork — doors, wardrobes & frames', share: 0.16 },
    { label: 'Sanitary ware & plumbing fixtures', share: 0.14 },
    { label: 'Kitchen — cabinets, counter & fittings', share: 0.12 },
    { label: 'Electrical fittings, fans & lights', share: 0.09 },
    { label: 'Paint, polish & wall finish', share: 0.08 },
    { label: 'Ceiling & final plaster touches', share: 0.03 },
  ];
  const totalFinishCost = coveredArea * g.finishRate;
  const finishRows = finishComponents.map((c) => ({
    label: `Finishing — ${c.label}`,
    amount: Math.round(totalFinishCost * c.share),
  }));

  const totalCost = totalGreyCost + totalFinishCost;
  const totalRatePerSqFt = Math.round(totalCost / coveredArea);

  const areaStr = coveredArea.toLocaleString('en-PK');
  return {
    primaryResult: {
      id: 'totalCost',
      label: 'Estimated Total Construction Cost',
      value: formatPKR(totalCost),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `@ Rs. ${totalRatePerSqFt.toLocaleString('en-PK')} / sq ft over ${areaStr} sq ft (${g.label}) — full itemised estimate below.`,
    },
    secondaryResults: [
      { id: 'greyCost', label: 'Grey Structure (itemised)', value: formatPKR(totalGreyCost), type: 'currency' },
      { id: 'finishCost', label: 'Finishing (itemised)', value: formatPKR(totalFinishCost), type: 'currency' },
      { id: 'cementBags', label: 'Cement Needed', value: `${cementBags.toLocaleString('en-PK')} bags`, type: 'text' },
      { id: 'steelTons', label: 'Steel (Sarya) Needed', value: `${steelTons.toFixed(2)} tons`, type: 'text' },
    ],
    breakdown: [
      { label: `Cement — ${cementBags.toLocaleString('en-PK')} bags @ Rs ${CEMENT_RATE_PER_BAG.toLocaleString('en-PK')}/bag`, amount: Math.round(cementCost) },
      { label: `Sarya (Grade-60 steel) — ${steelTons.toFixed(2)} tons @ Rs ${STEEL_RATE_PER_TON.toLocaleString('en-PK')}/ton`, amount: Math.round(steelCost) },
      { label: `Bricks (Awwal) — ${bricksCount.toLocaleString('en-PK')} @ Rs ${BRICK_RATE_PER_1000.toLocaleString('en-PK')}/1,000`, amount: Math.round(bricksCost) },
      { label: `Sand — ${sandCft.toLocaleString('en-PK')} cft @ Rs ${SAND_RATE_PER_CFT}/cft`, amount: Math.round(sandCost) },
      { label: `Crush / Bajri — ${crushCft.toLocaleString('en-PK')} cft @ Rs ${CRUSH_RATE_PER_CFT}/cft`, amount: Math.round(crushCost) },
      { label: 'Shuttering, scaffolding & curing', amount: Math.round(shutteringCost) },
      { label: 'Earthwork, termite proofing & DPC', amount: Math.round(earthworkCost) },
      { label: 'Labour — mistri & mazdoor (grey structure)', amount: Math.round(greyLabourCost) },
      { label: `Grey structure subtotal (@ Rs ${greyRate.toLocaleString('en-PK')}/sq ft)`, amount: Math.round(totalGreyCost) },
      ...finishRows,
      { label: `Complete house — grey + finishing (${areaStr} sq ft, ${g.label})`, amount: Math.round(totalCost), isTotal: true },
    ],
    chartType: 'pie',
    chartData: [
      { name: 'Cement', value: Math.round(cementCost), color: '#64748b' },
      { name: 'Steel (Sarya)', value: Math.round(steelCost), color: '#334155' },
      { name: 'Bricks', value: Math.round(bricksCost), color: '#b45309' },
      { name: 'Sand + Bajri', value: Math.round(sandCost + crushCost), color: '#ca8a04' },
      { name: 'Labour & Other Grey', value: Math.round(greyLabourCost + shutteringCost + earthworkCost), color: '#0ea5e9' },
      { name: 'Finishing', value: Math.round(totalFinishCost), color: '#16a34a' },
    ],
    notes: [
      'Every material is estimated from covered area using standard Pakistan residential factors — cement 0.42–0.56 bags/sq ft, steel 3.0–4.3 kg/sq ft, bricks 24–30/sq ft by finishing grade — then priced at the rates shown. Quantities scale with your grade choice here.',
      `Price book (Oct 2026 market estimates): cement Rs ${CEMENT_RATE_PER_BAG.toLocaleString('en-PK')}/bag, Grade-60 sarya Rs ${STEEL_RATE_PER_TON.toLocaleString('en-PK')}/ton, Awwal bricks Rs ${BRICK_RATE_PER_1000.toLocaleString('en-PK')}/1,000, sand Rs ${SAND_RATE_PER_CFT}/cft, crush/bajri Rs ${CRUSH_RATE_PER_CFT}/cft. City prices move ±10–15% — confirm with your local supplier before ordering.`,
      'Not included: plot/land, boundary wall & gate, water boring, sewerage and utility connections, architect/map approval fees, and escalation during construction. Add a 5–10% contingency for peace of mind.',
    ],
  };
}
