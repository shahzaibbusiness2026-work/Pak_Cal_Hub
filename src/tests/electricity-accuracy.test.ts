/**
 * Numeric accuracy tests for the LIVE electricity calculator
 * (src/lib/calculators/electricity.ts — the implementation the UI actually runs).
 *
 * Tariff ground truth: NEPRA uniform domestic Schedule of Tariff, CY 2026
 * (effective 1 Jan 2026; fixed charges per-kW of sanctioned load since Feb 2026),
 * corroborated Oct 2026 from The News, Pakistan Today, Pakistan Observer, TechJuice.
 *
 * CRITICAL billing rule (proven by two real DISCO bills):
 * unprotected consumers above 200 units are billed ALL units at the single
 * marginal slab rate (no slab benefit) — MEPCO Sep-2026: 412 x Rs. 38.95 =
 * Rs. 16,047.40; LESCO Apr-2026: 228 x Rs. 33.10 = Rs. 7,546.80.
 * Protected / lifeline / unprotected <= 200 units use telescopic slabs.
 * Also verified: ED = 1.5% x (energy + QTA); main GST 18% excludes FPA
 * (FPA carries its own 18% GST on FPA energy + FPA ED); bills round the
 * current-bill and FPA subtotals to whole rupees before adding them.
 */

import {
  calculateElectricityBill,
  calculateSolarSystem,
} from '../lib/calculators/electricity';
import {
  LIFELINE_SLABS,
  PROTECTED_SLABS,
  UNPROTECTED_SLABS,
} from '../lib/data/electricity-data';
import { formatPKR } from '../lib/utils/formatters';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

function pkrToNumber(formatted: string | number | undefined): number {
  // Primary results are whole rupees (e.g. "Rs. 9,284"); keep digits only.
  return Number(String(formatted ?? '').replace(/[^0-9]/g, '')) || 0;
}

function runElectricityAccuracyTests() {
  console.log('\n======================================================');
  console.log('⚡ ELECTRICITY CALCULATOR NUMERIC ACCURACY TESTS (LIVE)');
  console.log('======================================================\n');

  // --- 0. Canonical tariff data sanity ---
  assert(LIFELINE_SLABS[0].rate === 3.95 && LIFELINE_SLABS[1].rate === 7.74, 'Lifeline slabs 3.95 / 7.74');
  assert(PROTECTED_SLABS[0].rate === 10.54 && PROTECTED_SLABS[1].rate === 13.01, 'Protected slabs 10.54 / 13.01');
  assert(
    UNPROTECTED_SLABS.map((s) => s.rate).join(',') === '22.44,28.91,33.1,36.46,38.95,40.22,41.85,47.2',
    'Unprotected slabs match NEPRA CY2026 SOT'
  );

  // --- 1. Real LESCO bill, Apr 2026: 228 units unprotected, FPA 0.70, QTA 0.35, 2 kW load ---
  // Energy (flat marginal rate, no slab benefit above 200 units): 228×33.10 = 7,546.80
  // Fixed: 350/kW × 2 = 700 | FC: 228×3.23 = 736.44 | FPA: 228×0.70 = 159.60
  // QTA: 228×0.35 = 79.80 | Meter: 7.50
  // ED: 1.5% × (7,546.80 + 79.80) = 114.399 | ED on FPA: 159.60 × 1.5% = 2.394
  // Main GST 18% × (7,546.80+700+736.44+79.80+7.50+114.399) = 1,653.29
  // FPA GST 18% × (159.60 + 2.394) = 29.16
  // Total: round(10,838.23) + round(191.15) = 10,838 + 191 = 11,029 — matches the real bill
  const bill228 = calculateElectricityBill({
    units: 228,
    consumerType: 'unprotected',
    sanctionedLoadKw: 2,
    fpaRate: 0.7,
    qtaRate: 0.35,
    meterRent: 7.5,
    tvFee: 0,
  });
  assert(pkrToNumber(bill228.primaryResult.value) === 11029, '228 units bill = Rs 11,029 (matches real Apr-2026 LESCO bill)');
  assert(
    bill228.secondaryResults?.find((r) => r.id === 'consumerCategory')?.value === 'Unprotected',
    '228 units categorised as Unprotected'
  );
  assert(
    Boolean(bill228.breakdown?.some((b) => b.label.includes('Electricity Duty on FPA'))),
    'ED-on-FPA line present when FPA is charged'
  );
  assert(
    Boolean(bill228.breakdown?.some((b) => b.label.includes('no slab benefit'))),
    'Breakdown explains the flat marginal-rate rule above 200 units'
  );

  // --- 1b. Real MEPCO bill, Sep 2026: 412 units unprotected, 2 kW, deferred FPA on 480 units ---
  // Energy: 412×38.95 = 16,047.40 | Fixed: 500/kW × 2 = 1,000 | FC: 412×3.23 = 1,330.76
  // QTA: -285.41 (negative quarterly adjustment) | Meter: 0 | TV: 0
  // ED: 1.5% × (16,047.40 − 285.41) = 236.43
  // Main GST 18% × (16,047.40+1,000+1,330.76−285.41+0+236.43) = 3,299.25 → 3,299
  // Current bill: round(21,628.43) = 21,628
  // FPA (480 units @ 987.89/480): energy 987.89 + ED 14.82 + GST 180.49→180 + other 1,908 = 3,090.71 → 3,091
  // Grand total: 21,628 + 3,091 = 24,719 — matches the real bill to the rupee
  const mepco412 = calculateElectricityBill({
    units: 412,
    consumerType: 'unprotected',
    sanctionedLoadKw: 2,
    fpaRate: 987.89 / 480,
    fpaUnits: 480,
    fpaOther: 1908,
    qtaRate: -285.41 / 412,
    meterRent: 0,
    tvFee: 0,
  });
  assert(pkrToNumber(mepco412.primaryResult.value) === 24719, 'MEPCO 412-unit bill = Rs 24,719 (matches real Sep-2026 bill)');
  const mepcoEnergy = mepco412.secondaryResults?.find((r) => r.id === 'energyCharges');
  assert(pkrToNumber(mepcoEnergy?.value) === 16047, 'MEPCO energy charges = Rs 16,047.40 (412 × 38.95 flat)');

  // --- 2. Lifeline: 60 units → 50×3.95 + 10×7.74 = 274.90; no fixed charge ---
  // ED: 274.90×1.5% = 4.1235 | GST 18% × (274.90+193.80+7.50+4.1235) = 86.46
  // Total: 274.90+193.80+7.50+4.1235+86.46 = 566.78 → 567
  const lifeline = calculateElectricityBill({ units: 60, consumerType: 'lifeline', sanctionedLoadKw: 2 });
  assert(pkrToNumber(lifeline.primaryResult.value) === 567, 'Lifeline 60 units bill = Rs 567 (no fixed charge)');
  assert(
    lifeline.secondaryResults?.find((r) => r.id === 'consumerCategory')?.value === 'Lifeline',
    '60 units categorised as Lifeline'
  );
  assert(
    !Boolean(lifeline.breakdown?.some((b) => b.label.startsWith('Fixed Charges'))),
    'Lifeline bill has no fixed-charge line'
  );

  // --- 3. Protected: 150 units → 100×10.54 + 50×13.01 = 1,704.50; fixed 300/kW × 2 = 600 ---
  // ED: 1,704.50×1.5% = 25.5675 | GST 18% × (1,704.50+600+484.50+7.50+25.5675) = 507.97
  // Total: 1,704.50+600+484.50+7.50+25.5675+507.97 = 3,330.04 → 3,330
  const prot = calculateElectricityBill({ units: 150, consumerType: 'protected', sanctionedLoadKw: 2 });
  assert(pkrToNumber(prot.primaryResult.value) === 3330, 'Protected 150 units bill = Rs 3,330');
  assert(
    prot.secondaryResults?.find((r) => r.id === 'consumerCategory')?.value === 'Protected',
    '150 units categorised as Protected'
  );

  // --- 4. GST applies to bills ≤ 200 units too (gate removed) ---
  const smallBill = calculateElectricityBill({ units: 150, consumerType: 'unprotected', sanctionedLoadKw: 2 });
  assert(
    Boolean(smallBill.breakdown?.some((b) => b.label.includes('General Sales Tax'))),
    'GST 18% charged on a 150-unit bill (no more units>200 gate)'
  );

  // --- 5. Tax-exempt consumer: GST zeroed, ED still levied ---
  const exempt = calculateElectricityBill({ units: 150, consumerType: 'unprotected', sanctionedLoadKw: 2, isTaxExempt: true });
  assert(
    !Boolean(exempt.breakdown?.some((b) => b.label.includes('General Sales Tax'))),
    'Tax-exempt bill has no GST line'
  );
  assert(
    Boolean(exempt.breakdown?.some((b) => b.label.includes('Electricity Duty (1.5% of energy + QTA)'))),
    'Tax-exempt bill still levies Electricity Duty'
  );

  // --- 6. Per-kW fixed charges: 350 units, 3 kW → 400/kW × 3 = Rs 1,200 ---
  const fixed = calculateElectricityBill({ units: 350, consumerType: 'unprotected', sanctionedLoadKw: 3 });
  const fixedLine = fixed.breakdown?.find((b) => b.label.startsWith('Fixed Charges'));
  assert(fixedLine !== undefined && pkrToNumber(fixedLine.amount) === 1200, 'Fixed charge = Rs 1,200 for 350 units @ 3 kW');

  // --- 7. ED is 1.5% of (energy + QTA) — verified on two real bills ---
  // 100 units unprotected, QTA 0: energy = 2,244 → ED must be exactly 1.5% × 2,244
  const ed100 = calculateElectricityBill({ units: 100, consumerType: 'unprotected', sanctionedLoadKw: 1 });
  const edLine = ed100.breakdown?.find((b) => b.label === 'Electricity Duty (1.5% of energy + QTA)');
  assert(edLine !== undefined && edLine.amount === formatPKR(2244 * 0.015), 'ED = 1.5% of (energy + QTA): Rs 33.66 on Rs 2,244');

  // --- 7b. Negative QTA reduces the ED base (MEPCO Sep-2026 bill: ED = 1.5% × (16,047.40 − 285.41)) ---
  const edNeg = calculateElectricityBill({ units: 412, consumerType: 'unprotected', sanctionedLoadKw: 2, qtaRate: -285.41 / 412, meterRent: 0, tvFee: 0 });
  const edNegLine = edNeg.breakdown?.find((b) => b.label === 'Electricity Duty (1.5% of energy + QTA)');
  assert(edNegLine !== undefined && edNegLine.amount === formatPKR(236.43), 'ED with negative QTA = Rs 236.43 (matches MEPCO bill)');

  // --- 8. Solar: monthlyBill input drives sizing when monthlyUnits = 0 ---
  // targetUnits = 45,000 / 48 = 937.5 → 8.2 kW → 15 × 585W panels = 8.775 kW
  const solar = calculateSolarSystem({ monthlyBill: 45000, monthlyUnits: 0 });
  assert(String(solar.primaryResult.value).includes('8.78'), 'Solar sizes from bill: 8.78 kW for Rs 45,000 bill');

  // --- 9. Solar: 100% self-consumption → savings = generation × Rs 48 ---
  // expected generation = 8.775 × 115 = 1,009.125 units → 1,009.125 × 48 = 48,438
  const solarFull = calculateSolarSystem({ monthlyBill: 45000, monthlyUnits: 0, selfConsumptionPct: 100 });
  const savings = solarFull.secondaryResults?.find((r) => r.id === 'monthlySavings');
  assert(pkrToNumber(savings?.value) === 48438, 'Solar 100% self-consumption saves Rs 48,438/month');

  // --- 10. Status loss: lifeline/protected selections above their caps become unprotected ---
  const over = calculateElectricityBill({ units: 250, consumerType: 'protected', sanctionedLoadKw: 2 });
  assert(
    over.secondaryResults?.find((r) => r.id === 'consumerCategory')?.value === 'Unprotected',
    'Protected selection at 250 units falls back to Unprotected'
  );

  console.log('\n🎉 ALL ELECTRICITY ACCURACY TESTS PASSED\n');
}

runElectricityAccuracyTests();
