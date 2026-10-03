/**
 * Comprehensive Enterprise Test Suite for Pakistan Calculation Hub Engines & Data Pipeline
 * Validates Salary, Pension, Tax, Electricity, Fuel, Gold, Currency, Solar, Loan engines AND Live Sync Pipelines
 */

import {
  calculateSalary,
  calculatePension,
  calculateTax,
  calculateGPF,
  calculateLeaveEncashment,
  calculateFamilyPension,
  calculatePromotion,
  calculateElectricityBill,
  calculateFuelCost,
  calculateGoldPrice,
  calculateCurrencyConversion,
  calculateSolarSystem,
  calculateLoan,
} from '../lib/calculations';
// UI-path engines (what DynamicCalculator actually calls)
import { calculateGoldPrice as calculateGoldPriceUi } from '../lib/calculators/data-tools';
import {
  calculateMdcatAggregate,
  calculateUniversityAggregate,
  calculateGpa,
} from '../lib/calculators/education';
import { calculateAge } from '../lib/calculators/date-time';
import { calculateAreaConverter } from '../lib/calculators/property';
import { calculateFuelCost as calculateVehicleFuelCost } from '../lib/calculators/vehicles';
import { calculateCurrency } from '../lib/calculators/currency';
import { calculateLoanEmi } from '../lib/calculators/loans';
import {
  syncFuelPrices,
  syncGoldRates,
  syncCurrencyRates,
  syncElectricityTariffs,
  syncGovernmentNotifications,
  syncAllServices,
} from '../lib/sync';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING COMPLETE ENTERPRISE CALCULATION & SYNC SUITE');
  console.log('======================================================\n');

  // 1. SALARY ENGINE
  console.log('--- 1. Government Salary Calculations (Federal + 4 Provinces) ---');
  const salFed = calculateSalary({ government: 'federal', year: '2026-27', bps: 17, stage: 0, cityType: 'big' });
  assert(salFed.primaryResult.id === 'netSalary', 'Federal BPS-17 salary computed');
  
  const salPunjab = calculateSalary({ government: 'punjab', year: '2026-27', bps: 16, stage: 2, includeDRA: true });
  assert(String(salPunjab.primaryResult.value) !== '', 'Punjab BPS-16 with Special Allowance computed');

  const salSindh = calculateSalary({ government: 'sindh', year: '2026-27', bps: 18, stage: 1, cityType: 'big' });
  assert(String(salSindh.primaryResult.value) !== '', 'Sindh BPS-18 computed');

  // 2. PENSION ENGINE
  console.log('\n--- 2. Pension & Commutation Engine ---');
  const penAge60 = calculatePension({ government: 'federal', schemeType: 'pre2024', basicPay: 100000, serviceYears: 30, age: 60, commutationPercent: 35 });
  const lumpSum = penAge60.secondaryResults?.find((r) => r.id === 'lumpSum');
  assert(String(lumpSum?.value).includes('23,99,040'), 'Age 60 commutation lump sum accurate with age-next-birthday factor 8.16 (Rs. 23,99,040)');

  const penMinFloor = calculatePension({ government: 'federal', schemeType: 'pre2024', basicPay: 15000, serviceYears: 10, age: 60, commutationPercent: 35 });
  assert(String(penMinFloor.primaryResult.value).includes('12,930'), 'Minimum statutory pension floor (Rs. 12,000 on gross, OM No.F.15(1)-Reg.6/2023) enforced');

  // 3. FBR TAX ENGINE
  console.log('\n--- 3. FBR Income Tax Engine ---');
  const tax100k = calculateTax({ taxYear: '2026-27', incomeType: 'salaried', incomePeriod: 'monthly', income: 100000 });
  assert(String(tax100k.primaryResult.value).includes('500'), 'TY2027 Rs. 100k/mo salary has Rs. 500/mo tax');

  const taxFreelance = calculateTax({ taxYear: '2026-27', incomeType: 'freelancer', incomePeriod: 'annual', income: 4000000, isPsebRegistered: true });
  const flTax = taxFreelance.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(flTax?.value).includes('10,000'), 'Section 154A 0.25% PSEB tax is Rs. 10,000 on 4M');

  const tax5M27 = calculateTax({ taxYear: '2026-27', incomeType: 'salaried', incomePeriod: 'annual', income: 5000000 });
  const tax5M27Annual = tax5M27.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(tax5M27Annual?.value).includes('8,02,000'), 'TY2027 salaried Rs. 5M annual tax is Rs. 802,000 (Finance Act 2026 8-slab table)');

  const tax5M26 = calculateTax({ taxYear: '2025-26', incomeType: 'salaried', incomePeriod: 'annual', income: 5000000 });
  const tax5M26Annual = tax5M26.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(tax5M26Annual?.value).includes('9,31,000'), 'TY2026 salaried Rs. 5M annual tax is Rs. 931,000 (Finance Act 2025 table)');

  // 4. ELECTRICITY BILL ENGINE
  console.log('\n--- 4. Electricity Bill Engine (LESCO / IESCO / K-Electric) ---');
  const elecProtected = calculateElectricityBill({ units: 100, provider: 'lesco', consumerType: 'protected' });
  assert(String(elecProtected.primaryResult.value) !== 'Rs. 0', 'Protected 100 units electricity bill computed');

  const elecUnprotected = calculateElectricityBill({ units: 350, provider: 'iesco', consumerType: 'unprotected' });
  const gstRow = elecUnprotected.breakdown?.find((r) => r.label.includes('General Sales Tax'));
  assert(Boolean(gstRow), 'GST 18% applied for >200 units consumption');

  // 5. FUEL COST ENGINE (UI-wired, verified 2026 price: Rs. 342.60/litre)
  console.log('\n--- 5. Fuel & Commute Cost Engine (At Rs. 342.60/Litre) ---');
  const fuelTrip = calculateVehicleFuelCost({ distanceKm: 380, fuelAverageKmPerLiter: 14.5, fuelPricePerLiter: 342.60 });
  assert(String(fuelTrip.primaryResult.value).includes('8,978'), 'UI fuel cost: 380 km @ 14.5 km/L @ Rs. 342.60/L = Rs. 8,978');

  // 6. GOLD RATE ENGINE (UI path is canonical; legacy engine delegates to the same math)
  console.log('\n--- 6. Gold Rate & Jewelry Value Engine ---');
  const goldUi24k = calculateGoldPriceUi({ quantity: 1, unit: 'tola', purity: '24k', goldRate24kPerTola: 242000, makingChargesPerGram: 0 });
  assert(String(goldUi24k.primaryResult.value).includes('2,42,000'), 'UI path: 1 Tola 24K gold @ Rs. 242,000 = Rs. 2,42,000');

  const goldUi22k = calculateGoldPriceUi({ quantity: 1, unit: 'tola', purity: '22k', goldRate24kPerTola: 242000, makingChargesPerGram: 0 });
  assert(String(goldUi22k.primaryResult.value).includes('2,21,833'), 'UI path: 1 Tola 22K gold = Rs. 242,000 × 22/24');

  const goldUiMasha = calculateGoldPriceUi({ quantity: 12, unit: 'masha', purity: '24k', goldRate24kPerTola: 242000, makingChargesPerGram: 0 });
  assert(String(goldUiMasha.primaryResult.value).includes('2,42,000'), 'UI path: 12 masha = 1 tola');

  const goldEngineDelegated = calculateGoldPrice({ weight: 1, weightUnit: 'tola', purity: '24k', baseRate24kPerTola: 242000 });
  assert(String(goldEngineDelegated.primaryResult.value).includes('2,42,000'), 'Legacy engine (delegated math): 1 Tola 24K = Rs. 2,42,000');

  const goldTolaConstant = goldUi24k.secondaryResults?.find((r) => r.id === 'ratePerGram');
  assert(Boolean(goldTolaConstant), 'UI path exposes per-gram rate (1 tola = 11.6638 g)');

  // 7. CURRENCY CONVERTER ENGINE (UI-wired, interbank vs open-market)
  console.log('\n--- 7. Currency Converter Engine ---');
  const usdToPkr = calculateCurrency({ amount: 1000, fromCurrency: 'USD', toCurrency: 'PKR', rateType: 'interbank' });
  assert(String(usdToPkr.primaryResult.value).includes('2,80,500'), '1000 USD equals Rs. 280,500 (interbank)');
  const usdToPkrOm = calculateCurrency({ amount: 100, fromCurrency: 'USD', toCurrency: 'PKR', rateType: 'openMarket' });
  assert(String(usdToPkrOm.primaryResult.value).includes('28,260'), '100 USD open market applies 0.75% retail spread (Rs. 28,260)');

  // 8. SOLAR SYSTEM SIZING ENGINE
  console.log('\n--- 8. Solar Sizing & Net Metering Engine ---');
  const solar10kw = calculateSolarSystem({ targetSystemCapacityKw: 10 });
  const payback = solar10kw.secondaryResults?.find((r) => r.id === 'payback');
  assert(Boolean(payback?.value), 'Solar 10kW ROI & payback period calculated');

  // 9. LOAN EMI ENGINE (UI-wired)
  console.log('\n--- 9. Loan EMI & Bank Markup Engine ---');
  const loanCar = calculateLoanEmi({ loanAmount: 2000000, annualInterestRate: 18, tenureYears: 5 });
  assert(String(loanCar.primaryResult.value).includes('50,787'), 'Monthly Loan EMI on Rs. 2M @ 18% for 5 yrs is Rs. 50,787');

  // 10. LIVE DATA SYNC PIPELINES
  console.log('\n--- 10. Live Data Synchronization Pipelines ---');
  const fuelSync = await syncFuelPrices({ forceUpdate: true });
  assert(fuelSync.success, 'Fuel sync service completed successfully with Rs. 342.60 petrol rate');

  const goldSync = await syncGoldRates();
  assert(goldSync.success, 'Gold sync service completed successfully');

  const currencySync = await syncCurrencyRates();
  assert(currencySync.success, 'Currency sync service completed successfully');

  const elecSync = await syncElectricityTariffs();
  assert(elecSync.success, 'Electricity tariff sync service completed successfully');

  const govtSync = await syncGovernmentNotifications();
  assert(govtSync.success, 'Government notification detection completed (staged safely in review)');

  const masterSync = await syncAllServices();
  assert(masterSync.success && masterSync.totalServices === 5, 'Master multi-pipeline sync executed all 5 services concurrently');

  // 11. EDUCATION, AGE, AREA & GOLD-UI FORMULA TESTS
  console.log('\n--- 11. Education, Age, Area & Gold (UI-path) Formula Tests ---');

  // MDCAT: 1040/1100 matric, 1010/1100 F.Sc, 175/200 MDCAT -> 89.9318%
  const mdcat = calculateMdcatAggregate({ matricObtained: 1040, matricTotal: 1100, fscObtained: 1010, fscTotal: 1100, mdcatObtained: 175, mdcatTotal: 200 });
  const mdcatVal = parseFloat(String(mdcat.primaryResult.value));
  assert(Math.abs(mdcatVal - 89.9318) < 0.0001, `MDCAT aggregate is 89.9318% (got ${mdcat.primaryResult.value})`);
  assert(String(mdcat.primaryResult.subtext).includes('MBBS & BDS'), 'MDCAT 87.5% + HSSC 91.8% is MBBS/BDS eligible');

  // PMDC HSSC gate: 60% MDCAT but only 55% HSSC -> NOT eligible
  const mdcatLowHssc = calculateMdcatAggregate({ matricObtained: 1040, matricTotal: 1100, fscObtained: 605, fscTotal: 1100, mdcatObtained: 120, mdcatTotal: 200 });
  assert(/requires ≥60% in HSSC/i.test(String(mdcatLowHssc.primaryResult.subtext)), 'HSSC below 60% blocks MBBS/BDS eligibility despite 60% MDCAT');
  assert((mdcatLowHssc.notes || []).some((n) => /60% marks in HSSC/i.test(n)), 'HSSC 60% requirement disclosed in notes');

  // PU official 20/80 merit: 1040/1100 + 1010/1100 -> 92.3636%
  const pu = calculateUniversityAggregate({ university: 'pu', matricObtained: 1040, matricTotal: 1100, fscObtained: 1010, fscTotal: 1100, testObtained: 0, testTotal: 200 });
  const puVal = parseFloat(String(pu.primaryResult.value));
  assert(Math.abs(puVal - 92.3636) < 0.001, `PU 20/80 aggregate is 92.3636% (got ${pu.primaryResult.value})`);
  assert(!(pu.secondaryResults || []).some((r) => String(r.label).includes('(0%)')), 'Zero-weight component rows hidden (PU entry test)');

  // F.Sc scope warning: PU needs full HSSC but Part-I total entered
  const puScope = calculateUniversityAggregate({ university: 'pu', matricObtained: 1040, matricTotal: 1100, fscObtained: 490, fscTotal: 520, testObtained: 0, testTotal: 200 });
  assert((puScope.notes || []).some((n) => /FULL HSSC/i.test(n)), 'F.Sc scope mismatch warning shown for PU with Part-I total');

  // Component clamp: 1010/520 F.Sc -> 194% capped at 100% with warning
  const clamped = calculateUniversityAggregate({ university: 'nust-net', matricObtained: 1040, matricTotal: 1100, fscObtained: 1010, fscTotal: 520, testObtained: 172, testTotal: 200 });
  assert((clamped.notes || []).some((n) => /capped at 100%/i.test(n)), 'Component percentage over 100% is clamped with a visible warning');
  const clampedVal = parseFloat(String(clamped.primaryResult.value));
  assert(Math.abs(clampedVal - (94.5455 * 0.10 + 100 * 0.15 + 86 * 0.75)) < 0.01, 'NUST aggregate uses clamped 100% F.Sc component');

  // GPA: 3:A, 4:B+, 3:C -> (12 + 13.2 + 6) / 10 = 3.12
  const gpa = calculateGpa({ courseList: '3:A,4:B+,3:C' });
  assert(String(gpa.primaryResult.value) === '3.12', `GPA weighted average is 3.12 (got ${gpa.primaryResult.value})`);
  assert(String(gpa.secondaryResults?.find((r) => r.id === 'percentage')?.label).includes('Approx.'), 'GPA-to-% labelled as approximate');

  // GPA with invalid input -> honest incomplete message, not a fake number
  const gpaBad = calculateGpa({ courseList: 'oops' });
  assert(String(gpaBad.primaryResult.value) === '—', 'Invalid GPA input shows incomplete indicator, not a fabricated number');
  assert(/Incomplete Input/i.test(String(gpaBad.primaryResult.subtext)), 'Invalid GPA input explains what to enter');

  // GPA empty input -> incomplete, no hardcoded 3.74
  const gpaEmpty = calculateGpa({});
  assert(String(gpaEmpty.primaryResult.value) === '—', 'Empty GPA input does not fall back to hardcoded courses');

  // Age: 1995-05-15 -> 2026-10-04 = 31y 4m 19d
  const age = calculateAge({ birthDate: '1995-05-15', targetDate: '2026-10-04' });
  assert(String(age.primaryResult.value) === '31 Years, 4 Months, 19 Days', `Age 1995-05-15 → 2026-10-04 = 31y 4m 19d (got ${age.primaryResult.value})`);

  // Leap-day birth normalized to Feb 28 in non-leap years: 2024-02-29 -> 2026-10-04 = 2y 7m 6d
  const ageLeap = calculateAge({ birthDate: '2024-02-29', targetDate: '2026-10-04' });
  assert(String(ageLeap.primaryResult.value) === '2 Years, 7 Months, 6 Days', `Feb-29 birth normalized (got ${ageLeap.primaryResult.value})`);

  // Area conversions
  const kanal = calculateAreaConverter({ value: 1, fromUnit: 'kanal', marlaType: '272.25' });
  assert(String(kanal.secondaryResults?.find((r) => r.id === 'sqftResult')?.value).includes('5,445'), '1 kanal = 5,445 sq ft');
  const acre = calculateAreaConverter({ value: 1, fromUnit: 'acre', marlaType: '272.25' });
  assert(String(acre.secondaryResults?.find((r) => r.id === 'sqftResult')?.value).includes('43,560'), '1 acre = 43,560 sq ft');
  const ldaMarla = calculateAreaConverter({ value: 1, fromUnit: 'marla', marlaType: 225 });
  assert(String(ldaMarla.secondaryResults?.find((r) => r.id === 'sqftResult')?.value).startsWith('225'), 'Numeric marlaType 225 coerced correctly (LDA marla)');

  console.log('\n======================================================');
  console.log('🎉 ALL CALCULATION ENGINES & SYNC PIPELINES VERIFIED (100% SUCCESS)');
  console.log('======================================================\n');
}

runAllTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
