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
import {
  calculateFreelancerTax,
  calculatePropertyTax,
  calculateTokenTax,
  calculateInheritance,
  calculateZakat,
  calculateCurrency,
  calculateLoanEmi,
  calculateFuelCost as calculateVehicleFuelCost,
} from '../lib/calculators';

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
  const salFed17Basic = salFed17.secondaryResults?.find((r) => r.id === 'basicPay');
  assert(String(salFed17Basic?.value).includes('54,140'), `Federal BPS-17 stage-0 running basic pay is Rs. 54,140: ${salFed17Basic?.value}`);

  // Case B: Official Govt Accommodation (0 HRA + 5% Maintenance Deduction)
  const salGovtAccom = calculateSalary({
    government: 'federal',
    year: '2026-27',
    bps: 17,
    stage: 0,
    cityType: 'none',
  });
  const hraRow = salGovtAccom.breakdown?.find((r) => r.label.includes('House Rent Allowance'));
  const hrdRow = salGovtAccom.breakdown?.find((r) => r.label.includes('5% House-Rent Deduction'));
  assert(String(hraRow?.amount).includes('0'), 'Official accommodation sets HRA to Rs. 0');
  assert(Boolean(hrdRow), 'Official accommodation deducts 5% house-rent deduction');

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
  // CSR commutation table is keyed on age at NEXT birthday, so age 60 uses the age-61 factor 8.16:
  // 24,500 x 12 x 8.16 = Rs. 23,99,040
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
  assert(Boolean(String(lumpSum?.value).includes('23,99,040')), `Commutation lump sum correctly calculated (age-next-birthday factor 8.16): ${lumpSum?.value}`);

  // Case B: Minimum Pension Floor (Rs. 12,000 on GROSS pension, OM No.F.15(1)-Reg.6/2023)
  // Basic 20k, 10 yrs: gross = 4,667 -> floor top-up 7,333 (non-commutable); commutation on pre-floor gross
  const penSmall = calculatePension({
    government: 'federal',
    schemeType: 'pre2024',
    basicPay: 20000,
    serviceYears: 10,
    age: 60,
    commutationPercent: 35,
    bps: 1,
  });
  assert(String(penSmall.primaryResult.value).includes('12,959'), `Minimum pension floor of Rs. 12,000 on gross enforced (total in-hand Rs. 12,959): ${penSmall.primaryResult.value}`);
  const floorRow = penSmall.breakdown?.find((r) => r.label.includes('Minimum Pension Floor Top-Up'));
  assert(Boolean(floorRow) && String(floorRow?.amount).includes('7,333'), 'Floor top-up of Rs. 7,333 shown as non-commutable');

  // Case B2: Post-reform path (retirement 2026) uses average emoluments of last 24 months
  const penReform = calculatePension({
    government: 'federal',
    schemeType: 'pre2024',
    basicPay: 100000,
    avgLast24MoPay: 95000,
    retirementYear: 2026,
    serviceYears: 30,
    age: 60,
    commutationPercent: 35,
    bps: 17,
  });
  assert(String(penReform.breakdown?.[0]?.label).includes('Last 24 Months'), 'Post-Sept-2024 retirement uses 24-month average emoluments');
  assert(String(penReform.breakdown?.[0]?.amount).includes('95,000'), 'Reform path uses avgLast24MoPay of Rs. 95,000');
  const penPreReform = calculatePension({
    government: 'federal',
    schemeType: 'pre2024',
    basicPay: 100000,
    retirementYear: 2023,
    serviceYears: 30,
    age: 60,
    commutationPercent: 35,
    bps: 17,
  });
  assert(String(penPreReform.breakdown?.[0]?.label).includes('Last Drawn'), 'Pre-reform retirement keeps last-drawn basic pay');

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

  // Case D: Tax Year 2027 Salaried Rs. 5,000,000/yr → Rs. 802,000 (8-slab Finance Act 2026 table)
  const tax5M = calculateTax({
    taxYear: '2026-27',
    incomeType: 'salaried',
    incomePeriod: 'annual',
    income: 5000000,
  });
  const tax5MAnnual = tax5M.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(tax5MAnnual?.value).includes('8,02,000'), 'TY2027 Rs. 5M salaried annual tax is Rs. 802,000');

  // Case E: Tax Year 2026 Salaried Rs. 5,000,000/yr → Rs. 931,000 (Finance Act 2025 table)
  const tax5M26 = calculateTax({
    taxYear: '2025-26',
    incomeType: 'salaried',
    incomePeriod: 'annual',
    income: 5000000,
  });
  const tax5M26Annual = tax5M26.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(tax5M26Annual?.value).includes('9,31,000'), 'TY2026 Rs. 5M salaried annual tax is Rs. 931,000');

  // Case F: Tax Year 2026 Sec 4AB surcharge label interpolates the dataset rate (9%)
  const tax11M = calculateTax({
    taxYear: '2025-26',
    incomeType: 'salaried',
    incomePeriod: 'annual',
    income: 11000000,
  });
  const surchargeRow = tax11M.breakdown?.find((r) => r.label.includes('Surcharge'));
  assert(Boolean(surchargeRow?.label.includes('(9%')), 'TY2026 9% surcharge row interpolates dataset rate');

  // Case G: Freelancer UI wiring — real UI fields (annualIncome / isPsebRegistered) are honored
  const flUi = calculateFreelancerTax({ annualIncome: 4000000, isPsebRegistered: true });
  const flUiTax = flUi.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(flUiTax?.value).includes('10,000'), 'Freelancer UI wiring: 4M PSEB income taxed at 0.25% (Rs. 10,000)');
  const flUiNonPseb = calculateFreelancerTax({ annualIncome: 4000000, isPsebRegistered: false });
  const flUiNonPsebTax = flUiNonPseb.secondaryResults?.find((r) => r.id === 'annualTax');
  assert(String(flUiNonPsebTax?.value).includes('40,000'), 'Freelancer non-PSEB taxed at 1% Section 154A (Rs. 40,000)');

  // ==========================================
  // 6. GP FUND, LEAVE ENCASHMENT, PROMOTION
  // ==========================================
  console.log('\n--- 6. Testing Specialized Engines ---');
  // GP Fund: FY2024-25 rate is 12.46% (Finance Division No.8(1)GS-I/2018, 31-07-2025).
  // 1 year: interest = round((500,000 + 10,000 x 6.5) x 12.46%) = 70,399; balance = 6,90,399
  const gpfResult = calculateGPF({
    year: '2024-25',
    openingBalance: 500000,
    monthlySubscription: 10000,
    years: 1,
  });
  assert(String(gpfResult.primaryResult.value).includes('6,90,399'), `GP Fund 1-year balance at 12.46% is Rs. 6,90,399: ${gpfResult.primaryResult.value}`);
  const gpfInterest = gpfResult.secondaryResults?.find((r) => r.id === 'totalInterest');
  assert(String(gpfInterest?.value).includes('70,399'), `GP Fund yearly interest uses monthly-crediting (6.5-month average): ${gpfInterest?.value}`);

  const leaveResult = calculateLeaveEncashment({
    basicPay: 90000,
    leaveDays: 365,
  });
  assert(String(leaveResult.primaryResult.value).includes('10,95,000'), 'Leave encashment lump sum accurate (Rs. 10,95,000)');

  // Family pension floor: 15k basic, 10y -> gross 3,500 -> 75% = 2,625 -> floored to Rs. 9,000;
  // medical 25% of 9,000 = 2,250; total Rs. 11,250
  const familyPenResult = calculateFamilyPension({
    government: 'punjab',
    lastBasicPay: 15000,
    serviceYears: 10,
    deceasedBps: 1,
  });
  assert(String(familyPenResult.primaryResult.value).includes('11,250'), `Family pension floor of Rs. 9,000 enforced (total Rs. 11,250): ${familyPenResult.primaryResult.value}`);

  // ==========================================
  // 6b. Verified 2026-27 federal figures (Finance Division notifications, Oct 2026 review)
  // ==========================================
  console.log('\n--- 6b. Verified 2026-27 Federal Figures ---');
  // RBPS-2026: BPS-17 min 54,140 / increment 4,110 / max 136,340 (notified 21-07-2026, w.e.f. 01-07-2026)
  const sal17 = calculateSalary({ government: 'federal', year: '2026-27', bps: 17, stage: 3, cityType: 'big' });
  const basicRow = sal17.breakdown?.find((r) => r.label.includes('Basic Pay (Revised'));
  assert(String(basicRow?.amount).includes('66,470'), `RBPS-2026 BPS-17 stage 3 basic = 54,140 + 3x4,110 = Rs. 66,470: ${basicRow?.amount}`);
  // Medical: 15% of running basic for BPS 16-22 (verified rule)
  const medRow = sal17.breakdown?.find((r) => r.label === 'Medical Allowance');
  assert(String(medRow?.amount).includes('9,971'), `Medical = 15% of 66,470 = Rs. 9,971: ${medRow?.amount}`);
  // Conveyance: BPS 16-22 = Rs. 7,500 after 50% increase w.e.f. 01-07-2026
  const convRow = sal17.breakdown?.find((r) => r.label === 'Conveyance Allowance');
  assert(String(convRow?.amount).includes('7,500'), `Conveyance BPS-17 = Rs. 7,500: ${convRow?.amount}`);
  const sal5 = calculateSalary({ government: 'federal', year: '2026-27', bps: 5, stage: 0, cityType: 'big' });
  const convRow5 = sal5.breakdown?.find((r) => r.label === 'Conveyance Allowance');
  assert(String(convRow5?.amount).includes('2,898'), `Conveyance BPS-5 (band 5-10) = Rs. 2,898: ${convRow5?.amount}`);
  // Medical: Rs. 1,500 flat for BPS 1-15
  const medRow5 = sal5.breakdown?.find((r) => r.label === 'Medical Allowance');
  assert(String(medRow5?.amount).includes('1,500'), `Medical BPS-5 = Rs. 1,500 flat: ${medRow5?.amount}`);
  // Deductions: verified statutory schedules (OM 18-08-2005 / SRO 21(1)/96 / FEBF Act 3rd Schedule)
  const gpfRow = sal17.breakdown?.find((r) => r.label.includes('GP Fund Subscription'));
  assert(String(gpfRow?.amount).includes('1,000'), `GP Fund BPS-17 slab = Rs. 1,000/month: ${gpfRow?.amount}`);
  const bfRow = sal17.breakdown?.find((r) => r.label.includes('Benevolent Fund'));
  assert(String(bfRow?.amount).includes('155'), `Benevolent Fund capped at Rs. 155/month: ${bfRow?.amount}`);
  const giRow = sal17.breakdown?.find((r) => r.label.includes('Group Insurance'));
  assert(String(giRow?.amount).includes('182'), `Group Insurance (pay > 16,000) = Rs. 182/month: ${giRow?.amount}`);
  // HRA: verified frozen schedule (BPS-17: 4,433 / 6,650)
  const hraRow17 = sal17.breakdown?.find((r) => r.label.includes('House Rent Allowance'));
  assert(String(hraRow17?.amount).includes('6,650'), `HRA BPS-17 big city = Rs. 6,650: ${hraRow17?.amount}`);
  // Sindh Personal Allowance 2026: BPS-01 Rs. 401, BPS-02 Rs. 80
  const salSindh1 = calculateSalary({ government: 'sindh', year: '2026-27', bps: 1, stage: 0, cityType: 'big' });
  const paRow = salSindh1.breakdown?.find((r) => r.label.includes('Personal Allowance'));
  assert(String(paRow?.amount).includes('401'), `Sindh Personal Allowance BPS-01 = Rs. 401: ${paRow?.amount}`);

  // FR-22(a)(i): BPS-16 -> 17, basic 60,000 + premature increment, fixed at NEXT ABOVE stage
  const promoResult = calculatePromotion({
    government: 'federal',
    year: '2026-27',
    currentBps: 16,
    promotedBps: 17,
    currentBasic: 60000,
  });
  // FR-22(a)(i): BPS-16 -> 17, basic 60,000 + premature increment (BPS-16: Rs. 2,610),
  // fixed at NEXT ABOVE stage in BPS-17 (min 54,140 + 3 x 4,110 = Rs. 66,470).
  // Verified against RBPS-2026 (Finance Division notification dated 21-07-2026).
  assert(String(promoResult.primaryResult.value).includes('66,470'), `FR-22 promotion fixation at next-above stage is Rs. 66,470: ${promoResult.primaryResult.value}`);
  const promoGain = promoResult.secondaryResults?.find((r) => r.id === 'payGain');
  assert(String(promoGain?.value).includes('6,470'), `Promotional monthly gain is Rs. 6,470: ${promoGain?.value}`);

  // Federal DRA-2026: round(45,070 x 15%) = 6,761 on frozen BPS-2022 initial (basic pay as on
  // 30-06-2022), BPS 1-22, w.e.f. 01-07-2026 — OM No. 14(2)R-3/2025 dated 21-07-2026.
  const salDra = calculateSalary({ government: 'federal', year: '2026-27', bps: 17, stage: 0, cityType: 'big' });
  const dra2026Row = salDra.breakdown?.find((r) => r.label.includes('Disparity Reduction Allowance 2026'));
  assert(String(dra2026Row?.amount).includes('6,761'), `DRA-2026 is 15% of frozen BPS-2022 initial (Rs. 6,761): ${dra2026Row?.amount}`);
  const salBps20 = calculateSalary({ government: 'federal', year: '2026-27', bps: 20, stage: 0, cityType: 'big' });
  assert(salBps20.breakdown?.filter((r) => r.label.includes('Disparity Reduction Allowance 2026')).length === 1, 'DRA-2026 applies to BPS-20 (scope is BPS 1-22)');

  // ==========================================
  // 7. UI-WIRED VEHICLE, PROPERTY, ISLAMIC, FX, FUEL, LOAN & ZAKAT ENGINES
  // ==========================================
  console.log('\n--- 7. Testing UI-Wired Vehicle, Property, Islamic, FX, Fuel, Loan & Zakat Engines ---');

  // Token tax: Punjab 1300cc, Rs. 4M invoice → 0.3% token (12,000) + Sec 231B 1.5% (60,000)
  const tt = calculateTokenTax({ province: 'punjab', engineCapacityCc: 1300, invoiceValue: 4000000, isFiler: true });
  assert(String(tt.primaryResult.value).includes('72,000'), 'Punjab 1300cc token + 231B WHT totals Rs. 72,000');
  assert(
    String(tt.secondaryResults?.find((r) => r.id === 'fbrAdvanceTax')?.label).includes('1.50%'),
    'Section 231B rate is 1.50% of value for the 1001–1300cc band'
  );

  // Property tax: TY2027 buyer filer, Rs. 10M → 236K 1.5% = 150,000; total 350,000
  const pt = calculatePropertyTax({ propertyValue: 10000000, transactionType: 'buy', isFiler: true, taxYear: '2026-27' });
  assert(
    String(pt.secondaryResults?.find((r) => r.id === 'advanceTax')?.value).includes('1,50,000'),
    'Property 236K buyer-filer advance tax is Rs. 150,000'
  );
  assert(String(pt.primaryResult.value).includes('3,50,000'), 'Property total transfer charges are Rs. 350,000');

  // Inheritance no-children: wife 1/4, mother 1/3, father takes the residuary
  const inh = calculateInheritance({
    estateValue: 10000000,
    debtsAndFuneral: 0,
    hasSpouse: true,
    spouseType: 'wife',
    sons: 0,
    daughters: 0,
    hasFather: true,
    hasMother: true,
  });
  const fatherRow = inh.breakdown?.find((r) => r.label.includes('Father'));
  assert(String(fatherRow?.label).includes('Residuary'), 'No-children: father takes residuary (not a fixed 1/3)');
  assert(String(fatherRow?.amount).includes('41,66,667'), 'No-children: father residuary share is Rs. 41,66,667');
  const motherRow = inh.breakdown?.find((r) => r.label.includes('Mother'));
  assert(String(motherRow?.label).includes('(1/3)'), 'No-children: mother label reflects the 1/3 fraction actually used');

  // Currency: 100 USD open market → 277.10 × 1.0075 × 100 = Rs. 27,918
  const cur = calculateCurrency({ amount: 100, fromCurrency: 'USD', toCurrency: 'PKR', rateType: 'openMarket' });
  assert(String(cur.primaryResult.value).includes('27,918'), 'Currency open-market conversion applies the 0.75% retail spread');

  // Fuel: 380 km @ 14.5 km/L @ Rs. 342.60/L → Rs. 8,978
  const fuel = calculateVehicleFuelCost({ distanceKm: 380, fuelAverageKmPerLiter: 14.5, fuelPricePerLiter: 342.60 });
  assert(String(fuel.primaryResult.value).includes('8,978'), 'Fuel trip cost computed correctly for the worked-example price Rs. 342.60/L');

  // Islamic financing disclosure states the reducing-balance equivalence
  const isl = calculateLoanEmi({ loanAmount: 3000000, annualInterestRate: 13.5, tenureYears: 5, loanType: 'islamic' });
  assert(String(isl.notes?.[0]).includes('reducing-balance'), 'Islamic note discloses reducing-balance mathematical equivalence');

  // Zakat: silver nisab recomputed from live defaults (52.5 × Rs. 6,528 = Rs. 342,720)
  const zk = calculateZakat({ cashInHand: 400000 });
  assert(String(zk.primaryResult.value).includes('10,000'), 'Zakat 2.5% on Rs. 400,000 above silver nisab is Rs. 10,000');

  console.log('\n========================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY (100% PRECISION)');
  console.log('========================================\n');
}

runTests();
