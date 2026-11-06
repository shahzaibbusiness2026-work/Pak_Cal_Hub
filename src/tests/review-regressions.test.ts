import assert from 'node:assert/strict';
import { ALL_CALCULATORS } from '../lib/data/categories';
import { calculateLoanEmi } from '../lib/calculators/loans';
import { calculateLoan } from '../lib/calculations/loanEngine';
import { calculateFreelancerTax } from '../lib/calculators/tax';
import { calculateMdcatAggregate, calculateUniversityAggregate } from '../lib/calculators/education';
import { calculateAge } from '../lib/calculators/date-time';
import { calculateElectricityBill } from '../lib/calculators/electricity';
import { calculateCurrency } from '../lib/calculators/currency';
import { calculateSalary } from '../lib/calculations/salaryEngine';
import { getCommutationFactor } from '../data/pension';
import { fetchLiveFuel } from '../lib/sync/live/fuelLive';

const defaults = (tool: typeof ALL_CALCULATORS[number]) => Object.fromEntries(tool.inputs.map((field) => [field.id, field.defaultValue]));
function finiteTree(value: unknown, context: string): void {
  if (typeof value === 'number') assert(Number.isFinite(value), `${context}: finite number required`);
  if (typeof value === 'string') assert(!/NaN|Infinity/.test(value), `${context}: invalid rendered number`);
  if (value && typeof value === 'object') for (const child of Object.values(value)) finiteTree(child, context);
}
const secondary = (result: ReturnType<typeof calculateLoanEmi>, id: string) => result.secondaryResults?.find((item) => item.id === id)?.value;
let scenarios = 0;
for (const tool of ALL_CALCULATORS) {
  const inputs = defaults(tool);
  const result = tool.calculate(inputs);
  assert(result.primaryResult && result.primaryResult.id !== 'invalid', `${tool.id}: defaults must calculate`);
  finiteTree(result, tool.id);
  scenarios++;
  for (const field of tool.inputs) {
    const values = field.options?.map((option) => option.value) ??
      (field.type === 'toggle' ? [true, false] : ['number', 'currency'].includes(field.type) ? [field.min ?? 0, ...(field.max === undefined ? [] : [field.max])] : []);
    for (const value of values) {
      finiteTree(tool.calculate({ ...inputs, [field.id]: value }), `${tool.id}/${field.id}=${value}`);
      scenarios++;
    }
    if (['number', 'currency'].includes(field.type)) {
      for (const value of [Infinity, NaN, '', -1e10]) {
        assert.equal(tool.calculate({ ...inputs, [field.id]: value }).primaryResult.id, 'invalid', `${tool.id}/${field.id}: rejects invalid inputs`);
        scenarios++;
      }
    }
  }
}

for (const government of ['federal', 'punjab', 'sindh', 'kpk', 'balochistan'] as const) {
  for (const year of ['2024-25', '2025-26', '2026-27'] as const) {
    for (let bps = 1; bps <= 22; bps++) finiteTree(calculateSalary({ government, year, bps, stage: 30 }), `${government}/${year}/${bps}`);
  }
}
assert.equal(calculateFreelancerTax({ annualIncome: 0 }).secondaryResults?.find((item) => item.id === 'annualTax')?.value, 'Rs. 0');
assert.equal(secondary(calculateMdcatAggregate({ mdcatObtained: 0, mdcatTotal: 180 }), 'testPct'), '0.0%');
assert.equal(calculateUniversityAggregate({ university: 'uet-ecat', matricObtained: 0, matricTotal: 1100, fscObtained: 1100, fscTotal: 1100, testObtained: 0, testTotal: 400 }).primaryResult.value, '67.0000%');
assert.equal(calculateAge({ birthDate: '2025-01-31', targetDate: '2025-03-01' }).primaryResult.value, '0 Years, 1 Months, 1 Days');
assert.equal(calculateAge({ birthDate: '2000-02-29', targetDate: '2025-02-28' }).primaryResult.value, '25 Years, 0 Months, 0 Days');
assert.equal(calculateAge({ birthDate: '2026-01-01', targetDate: '2025-01-01' }).primaryResult.id, 'invalid');
assert.equal(getCommutationFactor(60), 12.3719);
assert.equal(getCommutationFactor(61), 11.8632);
const loan = calculateLoanEmi({ loanAmount: 180000, annualInterestRate: 0, tenureYears: 1.5 });
assert.equal(loan.primaryResult.value, 'Rs. 10,000');
assert.equal(loan.amortizationSchedule?.length, 2);
assert.equal(loan.amortizationSchedule?.[1].payment, 60000);
assert.equal(loan.amortizationSchedule?.[1].balance, 0);
assert.equal(calculateLoan({ loanAmount: 120000, interestRatePercent: 0, tenureMonths: 12 }).primaryResult.value, 'Rs. 10,000');
const life = calculateElectricityBill({ units: 100, consumerType: 'lifeline', includeTaxes: false, meterRent: 0 });
assert.equal(secondary(life, 'energyCharges'), 'Rs. 774');
assert.equal(life.primaryResult.value, 'Rs. 774');
const unprotected = calculateElectricityBill({ units: 150, consumerType: 'unprotected', includeTaxes: false, meterRent: 0 });
assert.equal(secondary(unprotected, 'energyCharges'), 'Rs. 4,337');
const withoutFpa = calculateElectricityBill({ units: 300, fpaRate: 0 });
const credit = calculateElectricityBill({ units: 300, fpaRate: -1 });
assert.notEqual(credit.primaryResult.value, withoutFpa.primaryResult.value);
assert.equal(calculateCurrency({ amount: 10, fromCurrency: 'USD', toCurrency: 'AED', customRate: 3.67 }).primaryResult.value, 'AED 36.70');
assert.equal(calculateCurrency({ amount: 10, rateType: 'openMarket' }).primaryResult.value, calculateCurrency({ amount: 10, rateType: 'interbank' }).primaryResult.value);
async function checkFuelClock() {
const datedFuel = await fetchLiveFuel(async () => ({ prices: [{ slug: 'petrol', price_pkr: 362, effective_date: '2026-11-05' }, { slug: 'diesel', price_pkr: 387.81, effective_date: '2026-11-05' }] }), new Date('2026-11-06T00:00:00Z'));
assert.equal(datedFuel.petrol, 362);
}
checkFuelClock().catch((error) => { console.error(error); process.exitCode = 1; });
console.log(`PASS: ${ALL_CALCULATORS.length} registered calculators, ${scenarios} form scenarios, 330 salary combinations, and numeric/date/rate regressions.`);
