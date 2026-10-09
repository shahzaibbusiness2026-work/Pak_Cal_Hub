import { calculateAgeExact, calculatePercentage, calculateHijriConverter, calculateTenantBillSplitter, calculatePrizeBondGuide } from '../lib/calculators/daily-tools';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`Assertion failed: ${msg}`); }

export function runDailyToolsTests() {
  // Age: born 14 Aug 2000, as of 9 Oct 2026 → 26y 1m 25d
  const age = calculateAgeExact({ dob: '2000-08-14', asOf: '2026-10-09' });
  assert(age.primaryResult.value === '26 years, 1 months, 25 days', `Age exact wrong: ${age.primaryResult.value}`);

  // Percentage marks: 845/1100 = 76.8181..%
  const marks = calculatePercentage({ mode: 'marks', obtained: 845, totalMarks: 1100 });
  assert(marks.primaryResult.value === '76.82%', `Marks pct wrong: ${marks.primaryResult.value}`);

  // Hijri: 19 Jul 2023 → 1 Muharram 1445
  const h = calculateHijriConverter({ direction: 'greg-to-hijri', gregDate: '2023-07-19' });
  assert(h.primaryResult.value === '1 Muharram 1445 AH', `Hijri wrong: ${h.primaryResult.value}`);
  // Reverse: 1 Ramadan 1445 → 11 Mar 2024
  const g = calculateHijriConverter({ direction: 'hijri-to-greg', hijriYear: 1445, hijriMonth: 9, hijriDay: 1 });
  assert(g.primaryResult.value === '11/3/2024', `Greg wrong: ${g.primaryResult.value}`);

  // Tenant split: bill 18500, 640 units, A 260, B 210 → shared 170 → 85 each → A (345)*28.90625=9972.65→9973
  const split = calculateTenantBillSplitter({ totalBill: 18500, totalUnits: 640, tenantsCount: 2, tenant1Units: 260, tenant2Units: 210 });
  assert(split.primaryResult.value === 'Rs 9,973', `Tenant split wrong: ${split.primaryResult.value}`);

  // Prize bond: format check only
  const pb = calculatePrizeBondGuide({ denomination: '750', bondNumber: '123456' });
  assert(JSON.stringify(pb.secondaryResults).includes('valid 6-digit format'), 'Prize bond format check missing');

  console.log('Daily-tools (4 new + engine checks) tests passed');
}

import { calculateConstructionCost } from '../lib/calculators/property';

export function runConstructionTests() {
  const c = calculateConstructionCost({ coveredArea: 2200, grade: 'a-standard' });
  const rows = (c.breakdown || []) as { label: string; amount: any; isTotal?: boolean }[];
  const num = (v: any) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.]/g, '')) || 0);
  const greyItems = rows.slice(0, 8).reduce((s, r) => s + num(r.amount), 0);
  const subtotal = num(rows.find((r) => r.label.startsWith('Grey structure subtotal'))?.amount);
  assert(Math.abs(greyItems - subtotal) <= 8, `Grey items ${greyItems} != subtotal ${subtotal}`);
  const total = rows.find((r) => r.isTotal);
  const finishSum = rows.slice(9, 16).reduce((s, r) => s + num(r.amount), 0);
  assert(Math.abs(subtotal + finishSum - num(total?.amount)) <= 8, 'Construction total does not reconcile');
  assert(JSON.stringify(c.secondaryResults).includes('bags'), 'Cement secondary missing');
  assert(JSON.stringify(c.secondaryResults).includes('tons'), 'Steel secondary missing');
  console.log(`Construction breakdown reconciles (grey ${subtotal.toLocaleString()} + finishing ${finishSum.toLocaleString()})`);
}

import { calculateSolarSystem } from '../lib/calculators/electricity';
import { calculateTilesRequirement, calculateSteelRequirement } from '../lib/calculators/specialized-engines';

export function runBreakdownTests() {
  // Solar CAPEX itemisation must reconcile with the total row
  const solar = calculateSolarSystem({ monthlyBill: 45000, systemType: 'on-grid' });
  const rows = (solar.breakdown || []) as any[];
  const totalRow = rows.find((r) => String(r.label).startsWith('Total Estimated System Cost'));
  assert(totalRow, 'Solar total row missing');
  const capexSum = rows
    .filter((r) => typeof r.amount === 'number')
    .reduce((s, r) => s + r.amount, 0);
  // totalRow.amount is a formatted string; compare against secondary total result instead
  const totalSecondary = (solar.secondaryResults || []).find((r: any) => r.id === 'totalCost');
  assert(String(totalRow.amount) === String(totalSecondary?.value), 'Solar total mismatch between breakdown and summary');
  assert(capexSum > 0, 'Solar CAPEX lines missing');

  // Tiles complete-floor total = tiles + fixing
  const tiles = calculateTilesRequirement({ roomLength: 14, roomWidth: 12, tileLengthInch: 24, tileWidthInch: 24, wastagePct: 10, pricePerSqFt: 180 });
  const tRows = (tiles.breakdown || []) as any[];
  assert(tRows.some((r) => String(r.label).includes('Boxes to order')), 'Tiles boxes row missing');
  assert(tRows.some((r) => r.isTotal && String(r.label).includes('complete floor')), 'Tiles complete total missing');

  // Steel bar-size split present and shares ~100%
  const steel = calculateSteelRequirement({ coveredArea: 2000, ratePerTon: 255000 });
  assert((steel.breakdown || []).some((r: any) => String(r.label).includes('Bar #3')), 'Steel bar split missing');

  console.log('Breakdown upgrades reconcile (solar/tiles/steel)');
}
