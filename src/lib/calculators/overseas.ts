import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';
import { invalidInput } from './validation';

/**
 * Overseas Pakistanis toolkit — calculators added 11 Nov 2026.
 *
 * Honesty rule (same as the rest of Pak Calc Hub): no rate is presented as
 * official unless it was corroborated against an official or multi-source
 * table on the verification date. Every function below labels its figures
 * as estimates and names the source + date in its notes.
 */

// ─── 1. PTA mobile tax for overseas visitors ────────────────────────────────
// FY2026-27 brackets, in force 1 July 2026 (SRO 1064(I)/2026). Cross-checked
// 11 Nov 2026 against ProInfoDesk (worked examples reproduce exactly) and
// FilerWise (top tiers + SRO reference). Sales tax is charged on the full
// PKR value, not just the part above the threshold. Income tax applies only
// on the CNIC route; the non-filer column is the doubled figure from the
// same published table. DIRBS always has the final figure for an IMEI.
interface PtaTier { maxUsd: number; regulatoryDuty: number; salesTaxPct: number; levy: number; incomeTaxFiler: number; incomeTaxNonFiler: number; }
const PTA_TIERS: PtaTier[] = [
  { maxUsd: 30, regulatoryDuty: 240, salesTaxPct: 18, levy: 100, incomeTaxFiler: 100, incomeTaxNonFiler: 200 },
  { maxUsd: 100, regulatoryDuty: 2400, salesTaxPct: 18, levy: 200, incomeTaxFiler: 100, incomeTaxNonFiler: 200 },
  { maxUsd: 200, regulatoryDuty: 6000, salesTaxPct: 18, levy: 200, incomeTaxFiler: 100, incomeTaxNonFiler: 200 },
  { maxUsd: 350, regulatoryDuty: 8800, salesTaxPct: 18, levy: 1800, incomeTaxFiler: 970, incomeTaxNonFiler: 1940 },
  { maxUsd: 500, regulatoryDuty: 12000, salesTaxPct: 18, levy: 4000, incomeTaxFiler: 5000, incomeTaxNonFiler: 10000 },
  { maxUsd: 700, regulatoryDuty: 17600, salesTaxPct: 25, levy: 8000, incomeTaxFiler: 11500, incomeTaxNonFiler: 23000 },
  { maxUsd: Number.POSITIVE_INFINITY, regulatoryDuty: 17600, salesTaxPct: 25, levy: 16000, incomeTaxFiler: 11500, incomeTaxNonFiler: 23000 },
];

export function calculatePtaVisitorTax(inputs: Record<string, any>): CalculatorOutput {
  const usd = safeNumber(inputs.deviceValueUsd, 0);
  const rate = safeNumber(inputs.usdPkrRate, 277);
  const route = inputs.registrationRoute || 'passport';
  const filer = inputs.filerStatus || 'filer';
  if (usd <= 0) return invalidInput('Enter the phone’s assessed value in USD.');
  if (rate <= 0) return invalidInput('Enter a USD → PKR rate above zero.');
  // PTA temporary registration: one phone free for up to 120 days per visit.
  if (inputs.visitingShortStay === true) {
    return {
      primaryResult: { id: 'ptaTax', label: 'PTA tax for this visit', value: 'Rs. 0 — temporary registration', type: 'text', highlight: true, color: 'success', subtext: 'Visiting for under 120 days' },
      secondaryResults: [
        { id: 'tempWindow', label: 'Temporary registration', value: 'Free for up to 120 days per visit', type: 'text' },
        { id: 'tempLimit', label: 'Applies to', value: 'One phone per visit', type: 'text' },
      ],
      breakdown: [
        { label: 'Stay', amount: 'Under 120 days — temporary registration, no tax due' },
        { label: 'If you stay longer', amount: 'Register permanently before the 120 days end, or the phone can be blocked' },
        { label: 'Where to register', amount: 'PTA DIRBS portal (dirbs.pta.gov.pk/drs)', isTotal: true },
      ],
      notes: [
        'Temporary registration is a PTA facility for overseas Pakistanis and foreign visitors; it does not activate itself — apply on DIRBS on arrival.',
        'The figures below the 120-day window use the FY2026-27 bracket table (SRO 1064(I)/2026, in force 1 July 2026), cross-checked 11 Nov 2026. DIRBS shows the final amount for your IMEI.',
      ],
    };
  }
  const tier = PTA_TIERS.find((t) => usd <= t.maxUsd) || PTA_TIERS[PTA_TIERS.length - 1];
  const pkrValue = usd * rate;
  const salesTax = Math.round((pkrValue * tier.salesTaxPct) / 100);
  const passportTotal = salesTax + tier.regulatoryDuty + tier.levy;
  const cnicFilerTotal = passportTotal + tier.incomeTaxFiler;
  const cnicNonFilerTotal = passportTotal + tier.incomeTaxNonFiler;
  const chosen = route === 'passport' ? passportTotal : filer === 'non-filer' ? cnicNonFilerTotal : cnicFilerTotal;
  const incomeTax = route === 'passport' ? 0 : filer === 'non-filer' ? tier.incomeTaxNonFiler : tier.incomeTaxFiler;
  return {
    primaryResult: {
      id: 'ptaTax', label: route === 'passport' ? 'PTA tax — passport route (estimate)' : `PTA tax — CNIC route, ${filer} (estimate)`,
      value: formatPKR(chosen), type: 'currency', highlight: true, color: 'success',
      subtext: `Phone valued at $${usd} (≈ ${formatPKR(Math.round(pkrValue))} at Rs. ${rate}/USD)`,
    },
    secondaryResults: [
      { id: 'passportTax', label: 'Passport route', value: formatPKR(passportTotal), type: 'currency' },
      { id: 'cnicFilerTax', label: 'CNIC route — filer', value: formatPKR(cnicFilerTotal), type: 'currency' },
      { id: 'cnicNonFilerTax', label: 'CNIC route — non-filer', value: formatPKR(cnicNonFilerTotal), type: 'currency' },
      { id: 'passportSaving', label: 'Passport saves vs CNIC filer', value: formatPKR(cnicFilerTotal - passportTotal), type: 'currency' },
    ],
    breakdown: [
      { label: 'Phone value in PKR', amount: formatPKR(Math.round(pkrValue)) },
      { label: `Sales tax (${tier.salesTaxPct}% of full value)`, amount: formatPKR(salesTax) },
      { label: 'Regulatory duty', amount: formatPKR(tier.regulatoryDuty) },
      { label: 'Mobile handset levy', amount: formatPKR(tier.levy) },
      { label: 'Income tax (CNIC route only)', amount: incomeTax ? formatPKR(incomeTax) : 'Rs. 0 — passport route is exempt' },
      { label: 'Estimated total — your chosen route', amount: formatPKR(chosen), isTotal: true },
    ],
    notes: [
      'Estimate only. FBR sets the tax from its own assessed value for your exact model and the customs exchange rate on the day — DIRBS (dirbs.pta.gov.pk/drs) shows the final amount for your IMEI.',
      'Rate table: FY2026-27 brackets, SRO 1064(I)/2026, in force 1 July 2026; cross-checked 11 Nov 2026. Sales tax jumps from 18% to 25% above US$500, and the handset levy doubles above US$700.',
      'Passport registration must be within 60 days of arrival and covers one phone per trip; a second phone on the same passport in the same year is charged at the CNIC rate. Registering late on CNIC can add a fine that is not published — the CNIC figure above is a minimum.',
      'Visiting for under 120 days? Use the temporary-registration option — one phone free for up to 120 days per visit.',
    ],
  };
}

// ─── 2. NICOP fee & renewal planner ─────────────────────────────────────────
// NADRA Smart NICOP fee schedule as reported across multiple 2026 sources
// (ARY News 7 Apr 2026; NADRA fee-structure pages; independent guides Nov
// 2026): Zone A (USA/Europe) $39/$57/$75, Zone B (Middle East/Africa)
// $20/$30/$40 for Normal/Urgent/Executive. Processing days are the widely
// reported 31/23/9 — NADRA's own fee page has printed different day counts,
// so the tool tells the user to confirm in PakID. New, renewal, modification
// and duplicate share the same fee in the published table.
const NICOP_ZONE_A = new Set(['US', 'GB', 'CA', 'DE', 'FR', 'NL', 'ES', 'IT', 'SE', 'NO', 'DK', 'IE', 'AU', 'NZ', 'AT', 'BE', 'CH', 'PT', 'FI', 'GR']);
const NICOP_ZONE_B = new Set(['AE', 'SA', 'QA', 'OM', 'BH', 'KW', 'IQ', 'JO', 'LB', 'EG', 'ZA', 'KE', 'NG']);
const NICOP_FEES: Record<string, Record<string, { feeUsd: number; days: number }>> = {
  A: { normal: { feeUsd: 39, days: 31 }, urgent: { feeUsd: 57, days: 23 }, executive: { feeUsd: 75, days: 9 } },
  B: { normal: { feeUsd: 20, days: 31 }, urgent: { feeUsd: 30, days: 23 }, executive: { feeUsd: 40, days: 9 } },
};
const NICOP_DOCS: Record<string, string[]> = {
  new: ['Pakistani passport or CNIC of the applicant', 'Proof of residence abroad (visa / residence permit)', 'Passport-size photograph (PakID app captures it)', 'Parent’s CNIC/NICOP if applying for a minor'],
  renewal: ['Existing NICOP (expired or expiring)', 'Pakistani passport', 'Proof of current residence abroad', 'Updated photograph if your appearance changed'],
  modification: ['Existing NICOP', 'Document proving the change (e.g. marriage certificate, updated passport)', 'Pakistani passport'],
  duplicate: ['Pakistani passport', 'Police report or affidavit for a lost card (if lost)', 'Proof of residence abroad'],
};

export function calculateNicopFee(inputs: Record<string, any>): CalculatorOutput {
  const country = String(inputs.countryOfResidence || 'AE');
  const zone = NICOP_ZONE_A.has(country) ? 'A' : NICOP_ZONE_B.has(country) ? 'B' : null;
  if (!zone) return invalidInput('Choose a country of residence from the list.');
  const appType = String(inputs.applicationType || 'renewal');
  const speed = String(inputs.processingSpeed || 'normal');
  const row = NICOP_FEES[zone][speed];
  if (!row) return invalidInput('Choose a valid processing speed.');
  const rate = safeNumber(inputs.usdPkrRate, 277);
  const feePkr = Math.round(row.feeUsd * rate);
  const payment = String(inputs.paymentMethod || 'pakid');
  const docs = NICOP_DOCS[appType] || NICOP_DOCS.renewal;
  const typeLabel: Record<string, string> = { new: 'New Smart NICOP', renewal: 'Smart NICOP renewal', modification: 'Smart NICOP modification', duplicate: 'Duplicate / lost Smart NICOP' };
  return {
    primaryResult: {
      id: 'nicopFee', label: `${typeLabel[appType] || 'Smart NICOP'} — Zone ${zone} (${speed})`,
      value: `$${row.feeUsd} (≈ ${formatPKR(feePkr)})`, type: 'text', highlight: true, color: 'success',
      subtext: `Expected processing: ${row.days} days (confirm in PakID)`,
    },
    secondaryResults: [
      { id: 'feeUsd', label: 'Fee', value: `$${row.feeUsd}`, type: 'text' },
      { id: 'feePkr', label: `Fee in PKR (≈ Rs. ${rate}/USD)`, value: formatPKR(feePkr), type: 'currency' },
      { id: 'processingDays', label: 'Expected processing days', value: `${row.days} days`, type: 'text' },
      { id: 'zone', label: 'NADRA fee zone', value: zone === 'A' ? 'Zone A — USA & Europe' : 'Zone B — Middle East & Africa', type: 'text' },
    ],
    breakdown: [
      { label: 'Application', amount: typeLabel[appType] || 'Smart NICOP' },
      { label: 'Zone / speed', amount: `Zone ${zone} / ${speed}` },
      { label: 'NADRA fee', amount: `$${row.feeUsd}` },
      { label: 'Payment', amount: payment === 'pakid' ? 'PakID app — pay in USD (NADRA may convert to PKR at its rate)' : 'Embassy / NADRA centre — confirm the local-currency amount at the counter' },
      { label: 'Delivery charges', amount: 'Separate — not included in the fee above' },
      { label: 'Total fee', amount: `$${row.feeUsd} (≈ ${formatPKR(feePkr)})`, isTotal: true },
    ],
    notes: [
      'Fees are the NADRA Smart NICOP schedule as reported across multiple 2026 sources (Zone A $39/$57/$75; Zone B $20/$30/$40 for Normal/Urgent/Executive). NADRA revises fees — the amount shown in the PakID app on the day you apply is the one that counts.',
      'Processing days (31/23/9) are widely reported, but NADRA’s own fee page has printed different day counts. Confirm the date in PakID before you plan travel.',
      'Apply through the PakID app or a NADRA centre / Pakistani mission. New, renewal, modification and duplicate share the same fee in the published table.',
      `Documents to have ready: ${docs.join('; ')}.`,
    ],
  };
}

// ─── 3. Roshan Digital Account guide + Naya Pakistan Certificate returns ────
// NPC rates: Finance Division SRO 870(I)/2026, certificates issued from
// 1 June 2026, corroborated 11 Nov 2026 by SBP's rate table via three
// independent guides (PakHisaab, Pakera, Bank AL Habib). 10% final tax on
// profit. Minimum: 1,000 in foreign currency, Rs. 10,000 in PKR. Islamic
// NPCs carry the same expected rates — actual profit follows monthly
// Mudaraba pool results and is not guaranteed. RDA scale: 975,000+ accounts
// and US$14.16bn received by Sep 2026 (SBP provisional).
const NPC_RATES: Record<string, Record<string, number>> = {
  USD: { '3m': 6.75, '6m': 7.0, '12m': 7.25, '3y': 7.5, '5y': 7.75 },
  PKR: { '3m': 11.75, '6m': 12.0, '12m': 12.25, '3y': 12.5, '5y': 12.75 },
  GBP: { '3m': 6.75, '6m': 7.25, '12m': 7.5, '3y': 7.75, '5y': 8.0 },
  EUR: { '3m': 4.75, '6m': 5.25, '12m': 5.5, '3y': 6.0, '5y': 6.25 },
  SAR: { '3m': 6.5, '6m': 6.75, '12m': 7.0, '3y': 7.25, '5y': 7.5 },
  AED: { '3m': 6.5, '6m': 6.75, '12m': 7.0, '3y': 7.25, '5y': 7.5 },
};
const NPC_YEARS: Record<string, number> = { '3m': 0.25, '6m': 0.5, '12m': 1, '3y': 3, '5y': 5 };
const NPC_TENOR_LABEL: Record<string, string> = { '3m': '3 months', '6m': '6 months', '12m': '12 months', '3y': '3 years', '5y': '5 years' };
const RDA_BANKS = ['Allied Bank', 'Askari Bank', 'Bank Alfalah', 'Bank AL Habib', 'Bank of Punjab', 'Dubai Islamic Bank', 'Faysal Bank', 'HBL', 'Habib Metropolitan Bank', 'JS Bank', 'MCB', 'Meezan Bank', 'Samba Bank', 'Standard Chartered', 'UBL'];

export function calculateRdaGuide(inputs: Record<string, any>): CalculatorOutput {
  const eligible = inputs.hasNicopPoc === true || inputs.hasPakistaniPassport === true;
  const goal = String(inputs.goal || 'npc');
  const currency = String(inputs.currency || 'USD');
  const tenor = String(inputs.tenor || '12m');
  const amount = safeNumber(inputs.investmentAmount, 0);
  const islamic = inputs.islamic === true;
  const rate = NPC_RATES[currency]?.[tenor];
  if (rate === undefined) return invalidInput('Choose a valid currency and tenor.');
  const minAmount = currency === 'PKR' ? 10000 : 1000;
  const years = NPC_YEARS[tenor];
  const gross = (amount * rate * years) / 100;
  const tax = gross * 0.1;
  const net = gross - tax;
  const maturity = amount + net;
  const money = (v: number) => currency === 'PKR' ? formatPKR(Math.round(v)) : `${currency} ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const docsMissing: string[] = [];
  if (!inputs.hasNicopPoc && !inputs.hasPakistaniPassport) docsMissing.push('NICOP, POC or Pakistani passport');
  if (!inputs.taxResidentAbroad) docsMissing.push('Proof of tax residence abroad (some banks ask for it)');
  if (goal === 'npc' && amount > 0 && amount < minAmount) {
    return invalidInput(`Minimum Naya Pakistan Certificate investment is ${money(minAmount)} — enter at least that amount.`);
  }
  if (!eligible) {
    return {
      primaryResult: { id: 'rdaEligibility', label: 'Roshan Digital Account eligibility', value: 'Not established from your answers', type: 'text', highlight: true, color: 'warning', subtext: 'Check with the bank for your case' },
      secondaryResults: [
        { id: 'needDoc', label: 'You need one of these', value: 'NICOP, POC or Pakistani passport', type: 'text' },
        { id: 'banks', label: 'Agent banks', value: `${RDA_BANKS.length} SBP agent banks`, type: 'text' },
      ],
      breakdown: [
        { label: 'Eligibility', amount: 'Not established — RDA is for non-resident Pakistanis holding a Pakistani passport, NICOP or POC' },
        { label: 'Next step', amount: 'Check with one of the 15 SBP agent banks for your case', isTotal: true },
      ],
      notes: [
        'RDA eligibility: non-resident Pakistanis holding a Pakistani passport, NICOP or POC (certain resident Pakistanis with declared foreign assets also qualify). Confirm with the bank.',
        `SBP agent banks: ${RDA_BANKS.join(', ')}.`,
        'By September 2026 SBP reported 975,000+ RDA accounts and US$14.16bn received (provisional).',
      ],
    };
  }
  const goalLabel: Record<string, string> = { savings: 'Savings account', npc: 'Naya Pakistan Certificates', stocks: 'Pakistan Stock Exchange', property: 'Property in Pakistan' };
  return {
    primaryResult: {
      id: 'rdaResult',
      label: goal === 'npc' && amount > 0 ? `Naya Pakistan Certificate — ${NPC_TENOR_LABEL[tenor]} at ${rate}% p.a. (net of 10% tax)` : 'Roshan Digital Account — you appear eligible',
      value: goal === 'npc' && amount > 0 ? money(maturity) : 'Eligible — open an RDA online',
      type: 'text', highlight: true, color: 'success',
      subtext: goal === 'npc' && amount > 0 ? `Invest ${money(amount)} → ${money(maturity)} at maturity` : `${goalLabel[goal] || 'RDA'} • ${RDA_BANKS.length} agent banks`,
    },
    secondaryResults: [
      ...(goal === 'npc' && amount > 0 ? [
        { id: 'npcRate', label: 'NPC rate (per year)', value: `${rate}%`, type: 'text' as const },
        { id: 'grossProfit', label: 'Gross profit', value: money(gross), type: 'text' as const },
        { id: 'tax', label: 'Tax withheld (10% final)', value: money(tax), type: 'text' as const },
        { id: 'netProfit', label: 'Net profit after tax', value: money(net), type: 'text' as const },
      ] : []),
      { id: 'eligibility', label: 'Eligibility', value: 'NICOP / POC / Pakistani passport held', type: 'text' },
      { id: 'payout', label: 'Profit payment', value: tenor === '3y' || tenor === '5y' ? 'Every 6 months' : 'At maturity, with principal', type: 'text' },
    ],
    breakdown: [
      { label: 'Eligibility', amount: 'Eligible — non-resident Pakistani with NICOP, POC or Pakistani passport' },
      { label: 'Goal', amount: goalLabel[goal] || 'RDA' },
      ...(goal === 'npc' ? [
        { label: `NPC rate (${NPC_TENOR_LABEL[tenor]}, ${currency})`, amount: `${rate}% per year` },
        { label: 'Investment', amount: amount > 0 ? money(amount) : 'Enter an amount to see the return' },
        { label: 'Gross profit', amount: amount > 0 ? money(gross) : '—' },
        { label: 'Tax (10% final withholding)', amount: amount > 0 ? money(tax) : '—' },
        { label: 'Net profit', amount: amount > 0 ? money(net) : '—' },
        { label: 'Maturity value', amount: amount > 0 ? money(maturity) : '—', isTotal: true },
      ] : [
        { label: 'How to open', amount: 'Apply online with an SBP agent bank — no branch visit needed', isTotal: true },
      ]),
    ],
    notes: [
      'Indicative only — confirm the rate and terms with the bank before you invest. NPC rates: SRO 870(I)/2026, certificates issued from 1 June 2026; the government revises rates from time to time and a new rate applies only to new certificates.',
      islamic
        ? 'Islamic NPCs carry the same expected rates, but the actual profit is set each month from Mudaraba pool results — it is expected, not guaranteed.'
        : 'Conventional NPC profit is taxed at 10% final withholding; no Pakistan tax return is needed if NPC profit is your only Pakistan-source income.',
      `SBP agent banks (${RDA_BANKS.length}): ${RDA_BANKS.join(', ')}. Banks may run referral programmes — confirm any offer with the bank before relying on it.`,
      ...(docsMissing.length ? [`Missing from your answers: ${docsMissing.join('; ')}.`] : ['Documents usually needed: NICOP/POC/passport, proof of overseas residence, and a foreign bank account for funding.']),
    ],
  };
}

// ─── 4. Umrah cost estimator ──────────────────────────────────────────────────
// Component ranges from published 2026 package data (checked 11 Nov 2026):
// economy 7–10 night packages PKR 220,000–300,000; standard PKR 350,000–
// 500,000; visa SAR 300 (≈ PKR 22,300) + insurance SAR 100–180; visa +
// insurance + transport typically PKR 48,000–65,000 per person; return
// flights PKR 90,000–145,000 off-peak from Karachi/Lahore/Islamabad.
// Ramadan adds roughly 30–50% to flights and hotels. Stay is capped at 30
// days and the visa must be entered within 30 days of issue. No Umrah visa
// is issued during the Hajj months. Pakistani pilgrims apply through a
// licensed (MORA-attested) operator, not directly on Nusuk.
const UMRAH_FLIGHT: Record<string, [number, number]> = {
  khi: [90000, 130000], lhe: [100000, 145000], isb: [100000, 145000], other: [110000, 160000],
};
const UMRAH_HOTEL_MAKKAH: Record<string, [number, number]> = {
  economy: [4000, 5000], 'four-star': [12000, 17000], 'five-star': [28000, 55000],
};
const UMRAH_HOTEL_MADINAH: Record<string, [number, number]> = {
  economy: [3500, 4500], 'four-star': [10000, 14000], 'five-star': [20000, 40000],
};
const UMRAH_SEASON_MULTIPLIER: Record<string, number> = { 'off-peak': 1, ramadan: 1.4, 'peak-holidays': 1.2 };

export function calculateUmrahCost(inputs: Record<string, any>): CalculatorOutput {
  const adults = Math.max(1, Math.round(safeNumber(inputs.adults, 2)));
  const children = Math.max(0, Math.round(safeNumber(inputs.children, 0)));
  const travelers = adults + children;
  const season = String(inputs.season || 'off-peak');
  if (season === 'hajj-month') {
    return {
      primaryResult: { id: 'umrahCost', label: 'Umrah during the Hajj months', value: 'No Umrah visa is issued', type: 'text', highlight: true, color: 'warning', subtext: 'Choose another travel month' },
      secondaryResults: [{ id: 'hajjNote', label: 'Why', value: 'Umrah visas are not issued during the Hajj months', type: 'text' }],
      breakdown: [{ label: 'Hajj months', amount: 'No Umrah visa issued — plan your trip outside this window', isTotal: true }],
      notes: ['Umrah runs all year except the Hajj months. Hajj itself is a separate, quota/ballot package — use a Hajj package quote for it.', 'Stay on an Umrah visa is capped at 30 days, and the visa must be entered within 30 days of issue.'],
    };
  }
  const city = String(inputs.departureCity || 'khi');
  const flight = UMRAH_FLIGHT[city] || UMRAH_FLIGHT.other;
  const category = String(inputs.hotelCategory || 'economy');
  const hotelMakkah = UMRAH_HOTEL_MAKKAH[category] || UMRAH_HOTEL_MAKKAH.economy;
  const hotelMadinah = UMRAH_HOTEL_MADINAH[category] || UMRAH_HOTEL_MADINAH.economy;
  const nightsMakkah = Math.max(0, Math.round(safeNumber(inputs.nightsMakkah, 8)));
  const nightsMadinah = Math.max(0, Math.round(safeNumber(inputs.nightsMadinah, 7)));
  const mult = UMRAH_SEASON_MULTIPLIER[season] || 1;
  const includeMeals = inputs.includeMeals !== false;
  const totalNights = nightsMakkah + nightsMadinah;
  const range = (low: number, high: number): [number, number] => [Math.round(low), Math.round(high)];
  const flightR = range(flight[0] * mult * travelers, flight[1] * mult * travelers);
  const hotelR = range(
    (hotelMakkah[0] * nightsMakkah + hotelMadinah[0] * nightsMadinah) * mult * travelers,
    (hotelMakkah[1] * nightsMakkah + hotelMadinah[1] * nightsMadinah) * mult * travelers,
  );
  const visaR = range(48000 * travelers, 65000 * travelers);
  const mealsR = includeMeals ? range(2500 * totalNights * travelers, 4000 * totalNights * travelers) : [0, 0];
  const subLow = flightR[0] + hotelR[0] + visaR[0] + mealsR[0];
  const subHigh = flightR[1] + hotelR[1] + visaR[1] + mealsR[1];
  const totalLow = Math.round(subLow * 1.1);
  const totalHigh = Math.round(subHigh * 1.1);
  const perLow = Math.round(totalLow / travelers);
  const perHigh = Math.round(totalHigh / travelers);
  return {
    primaryResult: {
      id: 'umrahCost', label: `Estimated Umrah cost — ${travelers} traveller${travelers > 1 ? 's' : ''} (${season})`,
      value: `${formatPKR(totalLow)} – ${formatPKR(totalHigh)}`, type: 'text', highlight: true, color: 'success',
      subtext: `${formatPKR(perLow)} – ${formatPKR(perHigh)} per person • estimate, not a package quote`,
    },
    secondaryResults: [
      { id: 'perPerson', label: 'Per person', value: `${formatPKR(perLow)} – ${formatPKR(perHigh)}`, type: 'text' },
      { id: 'cheapest', label: 'Cheapest time to travel', value: 'Off-peak months (outside Ramadan & school holidays)', type: 'text' },
      { id: 'visaFee', label: 'Official Umrah visa fee', value: 'SAR 300 (≈ PKR 22,300)', type: 'text' },
      { id: 'stayCap', label: 'Maximum stay', value: '30 days', type: 'text' },
    ],
    breakdown: [
      { label: `Return flights (${travelers} ×, ${city.toUpperCase()})`, amount: `${formatPKR(flightR[0])} – ${formatPKR(flightR[1])}` },
      { label: `Hotels — Makkah ${nightsMakkah} nights, Madinah ${nightsMadinah} nights (${category})`, amount: `${formatPKR(hotelR[0])} – ${formatPKR(hotelR[1])}` },
      { label: 'Visa + insurance + transport (operator bundle)', amount: `${formatPKR(visaR[0])} – ${formatPKR(visaR[1])}` },
      ...(includeMeals ? [{ label: `Meals (${totalNights} nights)`, amount: `${formatPKR(mealsR[0])} – ${formatPKR(mealsR[1])}` }] : []),
      { label: 'Contingency buffer (10%)', amount: `${formatPKR(Math.round(subLow * 0.1))} – ${formatPKR(Math.round(subHigh * 0.1))}` },
      { label: 'Estimated total', amount: `${formatPKR(totalLow)} – ${formatPKR(totalHigh)}`, isTotal: true },
    ],
    notes: [
      'Estimate from published 2026 package ranges — not a fixed price. Flights and hotels change daily; get a written quote from a licensed operator before you pay.',
      'The official Umrah visa fee is SAR 300, plus mandatory insurance (about SAR 100–180). Pakistani pilgrims apply through a MORA-attested licensed operator — direct Nusuk applications are not available for Pakistani passport holders.',
      'Ramadan packages cost roughly 30–50% more. The visa must be entered within 30 days of issue and the stay cannot exceed 30 days.',
      'Children are priced as adults here — operators usually discount under-12s, so confirm the child price in your quote. Before paying anyone, ask for the operator’s Saudi Ministry licence number and verify it on Nusuk.',
    ],
  };
}

// ─── 5. Overseas property cost estimator ──────────────────────────────────────
// Buyer/seller costs on the higher of declared price, FBR value and DC rate.
// Advance tax: buyer s.236K 1.25% (filer, TY2027) and seller s.236C 2.75%
// (filer) — the same filer rates the existing property-tax tool uses. The
// non-filer buyer rate is value-banded in TY2027 and is NOT guessed here:
// the tool says so and excludes it. Stamp duty / registration / CVT are
// editable inputs (Punjab stamp duty was reported at 1% under a 2026
// ordinance — confirm your province's current rate). CGT: the calculator
// uses the rate you enter; a 0% result is shown ONLY when you tick the
// overseas-exemption conditions (NICOP/POC + funds through a Roshan /
// non-resident account) — and even then it is labelled "claimed, verify".
export function calculateOverseasPropertyCost(inputs: Record<string, any>): CalculatorOutput {
  const province = String(inputs.province || 'punjab');
  const transaction = String(inputs.transactionType || 'buy');
  const declared = safeNumber(inputs.declaredPrice, 0);
  const fbrValue = safeNumber(inputs.fbrValue, 0);
  const dcValue = safeNumber(inputs.dcRateValue, 0);
  const base = Math.max(declared, fbrValue, dcValue);
  if (base <= 0) return invalidInput('Enter a property price, FBR value or DC rate above zero.');
  const stampPct = safeNumber(inputs.stampDutyPct, 1);
  const regPct = safeNumber(inputs.registrationPct, 1);
  const cvtPct = safeNumber(inputs.capitalValueTaxPct, 0);
  const isFiler = inputs.isFiler !== false;
  const nicop = inputs.nicopPoc === true;
  const fundsRda = inputs.fundsViaRda === true;
  const claimExemption = inputs.claimOverseasExemption === true;
  const cgtRate = safeNumber(inputs.cgtRatePct, 15);
  const stamp = Math.round((base * stampPct) / 100);
  const registration = Math.round((base * regPct) / 100);
  const cvt = Math.round((base * cvtPct) / 100);
  const provinceLabel: Record<string, string> = { punjab: 'Punjab', sindh: 'Sindh', kpk: 'Khyber Pakhtunkhwa', balochistan: 'Balochistan', islamabad: 'Islamabad' };
  if (transaction === 'buy') {
    const advanceTax = isFiler ? Math.round(base * 0.0125) : 0;
    const buyerCosts = stamp + registration + cvt + advanceTax;
    const allIn = base + buyerCosts;
    return {
      primaryResult: {
        id: 'propertyCost', label: 'Overseas buyer — total purchase cost (estimate)',
        value: formatPKR(allIn), type: 'currency', highlight: true, color: 'success',
        subtext: `Property value ${formatPKR(base)} + ${formatPKR(buyerCosts)} in taxes & fees • ${provinceLabel[province] || province}`,
      },
      secondaryResults: [
        { id: 'buyerCosts', label: 'Taxes & fees on top', value: formatPKR(buyerCosts), type: 'currency' },
        { id: 'advanceTax', label: 'Advance tax s.236K (buyer)', value: isFiler ? formatPKR(advanceTax) : 'Not calculated — non-filer rate is value-banded', type: 'text' },
        { id: 'stampDuty', label: `Stamp duty (${stampPct}%)`, value: formatPKR(stamp), type: 'currency' },
      ],
      breakdown: [
        { label: 'Taxable base (highest of declared / FBR / DC rate)', amount: formatPKR(base) },
        { label: `Stamp duty (${stampPct}%)`, amount: formatPKR(stamp) },
        { label: `Registration / transfer fee (${regPct}%)`, amount: formatPKR(registration) },
        ...(cvt ? [{ label: `Capital value tax (${cvtPct}%)`, amount: formatPKR(cvt) }] : []),
        { label: 'Advance tax s.236K — filer 1.25% (TY2027)', amount: isFiler ? formatPKR(advanceTax) : 'Not included — confirm the value-banded non-filer rate with FBR' },
        { label: 'Total purchase cost', amount: formatPKR(allIn), isTotal: true },
      ],
      notes: [
        'Estimate, not tax advice. Confirm every rate with a tax professional before you transfer funds.',
        'Stamp duty is an editable input: Punjab was reported at 1% under a 2026 ordinance; other provinces differ. Registration and capital value tax also vary by province — enter your province’s current rates.',
        'Non-filer buyer advance tax (s.236K) is value-banded in TY2027 and is deliberately not guessed here.',
        'Paying through a Roshan Digital / non-resident account and holding NICOP/POC can affect your filer-rate treatment — keep the remittance trail for your tax record.',
      ],
    };
  }
  // Sell side
  const purchasePrice = safeNumber(inputs.purchasePrice, 0);
  const gain = Math.max(0, base - purchasePrice);
  const advanceTax236C = isFiler ? Math.round(base * 0.0275) : 0;
  const exemptionApplies = claimExemption && nicop && fundsRda;
  const cgt = exemptionApplies ? 0 : Math.round((gain * cgtRate) / 100);
  const annualRent = safeNumber(inputs.annualRent, 0);
  const annualPropertyTax = safeNumber(inputs.annualPropertyTax, 0);
  const maintenance = safeNumber(inputs.maintenanceAnnual, 0);
  const rentalYield = purchasePrice > 0 ? ((annualRent - annualPropertyTax - maintenance) / purchasePrice) * 100 : null;
  const sellerCosts = advanceTax236C + cgt;
  const netProceeds = base - sellerCosts;
  return {
    primaryResult: {
      id: 'propertyCost', label: 'Overseas seller — net proceeds after tax (estimate)',
      value: formatPKR(netProceeds), type: 'currency', highlight: true, color: 'success',
      subtext: `Sale value ${formatPKR(base)} − ${formatPKR(sellerCosts)} in taxes • ${provinceLabel[province] || province}`,
    },
    secondaryResults: [
      { id: 'capitalGain', label: 'Capital gain', value: formatPKR(gain), type: 'currency' },
      { id: 'cgt', label: exemptionApplies ? 'Capital gains tax (exemption claimed)' : `Capital gains tax (${cgtRate}%)`, value: exemptionApplies ? 'Rs. 0 — claimed, verify' : formatPKR(cgt), type: 'text' },
      { id: 'advanceTax', label: 'Advance tax s.236C (seller)', value: isFiler ? formatPKR(advanceTax236C) : 'Not calculated — confirm the non-filer rate', type: 'text' },
      ...(rentalYield !== null ? [{ id: 'rentalYield', label: 'Rental yield (net)', value: `${rentalYield.toFixed(2)}%`, type: 'text' as const }] : []),
    ],
    breakdown: [
      { label: 'Sale value (highest of declared / FBR / DC rate)', amount: formatPKR(base) },
      { label: 'Purchase price', amount: purchasePrice > 0 ? formatPKR(purchasePrice) : 'Not entered — gain cannot be checked' },
      { label: 'Capital gain', amount: formatPKR(gain) },
      { label: exemptionApplies ? 'Capital gains tax — exemption claimed (verify)' : `Capital gains tax (${cgtRate}% of gain)`, amount: exemptionApplies ? 'Rs. 0' : formatPKR(cgt) },
      ...(exemptionApplies ? [{ label: `CGT at your entered rate (${cgtRate}%) if the exemption does not apply`, amount: formatPKR(Math.round((gain * cgtRate) / 100)) }] : []),
      { label: 'Advance tax s.236C — filer 2.75%', amount: isFiler ? formatPKR(advanceTax236C) : 'Not included — confirm the non-filer rate' },
      { label: 'Net proceeds after tax', amount: formatPKR(netProceeds), isTotal: true },
    ],
    notes: [
      'Estimate, not tax advice. Confirm every rate with a tax professional before you sell.',
      exemptionApplies
        ? 'You ticked NICOP/POC + funds through a Roshan / non-resident account, so CGT is shown as Rs. 0 as a CLAIMED exemption. A 0% rate is possible but not automatic — it depends on NICOP/POC status, how the purchase was funded and the holding rules. Get it confirmed in writing before you rely on it.'
        : 'A 0% capital gains tax result is never shown unless you tick the overseas-exemption conditions (NICOP/POC held AND funds through a Roshan / non-resident account). Sources disagree on the exemption — treat it as a claim to verify, not a fact.',
      'Stamp duty on the sale, agent commission and any outstanding dues are not included — add them from your sale agreement.',
      ...(rentalYield !== null ? [`Net rental yield: ${rentalYield.toFixed(2)}% = (annual rent − property tax − maintenance) ÷ purchase price.`] : []),
    ],
  };
}
