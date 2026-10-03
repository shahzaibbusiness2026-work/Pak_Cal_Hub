/**
 * Numeric accuracy tests for the LIVE electricity calculator
 * (src/lib/calculators/electricity.ts — the implementation the UI actually runs).
 *
 * Tariff ground truth: NEPRA uniform domestic Schedule of Tariff, CY 2026
 * (effective 1 Jan 2026; fixed charges per-kW of sanctioned load since Feb 2026),
 * corroborated Oct 2026 from The News, Pakistan Today, Pakistan Observer, TechJuice.
 *
 * NOTE on the "228-unit real bill" referenced during review: real DISCO bills apply
 * slab benefit (each unit block billed at its own slab rate — e.g. 228 units =
 * 100×22.44 + 100×28.91 + 28×33.10), so the engine's total (Rs 9,285) is lower than
 * the flat marginal-rate reconstruction (Rs 11,029). Slab benefit is the correct
 * Pakistani billing practice; the surcharge/tax structure below matches real bills.
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

  // --- 1. Full bill: 228 units unprotected, FPA 0.70, QTA 0.35, 2 kW load, Rs 7.50 meter rent ---
  // Energy: 100×22.44 + 100×28.91 + 28×33.10 = 6,061.80
  // Fixed: 350/kW × 2 = 700 | FC: 228×3.23 = 736.44 | FPA: 228×0.70 = 159.60
  // QTA: 228×0.35 = 79.80 | Meter: 7.50
  // ED: 1.5% × 6,061.80 = 90.927 | ED on FPA: 159.60 × 1.5% = 2.394
  // GST 18% × (6,061.80+700+736.44+159.60+79.80+7.50+90.927+2.394) = 1,410.92
  // Total: 6,061.80+700+736.44+159.60+79.80+7.50+90.927+2.394+1,410.92+35 = 9,284.38 → 9,284
  const bill228 = calculateElectricityBill({
    units: 228,
    consumerType: 'unprotected',
    sanctionedLoadKw: 2,
    fpaRate: 0.7,
    qtaRate: 0.35,
    meterRent: 7.5,
  });
  assert(pkrToNumber(bill228.primaryResult.value) === 9284, '228 units bill = Rs 9,284 (slab benefit + real-bill tax structure)');
  assert(
    bill228.secondaryResults?.find((r) => r.id === 'consumerCategory')?.value === 'Unprotected',
    '228 units categorised as Unprotected'
  );
  assert(
    Boolean(bill228.breakdown?.some((b) => b.label.includes('Electricity Duty on FPA'))),
    'ED-on-FPA line present when FPA is charged'
  );

  // --- 2. Lifeline: 60 units → 50×3.95 + 10×7.74 = 274.90; no fixed charge ---
  // ED: 274.90×1.5% = 4.1235 | GST 18% × (274.90+193.80+7.50+4.1235) = 86.46
  // Total: 274.90+193.80+7.50+4.1235+86.46+35 = 601.78 → 602
  const lifeline = calculateElectricityBill({ units: 60, consumerType: 'lifeline', sanctionedLoadKw: 2 });
  assert(pkrToNumber(lifeline.primaryResult.value) === 602, 'Lifeline 60 units bill = Rs 602 (no fixed charge)');
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
  // Total: 1,704.50+600+484.50+7.50+25.5675+507.97+35 = 3,365.04 → 3,365
  const prot = calculateElectricityBill({ units: 150, consumerType: 'protected', sanctionedLoadKw: 2 });
  assert(pkrToNumber(prot.primaryResult.value) === 3365, 'Protected 150 units bill = Rs 3,365');
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
    Boolean(exempt.breakdown?.some((b) => b.label.includes('Electricity Duty (1.5% of base energy)'))),
    'Tax-exempt bill still levies Electricity Duty'
  );

  // --- 6. Per-kW fixed charges: 350 units, 3 kW → 400/kW × 3 = Rs 1,200 ---
  const fixed = calculateElectricityBill({ units: 350, consumerType: 'unprotected', sanctionedLoadKw: 3 });
  const fixedLine = fixed.breakdown?.find((b) => b.label.startsWith('Fixed Charges'));
  assert(fixedLine !== undefined && pkrToNumber(fixedLine.amount) === 1200, 'Fixed charge = Rs 1,200 for 350 units @ 3 kW');

  // --- 7. ED is 1.5% of base energy only (not of surcharges) ---
  // 100 units unprotected: energy = 2,244 → ED must be exactly 1.5% × 2,244
  const ed100 = calculateElectricityBill({ units: 100, consumerType: 'unprotected', sanctionedLoadKw: 1 });
  const edLine = ed100.breakdown?.find((b) => b.label === 'Electricity Duty (1.5% of base energy)');
  assert(edLine !== undefined && edLine.amount === formatPKR(2244 * 0.015), 'ED = 1.5% of base energy only (Rs 33.66 on Rs 2,244)');

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
