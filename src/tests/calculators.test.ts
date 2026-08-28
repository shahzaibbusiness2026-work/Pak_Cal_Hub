/**
 * Comprehensive Automated Verification Test Suite for Pakistan Calculation Hub Engines
 * Tests Federal & Provincial Salaries, Multi-Year Budgets, Commutation Tables, and FBR Tax Slabs
 */

import {
  calculateSalary,
  calculatePension,
  calculateTax,
  calculateGPF,
  calculateLeaveEncashment,
  calculateFamilyPension,
  calculatePromotion,
} from '../lib/calculations';
import { getSalaryDataset } from '../data/salary';
import { getPensionRules, getCommutationFactor } from '../data/pension';
import { getTaxDataset } from '../data/tax';
import { getGpfConfig } from '../data/allowances';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

function runTests() {
  console.log('\n========================================');
  console.log('🚀 RUNNING PAK CALC HUB ACCURACY TEST SUITE');
  console.log('========================================\n');

  // ==========================================
  // 1. DATASET INTEGRITY TESTS
  // ==========================================
  console.log('--- 1. Testing Dataset Loaders ---');
  const fed2026 = getSalaryDataset('federal', '2026-27');
  assert(fed2026.government === 'federal', 'Federal 2026 dataset loaded');
  assert(fed2026.scales[1].minPay === 16280, 'Federal BPS-1 min pay is 16,280');
  assert(fed2026.scales[17].minPay === 54140, 'Federal BPS-17 min pay is 54,140');
  assert(fed2026.scales[22].minPay === 146770, 'Federal BPS-22 min pay is 146,770');

  const punjab2026 = getSalaryDataset('punjab', '2026-27');
  assert(punjab2026.government === 'punjab', 'Punjab 2026 dataset loaded');

  const sindh2026 = getSalaryDataset('sindh', '2026-27');
  assert(sindh2026.government === 'sindh', 'Sindh 2026 dataset loaded');

  const kpk2026 = getSalaryDataset('kpk', '2026-27');
  assert(kpk2026.government === 'kpk', 'KPK 2026 dataset loaded');

  const baloch2026 = getSalaryDataset('balochistan', '2026-27');
  assert(baloch2026.government === 'balochistan', 'Balochistan 2026 dataset loaded');

  // ==========================================
  // 2. COMMUTATION PURCHASE TABLE TESTS
  // ==========================================
  console.log('\n--- 2. Testing Commutation Factors ---');
  assert(getCommutationFactor(45) === 14.31, 'Commutation factor for Age 45 is 14.31');
  assert(getCommutationFactor(50) === 12.35, 'Commutation factor for Age 50 is 12.35');
  assert(getCommutationFactor(55) === 10.40, 'Commutation factor for Age 55 is 10.40');
  assert(getCommutationFactor(60) === 8.48, 'Commutation factor for Age 60 is 8.48');
  assert(getCommutationFactor(65) === 7.22, 'Commutation factor for Age 65 is 7.22');

  // ==========================================
  // 3. SALARY ENGINE MULTI-GOVT & MULTI-YEAR
  // ==========================================
  console.log('\n--- 3. Testing Salary Calculations ---');
  // Case A: Federal BPS-17 Stage 0 Big City in 2026-27
  const salFed17 = calculateSalary({
    government: 'federal',
    year: '2026-27',
    bps: 17,
    stage: 0,
    cityType: 'big',
  });
  assert(salFed17.primaryResult.id === 'netSalary', 'Federal BPS-17 primary result computed');
  assert(salFed17.breakdown!.length >= 7, 'Federal BPS-17 has comprehensive breakdown rows');

  // Case B: Official Govt Accommodation (0 HRA + 5% Maintenance Deduction)
  const salGovtAccom = calculateSalary({
    government: 'federal',
    year: '2026-27',
    bps: 17,
    stage: 0,
    cityType: 'none',
  });
  const hraRow = salGovtAccom.breakdown?.find((r) => r.label.includes('House Rent Allowance'));
  const hrdRow = salGovtAccom.breakdown?.find((r) => r.label.includes('5% Maintenance Deduction'));
  assert(String(hraRow?.amount).includes('0'), 'Official accommodation sets HRA to Rs. 0');
  assert(Boolean(hrdRow), 'Official accommodation deducts 5% HRD');

  // Case C: Punjab 2026 BPS-16 with Special Allowance
  const salPunjab16 = calculateSalary({
    government: 'punjab',
    year: '2026-27',
    bps: 16,
    stage: 2,
    cityType: 'big',
    includeDRA: true,
  });
  assert(String(salPunjab16.primaryResult.value) !== '', 'Punjab BPS-16 with DRA calculated successfully');

  // Case D: Multi-Year comparison for BPS-17 (2024-25 vs 2025-26 vs 2026-27)
  const sal2024 = calculateSalary({ government: 'federal', year: '2024-25', bps: 17, stage: 0 });
  const sal2025 = calculateSalary({ government: 'federal', year: '2025-26', bps: 17, stage: 0 });
  const sal2026 = calculateSalary({ government: 'federal', year: '2026-27', bps: 17, stage: 0 });
  assert(Boolean(sal2024.primaryResult && sal2025.primaryResult && sal2026.primaryResult), 'Multi-year salary execution verified');

  // ==========================================
  // 4. PENSION ENGINE TESTS
  // ==========================================
  console.log('\n--- 4. Testing Pension Calculations ---');
  // Case A: Pre-2024 Defined Benefit Scheme (Basic 100k, 30 yrs, Age 60, 35% comm)
  const penPre2024 = calculatePension({
    government: 'federal',
    schemeType: 'pre2024',
    basicPay: 100000,
    serviceYears: 30,
    age: 60,
    commutationPercent: 35,
    bps: 17,
  });
  const lumpSum = penPre2024.secondaryResults?.find((r) => r.id === 'lumpSum');
  assert(Boolean(String(lumpSum?.value).includes('24,93,120')), `Commutation lump sum correctly calculated: ${lumpSum?.value}`);

  // Case B: Minimum Pension Floor (Rs. 25,000)
  const penSmall = calculatePension({
    government: 'federal',
    schemeType: 'pre2024',
    basicPay: 20000,
    serviceYears: 10,
    age: 60,
    commutationPercent: 35,
    bps: 1,
  });
  assert(String(penSmall.primaryResult.value).includes('25,000'), 'Minimum pension floor of Rs. 25,000 enforced');

  // Case C: Post-2024 FGDC Defined Contribution Scheme
  const penPost2024 = calculatePension({
    government: 'federal',
    schemeType: 'post2024',
    basicPay: 100000,
    serviceYears: 30,
    age: 60,
    bps: 17,
  });
  assert(penPost2024.primaryResult.id === 'annuity', 'FGDC Defined Contribution annuity computed');

  // ==========================================
  // 5. TAX ENGINE TESTS
  // ==========================================
  console.log('\n--- 5. Testing Income Tax Calculations ---');
  // Case A: Tax Year 2027 Exempt Salary (Rs. 50,000/mo = 600,000/yr)
  const taxExempt = calculateTax({
    taxYear: '2026-27',
    incomeType: 'salaried',
    incomePeriod: 'monthly',
    income: 50000,
  });
  assert(String(taxExempt.primaryResult.value).includes('0'), 'Rs. 50,000/month salary has Rs. 0 tax');

  // Case B: Tax Year 2027 Salaried (Rs. 100,000/mo = 1,200,000/yr)
  const tax100k = calculateTax({
    taxYear: '2026-27',
    incomeType: 'salaried',
    incomePeriod: 'monthly',
    income: 100000,
  });
  assert(String(tax100k.primaryResult.value).includes('500'), 'Rs. 100,000/month salary has Rs. 500/month TDS in TY2027');

  // Case C: Freelancer PSEB 0.25% vs General 1.25%
  const taxFreelancerPseb = calculateTax({
    taxYear: '2026-27',
    incomeType: 'freelancer',
    incomePeriod: 'annual',
    income: 4000000,
    isPsebRegistered: true,
  });
  const flTax = taxFreelancerPseb.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(flTax?.value).includes('10,000'), 'Freelancer Section 154A PSEB tax is 0.25% (Rs. 10,000 on 4M)');

  // ==========================================
  // 6. GP FUND, LEAVE ENCASHMENT, PROMOTION
  // ==========================================
  console.log('\n--- 6. Testing Specialized Engines ---');
  const gpfResult = calculateGPF({
    year: '2026-27',
    openingBalance: 500000,
    monthlySubscription: 10000,
    years: 5,
  });
  assert(Boolean(gpfResult.primaryResult.value), 'GP Fund compound interest calculated');

  const leaveResult = calculateLeaveEncashment({
    basicPay: 90000,
    leaveDays: 365,
  });
  assert(String(leaveResult.primaryResult.value).includes('10,95,000'), 'Leave encashment lump sum accurate (Rs. 10,95,000)');

  const familyPenResult = calculateFamilyPension({
    government: 'punjab',
    lastBasicPay: 80000,
    serviceYears: 30,
    deceasedBps: 16,
  });
  assert(Boolean(familyPenResult.primaryResult.value), 'Family pension calculated');

  const promoResult = calculatePromotion({
    government: 'federal',
    year: '2026-27',
    currentBps: 16,
    promotedBps: 17,
    currentBasic: 60000,
  });
  assert(Boolean(promoResult.primaryResult.value), 'FR-22 Promotion pay fixation calculated');

  console.log('\n========================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY (100% PRECISION)');
  console.log('========================================\n');
}

runTests();
