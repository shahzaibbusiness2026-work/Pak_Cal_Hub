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
