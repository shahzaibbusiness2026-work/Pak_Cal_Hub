/**
 * Overseas Pakistanis toolkit test suite (added 11 Nov 2026).
 * Every figure below is hand-worked from the published rate tables the
 * calculators use — see src/lib/calculators/overseas.ts for sources.
 * Amounts use Pak Calc Hub's South Asian grouping (e.g. Rs. 4,27,900).
 */

import {
  calculatePtaVisitorTax,
  calculateNicopFee,
  calculateRdaGuide,
  calculateUmrahCost,
  calculateOverseasPropertyCost,
} from '../lib/calculators/overseas';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${message}`);
  }
}

function runTests() {
  console.log('\n=== Overseas Toolkit Tests ===\n');

  // ── PTA visitor tax (FY2026-27 brackets) ──
  // $900 @ Rs. 277 = Rs. 249,300. Sales tax 25% = 62,325 + RD 17,600 + levy 16,000 = 95,925 passport.
  const pta900 = calculatePtaVisitorTax({ deviceValueUsd: 900, usdPkrRate: 277, registrationRoute: 'passport', filerStatus: 'filer' });
  assert(String(pta900.primaryResult.value).includes('95,925'), `PTA $900 passport = Rs. 95,925: ${pta900.primaryResult.value}`);
  assert(String(pta900.secondaryResults?.find((r) => r.id === 'cnicFilerTax')?.value).includes('1,07,425'), `PTA $900 CNIC filer = Rs. 1,07,425 (+11,500 income tax)`);
  assert(String(pta900.secondaryResults?.find((r) => r.id === 'cnicNonFilerTax')?.value).includes('1,18,925'), `PTA $900 CNIC non-filer = Rs. 1,18,925 (+23,000 income tax)`);
  // $250 @ Rs. 277 = Rs. 69,250. Sales tax 18% = 12,465 + RD 8,800 + levy 1,800 = 23,065 passport.
  const pta250 = calculatePtaVisitorTax({ deviceValueUsd: 250, usdPkrRate: 277, registrationRoute: 'passport', filerStatus: 'filer' });
  assert(String(pta250.primaryResult.value).includes('23,065'), `PTA $250 passport = Rs. 23,065: ${pta250.primaryResult.value}`);
  // $480 @ 277 = Rs. 132,960. 18% = 23,933 + 12,000 + 4,000 = 39,933 passport.
  const pta480 = calculatePtaVisitorTax({ deviceValueUsd: 480, usdPkrRate: 277, registrationRoute: 'passport', filerStatus: 'filer' });
  assert(String(pta480.primaryResult.value).includes('39,933'), `PTA $480 passport = Rs. 39,933: ${pta480.primaryResult.value}`);
  const ptaVisit = calculatePtaVisitorTax({ deviceValueUsd: 900, usdPkrRate: 277, registrationRoute: 'passport', visitingShortStay: true });
  assert(String(ptaVisit.primaryResult.value).includes('temporary registration'), `PTA short visit = free temporary registration: ${ptaVisit.primaryResult.value}`);
  assert(String(ptaVisit.primaryResult.subtext || '').includes('120 days'), 'PTA short visit subtext names the 120-day window');

  // ── NICOP fee ──
  const nicopUae = calculateNicopFee({ countryOfResidence: 'AE', applicationType: 'renewal', processingSpeed: 'executive', paymentMethod: 'pakid', usdPkrRate: 277 });
  assert(String(nicopUae.primaryResult.value).includes('$40'), `NICOP UAE executive = $40: ${nicopUae.primaryResult.value}`);
  assert(String(nicopUae.secondaryResults?.find((r) => r.id === 'processingDays')?.value).includes('9 days'), 'NICOP executive = 9 days');
  assert(String(nicopUae.secondaryResults?.find((r) => r.id === 'feePkr')?.value).includes('11,080'), 'NICOP $40 × 277 = Rs. 11,080');
  const nicopUk = calculateNicopFee({ countryOfResidence: 'GB', applicationType: 'new', processingSpeed: 'normal', paymentMethod: 'pakid', usdPkrRate: 277 });
  assert(String(nicopUk.primaryResult.value).includes('$39'), `NICOP UK normal = $39: ${nicopUk.primaryResult.value}`);
  assert(String(nicopUk.secondaryResults?.find((r) => r.id === 'processingDays')?.value).includes('31 days'), 'NICOP normal = 31 days');

  // ── RDA / NPC returns ──
  // USD 10,000 × 7.25% × 1y = $725 gross; 10% tax $72.50; net $652.50; maturity $10,652.50.
  const npcUsd = calculateRdaGuide({ hasNicopPoc: true, hasPakistaniPassport: true, taxResidentAbroad: true, goal: 'npc', currency: 'USD', tenor: '12m', investmentAmount: 10000, islamic: false });
  assert(String(npcUsd.primaryResult.value).includes('10,652.50'), `NPC USD 10k 12m matures at $10,652.50: ${npcUsd.primaryResult.value}`);
  assert(String(npcUsd.secondaryResults?.find((r) => r.id === 'netProfit')?.value).includes('652.50'), 'NPC USD net profit after 10% tax = $652.50');
  // PKR 1,000,000 × 12.75% × 5y = 637,500 gross; tax 63,750; net 573,750; maturity 1,573,750.
  const npcPkr = calculateRdaGuide({ hasNicopPoc: true, hasPakistaniPassport: false, taxResidentAbroad: true, goal: 'npc', currency: 'PKR', tenor: '5y', investmentAmount: 1000000, islamic: false });
  assert(String(npcPkr.secondaryResults?.find((r) => r.id === 'grossProfit')?.value).includes('6,37,500'), 'NPC PKR 5y gross profit = Rs. 6,37,500');
  assert(String(npcPkr.secondaryResults?.find((r) => r.id === 'netProfit')?.value).includes('5,73,750'), 'NPC PKR 5y net profit = Rs. 5,73,750');
  const rdaNo = calculateRdaGuide({ hasNicopPoc: false, hasPakistaniPassport: false, taxResidentAbroad: true, goal: 'npc', currency: 'USD', tenor: '12m', investmentAmount: 10000 });
  assert(String(rdaNo.primaryResult.value).includes('Not established'), 'RDA without NICOP/POC/passport = not eligible');

  // ── Umrah estimator ──
  // 2 adults, Karachi, off-peak, 8 Makkah + 7 Madinah nights, economy, no meals:
  // flights 180,000–260,000; Makkah hotels 64,000–80,000; Madinah 49,000–63,000;
  // visa bundle 96,000–130,000; subtotal 389,000–533,000; +10% buffer = 427,900–586,300.
  const umrah = calculateUmrahCost({ adults: 2, children: 0, departureCity: 'khi', season: 'off-peak', nightsMakkah: 8, nightsMadinah: 7, hotelCategory: 'economy', includeMeals: false });
  assert(String(umrah.primaryResult.value).includes('4,27,900'), `Umrah 2-adult economy low = Rs. 4,27,900: ${umrah.primaryResult.value}`);
  assert(String(umrah.primaryResult.value).includes('5,86,300'), `Umrah 2-adult economy high = Rs. 5,86,300: ${umrah.primaryResult.value}`);
  const umrahHajj = calculateUmrahCost({ adults: 2, children: 0, departureCity: 'khi', season: 'hajj-month', nightsMakkah: 8, nightsMadinah: 7, hotelCategory: 'economy', includeMeals: false });
  assert(String(umrahHajj.primaryResult.value).includes('No Umrah visa'), 'Umrah in Hajj months is blocked, not priced');

  // ── Overseas property ──
  // Buy: base = max(18,000,000; 15,000,000; 16,000,000) = 18,000,000.
  // Stamp 1% 180,000 + registration 1% 180,000 + 236K filer 1.25% 225,000 = 585,000; all-in 18,585,000.
  const propBuy = calculateOverseasPropertyCost({ province: 'punjab', transactionType: 'buy', declaredPrice: 18000000, fbrValue: 15000000, dcRateValue: 16000000, stampDutyPct: 1, registrationPct: 1, capitalValueTaxPct: 0, isFiler: true, nicopPoc: true, fundsViaRda: true });
  assert(String(propBuy.primaryResult.value).includes('1,85,85,000'), `Overseas buy all-in = Rs. 1,85,85,000: ${propBuy.primaryResult.value}`);
  assert(String(propBuy.secondaryResults?.find((r) => r.id === 'buyerCosts')?.value).includes('5,85,000'), 'Overseas buy taxes & fees = Rs. 5,85,000');
  // Sell: gain 18,000,000 − 12,000,000 = 6,000,000; CGT 15% = 900,000; 236C 2.75% = 495,000; net 16,605,000.
  const propSell = calculateOverseasPropertyCost({ province: 'punjab', transactionType: 'sell', declaredPrice: 18000000, fbrValue: 15000000, dcRateValue: 16000000, stampDutyPct: 1, registrationPct: 1, capitalValueTaxPct: 0, isFiler: true, nicopPoc: true, fundsViaRda: true, purchasePrice: 12000000, cgtRatePct: 15, claimOverseasExemption: false, annualRent: 0, annualPropertyTax: 0, maintenanceAnnual: 0 });
  assert(String(propSell.primaryResult.value).includes('1,66,05,000'), `Overseas sell net = Rs. 1,66,05,000: ${propSell.primaryResult.value}`);
  assert(String(propSell.secondaryResults?.find((r) => r.id === 'cgt')?.value).includes('9,00,000'), 'Overseas sell CGT 15% of Rs. 60,00,000 gain = Rs. 9,00,000');
  // Exemption claimed with NICOP + RDA funding → CGT shown as Rs. 0, with the at-rate figure still visible.
  const propExempt = calculateOverseasPropertyCost({ province: 'punjab', transactionType: 'sell', declaredPrice: 18000000, fbrValue: 15000000, dcRateValue: 16000000, stampDutyPct: 1, registrationPct: 1, capitalValueTaxPct: 0, isFiler: true, nicopPoc: true, fundsViaRda: true, purchasePrice: 12000000, cgtRatePct: 15, claimOverseasExemption: true, annualRent: 0, annualPropertyTax: 0, maintenanceAnnual: 0 });
  assert(String(propExempt.secondaryResults?.find((r) => r.id === 'cgt')?.value).includes('claimed'), 'CGT exemption is labelled claimed, not presented as settled');
  assert(String(propExempt.primaryResult.value).includes('1,75,05,000'), `Exempt sell net = Rs. 1,75,05,000 (only 236C deducted): ${propExempt.primaryResult.value}`);
  // Exemption ticked but funds NOT via RDA → full CGT still charged.
  const propNoExempt = calculateOverseasPropertyCost({ province: 'punjab', transactionType: 'sell', declaredPrice: 18000000, fbrValue: 15000000, dcRateValue: 16000000, stampDutyPct: 1, registrationPct: 1, capitalValueTaxPct: 0, isFiler: true, nicopPoc: true, fundsViaRda: false, purchasePrice: 12000000, cgtRatePct: 15, claimOverseasExemption: true, annualRent: 0, annualPropertyTax: 0, maintenanceAnnual: 0 });
  assert(String(propNoExempt.secondaryResults?.find((r) => r.id === 'cgt')?.value).includes('9,00,000'), 'Exemption without RDA funding does not zero the CGT');
}

runTests();
console.log('\nAll overseas toolkit tests passed.\n');
