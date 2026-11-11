import assert from 'node:assert/strict';
import { calculateSalary } from '../lib/calculations/salaryEngine';
import { calculatePension } from '../lib/calculators/salary';
import { calculateFamilyPension } from '../lib/calculators/specialized-engines';
import { calculatePromotion } from '../lib/calculations/promotionEngine';
import { ALL_CALCULATORS } from '../lib/data/categories';

const row = (result: ReturnType<typeof calculateSalary>, label: string) => result.breakdown?.find((r) => r.label.includes(label));
const number = (value: unknown) => Number(String(value).replace(/^Rs\.\s*/, '').replace(/[^\d.-]/g, ''));

// Independently worked salary: gross 112,500; annual taxable 1,350,000;
// tax (6,000 + 11% x 150,000) / 12 = 1,875; other deductions 5,000.
const salary = calculateSalary({ government: 'federal', year: '2026-27', bps: 17, customBasic: 100000, customHra: 3000, customMedical: 2000, includeAdhoc: false, customDeductions: 5000 });
assert.equal(number(salary.primaryResult.value), 105625);
assert.equal(number(row(salary, 'salary income tax')?.amount), 1875);
assert(!row(salary, 'GP Fund Subscription'), 'replaced deductions must not also appear as charges');
assert.equal(number(row(salary, 'Medical Allowance')?.amount), 2000);
assert.equal(number(calculateSalary({ customBasic: 100000, customIncomeTax: 0, customDeductions: 0, includeAdhoc: false }).secondaryResults?.find((r) => r.id === 'totalDeductions')?.value), 0);

const federal = { government: 'federal', year: '2026-27', bps: 17, stage: 3 } as const;
const defaults = calculateSalary(federal);
assert(!row(defaults, 'Disparity Reduction'), 'DRA must not be awarded just because the BPS is in scope');
assert.equal(number(row(defaults, 'Medical Allowance')?.amount), 1847, 'medical reference is frozen, not 15% of running pay');
assert.equal(calculateSalary({ ...federal, includeDRA: true }).primaryResult.id, 'invalid');
const dra = calculateSalary({ ...federal, includeDRA: true, draBase2022: 40000 });
assert.equal(number(row(dra, 'Disparity Reduction Allowance 2026')?.amount), 6000);
const sanctioned = calculateSalary({ ...federal, includeDRA: true, customDra: 12000, frozenAra2023: 20000, frozenAra2024: 15000 });
assert.equal(number(row(sanctioned, 'Sanctioned total DRA')?.amount), 12000);
assert.equal(number(row(sanctioned, 'Allowance 2023 (frozen)')?.amount), 20000);
assert.equal(number(row(sanctioned, 'Allowance 2024 (frozen)')?.amount), 15000);
assert.equal(number(row(calculateSalary({ ...federal, cityType: 'none', customHra: 5000 }), 'House Rent Allowance')?.amount), 0);

// Verify the public form wrapper forwards the average, increment and sanctioned additions.
const pensionInputs = { government: 'federal', hireScheme: 'pre-2024', lastBasicPay: 100000, avgLast24MoPay: 80000, notionalIncrement: 2000, retirementYear: 2026, retirementMonth: 11, serviceYears: 30, ageAtRetirement: 60, commutationPercent: 35, sanctionedMedical: 1000, sanctionedIncreases: 5000, apply2026Increase: true, baselinePension: 60000 };
const pension = calculatePension(pensionInputs);
assert.equal(number(pension.primaryResult.value), 47510); // 82,000 x 70% x 65% + 1,000 + 5,000 + 4,200
assert.equal(number(pension.breakdown?.[0].amount), 82000);
assert.equal(calculatePension({ ...pensionInputs, avgLast24MoPay: 0 }).primaryResult.id, 'invalid');
assert.equal(calculatePension({ ...pensionInputs, baselinePension: 0 }).primaryResult.id, 'invalid');
assert.equal(calculatePension({ ...pensionInputs, government: 'punjab', hireScheme: 'post-2024' }).primaryResult.id, 'invalid');

const family = calculateFamilyPension({ jurisdiction: 'federal', pensionBasis: 'retired', pensionDrawn: 80000, sanctionedMedical: 2000 });
assert.equal(number(family.primaryResult.value), 62000);
assert(!String(family.primaryResult.subtext).includes('Lifetime'));
assert.equal(calculateFamilyPension({ pensionBasis: 'retired', pensionDrawn: 0 }).primaryResult.id, 'invalid');
assert.equal(calculatePromotion({ currentBps: 16, promotedBps: 16 }).primaryResult.id, 'invalid');
assert.equal(calculatePromotion({ currentBps: 16, promotedBps: 17, currentBasic: 999999 }).primaryResult.id, 'invalid');
assert.equal(number(calculatePromotion({ currentBps: 16, promotedBps: 17, currentBasic: 51530 }).primaryResult.value), 58250, 'a benchmark equal to the promoted minimum still requires the next higher stage');

const pensionTool = ALL_CALCULATORS.find((tool) => tool.id === 'pension-calculator')!;
assert(pensionTool.inputs.some((field) => field.id === 'avgLast24MoPay'));
console.log('PASS: Government payroll tax, frozen allowances, conditional DRA, pension form wiring, sanctioned additions, family pension basis and promotion boundaries. Provincial rule completeness is not certified.');
