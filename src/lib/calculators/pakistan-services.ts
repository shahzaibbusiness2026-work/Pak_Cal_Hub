import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';

const text = (value: string) => value;

/** Pakistan Passport Fee Calculator — DGIP verified table (dgip.gov.pk, checked 9 Oct 2026). */
export function calculatePassportFee(inputs: Record<string, any>): CalculatorOutput {
  const type = inputs.passportType || 'mrp';
  const pages = String(inputs.pages || '36');
  const validity = String(inputs.validity || '5');
  const service = inputs.service || 'normal';
  const lost = inputs.lostStatus || 'none';
  const mrp: Record<string, Record<string, number[]>> = {
    '36': { '5': [4500, 7500, 12500], '10': [6700, 11200, 16200] },
    '72': { '5': [8200, 13500, 18500], '10': [12400, 20200, 25200] },
    '100': { '5': [9000, 18000, 23000], '10': [13500, 27000, 32000] },
  };
  const epass: Record<string, Record<string, number[]>> = {
    '36': { '5': [9000, 15000], '10': [13500, 22500] },
    '72': { '5': [16500, 27000], '10': [24750, 40500] },
  };
  const serviceIndex = service === 'urgent' ? 1 : service === 'fast-track' ? 2 : 0;
  const delivery = service === 'fast-track' ? '2 working days (47 cities)' : service === 'urgent' ? '5 working days' : '21 working days';
  if (type === 'e-passport' && service === 'fast-track') {
    return {
      primaryResult: { id: 'passportFee', label: 'Fast Track e-Passport', value: 'Not available', type: 'text', highlight: true, color: 'warning', subtext: 'DGIP does not offer Fast Track for ordinary e-Passports — choose Urgent, or choose a Machine Readable Passport for Fast Track.' },
      secondaryResults: [{ id: 'delivery', label: 'Available delivery', value: 'Urgent: 5 working days', type: 'text' }],
      breakdown: [{ label: 'Selected combination', amount: `${pages} pages, ${validity} years, e-Passport, Fast Track` }, { label: 'Official position', amount: 'Not offered by DGIP', isTotal: true }],
      notes: ['Official source: Directorate General of Immigration & Passports (dgip.gov.pk), fees effective 07-03-2024; Fast Track effective 08-05-2024; checked 9 Oct 2026.', 'There is no official DGIP “Executive” fee tier and no 54/96-page ordinary passport. Executive Passport Offices may add a separate NADRA service charge that DGIP does not publish.'],
    };
  }
  const base = type === 'e-passport' ? epass[pages]?.[validity]?.[Math.min(serviceIndex, 1)] : mrp[pages]?.[validity]?.[serviceIndex];
  if (!base) {
    return {
      primaryResult: { id: 'passportFee', label: 'Passport combination', value: 'Not offered', type: 'text', highlight: true, color: 'warning', subtext: 'This page/validity combination is not in the official DGIP table.' },
      breakdown: [{ label: 'Selected combination', amount: `${pages} pages, ${validity} years`, isTotal: true }],
      notes: ['Official DGIP ordinary passports are 36, 72 or 100 pages. Minors under 15 cannot obtain 10-year validity.'],
    };
  }
  const multiplier = lost === 'first-lost' ? 2 : lost === 'second-lost' ? 4 : 1;
  const fee = base * multiplier;
  return {
    primaryResult: { id: 'passportFee', label: 'Official Passport Fee to Pay', value: formatPKR(fee), type: 'currency', highlight: true, color: 'success', subtext: `${type === 'e-passport' ? 'e-Passport' : 'Machine Readable Passport'} • ${pages} pages • ${validity} years • ${service}` },
    secondaryResults: [
      { id: 'baseFee', label: 'DGIP base fee', value: formatPKR(base), type: 'currency' },
      { id: 'delivery', label: 'Expected delivery', value: delivery, type: 'text' },
      { id: 'lostMultiplier', label: 'Lost-passport multiplier', value: multiplier === 1 ? 'None' : `${multiplier}×`, type: 'text' },
    ],
    breakdown: [
      { label: 'Passport type', amount: type === 'e-passport' ? 'Ordinary e-Passport' : 'Machine Readable Passport (MRP)' },
      { label: 'Pages / validity / service', amount: `${pages} pages / ${validity} years / ${service}` },
      { label: 'DGIP fee', amount: formatPKR(base) },
      ...(multiplier > 1 ? [{ label: lost === 'first-lost' ? 'First lost passport (double fee)' : 'Second lost passport (quadruple fee)', amount: `×${multiplier}` }] : []),
      { label: 'Total official fee', amount: formatPKR(fee), isTotal: true },
    ],
    notes: ['Official source: Directorate General of Immigration & Passports (dgip.gov.pk/passport/ordinary-passport.php), checked 9 Oct 2026. Fees payable via Passport Fee Asaan app/web portal or 1-Link banks.', 'Minors under 15 cannot get 10-year validity. Executive Passport Offices may add a separate NADRA service charge not published by DGIP, so your receipt can be higher than this DGIP fee.'],
  };
}

/** Punjab Driving Licence Fees — DLIMS 2.0 verified table (dlims.punjab.gov.pk, checked 9 Oct 2026). */
export function calculateDrivingLicenceFee(inputs: Record<string, any>): CalculatorOutput {
  const service = inputs.serviceType || 'new';
  const category = inputs.category || 'car';
  const years = Math.min(Math.max(safeNumber(inputs.years, 1), 1), 5);
  const includeTest = inputs.includeTest !== false;
  const latePeriod = inputs.latePeriod || 'none';
  const table: Record<string, { test: number; annual: number; late: number[] }> = {
    motorcycle: { test: 50, annual: 450, late: [0, 225, 450, 1125] },
    car: { test: 150, annual: 1350, late: [0, 675, 1350, 3375] },
    'motorcycle-car': { test: 200, annual: 1350, late: [0, 675, 1350, 3375] },
    rickshaw: { test: 100, annual: 400, late: [0, 0, 0, 0] },
    ltv: { test: 150, annual: 1850, late: [0, 925, 1850, 4625] },
  };
  const row = table[category] || table.car;
  const courier = 480;
  const lateIndex = latePeriod === '1-3-months' ? 1 : latePeriod === '3m-1y' ? 2 : latePeriod === 'over-1y' ? 3 : 0;
  const lateFine = service === 'renewal' ? row.late[lateIndex] : 0;
  const testFee = service === 'new' && includeTest ? row.test : 0;
  const licenceFee = row.annual * years;
  const total = licenceFee + courier + testFee + lateFine;
  const rickshawLateUnknown = category === 'rickshaw' && lateIndex > 0;
  return {
    primaryResult: { id: 'licenceFee', label: service === 'new' ? 'Estimated Punjab Licence Fee' : 'Estimated Punjab Renewal Fee', value: formatPKR(total), type: 'currency', highlight: true, color: 'success', subtext: `${category} • ${years} year${years > 1 ? 's' : ''} • courier included` },
    secondaryResults: [
      { id: 'licenceCharge', label: `Licence fee (${years} × ${formatPKR(row.annual)})`, value: formatPKR(licenceFee), type: 'currency' },
      { id: 'courier', label: 'Courier / delivery', value: formatPKR(courier), type: 'currency' },
      ...(testFee ? [{ id: 'testFee', label: 'Driving test fee', value: formatPKR(testFee), type: 'currency' as const }] : []),
      ...(lateFine ? [{ id: 'lateFine', label: 'Late renewal fine', value: formatPKR(lateFine), type: 'currency' as const, color: 'warning' as const }] : []),
    ],
    breakdown: [
      { label: 'Licence category / service', amount: `${category} / ${service}` },
      { label: `Licence fee for ${years} year(s)`, amount: formatPKR(licenceFee) },
      ...(testFee ? [{ label: 'Test fee', amount: formatPKR(testFee) }] : []),
      ...(lateFine ? [{ label: 'Late renewal fine', amount: formatPKR(lateFine) }] : []),
      { label: 'Courier', amount: formatPKR(courier) },
      { label: 'Estimated total', amount: formatPKR(total), isTotal: true },
    ],
    notes: ['Official source: DLIMS 2.0 Punjab fee structure (dlims.punjab.gov.pk/fee_structure), checked 9 Oct 2026. Confirm the final payable amount on the PSID generated by DLIMS/Dastak before paying.', 'For combined categories, DLIMS charges the highest category fee, not both fees added together.', ...(rickshawLateUnknown ? ['The verified DLIMS table supplied for this tool does not state a rickshaw late-renewal fine, so no late fine has been added for rickshaw — confirm it on the PSID.'] : []), 'Learner-permit fee is intentionally not quoted: older official pages and newer reports conflict, so check the learner PSID in DLIMS/Dastak. A learner may apply for the test after 42 days.'],
  };
}

const DISCO_PORTALS: Record<string, { name: string; url: string; input: string }> = {
  lesco: { name: 'LESCO', url: 'https://bill.pitc.com.pk/lescobill', input: '14-digit Reference No' },
  iesco: { name: 'IESCO', url: 'https://bill.pitc.com.pk/iescobill', input: '14-digit Reference No' },
  mepco: { name: 'MEPCO', url: 'https://bill.pitc.com.pk/mepcobill', input: '14-digit Reference No' },
  fesco: { name: 'FESCO', url: 'https://bill.pitc.com.pk/fescobill', input: '14-digit Reference No' },
  gepco: { name: 'GEPCO', url: 'https://bill.pitc.com.pk/gepcobill', input: '14-digit Reference No' },
  pesco: { name: 'PESCO', url: 'https://bill.pitc.com.pk/pescobill', input: '14-digit Reference No' },
  sepco: { name: 'SEPCO', url: 'https://bill.pitc.com.pk/sepcobill', input: '14-digit Reference No' },
  hesco: { name: 'HESCO', url: 'https://bill.pitc.com.pk/hescobill', input: '14-digit Reference No' },
  qesco: { name: 'QESCO', url: 'https://bill.pitc.com.pk/qescobill', input: '14-digit Reference No' },
  'k-electric': { name: 'K-Electric', url: 'https://ke.com.pk/ke-live/', input: '13-digit Account Number' },
};

/** Duplicate Electricity Bill Checker — guided official-portal checker; Pak Calc Hub never fetches or stores the bill. */
export function calculateDuplicateBillChecker(inputs: Record<string, any>): CalculatorOutput {
  const disco = DISCO_PORTALS[inputs.disco || 'lesco'] || DISCO_PORTALS.lesco;
  const raw = String(inputs.referenceNumber || '').replace(/\D/g, '');
  const expected = disco.name === 'K-Electric' ? 13 : 14;
  const valid = raw.length === expected;
  return {
    primaryResult: { id: 'billStatus', label: valid ? `Ready to check your ${disco.name} bill` : `Enter your ${expected}-digit ${disco.name === 'K-Electric' ? 'Account Number' : 'Reference Number'}`, value: valid ? 'Ready — open the official portal below' : `${raw.length}/${expected} digits entered`, type: 'text', highlight: true, color: valid ? 'success' : 'warning', subtext: valid ? disco.url : 'The number is printed on any previous bill. Digits only, no spaces.' },
    secondaryResults: [
      { id: 'portal', label: 'Official portal', value: disco.url, type: 'text' },
      { id: 'inputNeeded', label: 'You will enter', value: disco.input, type: 'text' },
      { id: 'privacy', label: 'Your bill data', value: 'Opens only on the official portal — Pak Calc Hub does not fetch or store bills', type: 'text' },
    ],
    breakdown: [
      { label: 'Step 1', amount: `Open ${disco.url}` },
      { label: 'Step 2', amount: `Enter your ${disco.input}${valid ? ` (${raw})` : ''} and complete any captcha` },
      { label: 'Step 3', amount: 'View, download or print the duplicate bill from the official portal', isTotal: true },
    ],
    notes: ['Government DISCO bills are hosted by PITC at bill.pitc.com.pk; K-Electric uses its own system and does not use PITC.', 'Use the 14-digit Reference Number exactly as printed on an old bill (or Customer ID where the portal offers it). For K-Electric, use the 13-digit Account Number at the top right of the bill.'],
  };
}

const VEHICLE_PORTALS: Record<string, { name: string; url: string; input: string; status: string; warning?: string }> = {
  punjab: { name: 'Punjab — MTMIS', url: 'https://mtmis.excise.punjab.gov.pk', input: 'Registration number', status: 'Official online verification available' },
  sindh: { name: 'Sindh Excise', url: 'http://www.excise.gos.pk/vehicle/vehicle_search', input: 'Registration number or owner CNIC', status: 'Official online verification portal', warning: 'Portal fields were not live-verified in our 9 Oct 2026 check; if the form does not load, use the Sindh Excise office/SMS service.' },
  ict: { name: 'Islamabad (ICT)', url: 'https://islamabadexcise.gov.pk', input: 'Registration number + registration date', status: 'Official online verification available' },
  kpk: { name: 'Khyber Pakhtunkhwa Excise', url: 'https://www.kpexcise.gov.pk/new/', input: 'District + registration number', status: 'Department site — online form reported unreliable', warning: 'The KP records form was reported broken in September 2026. Use the department site and, if the form fails, your district Excise office.' },
  balochistan: { name: 'Balochistan Excise', url: 'https://excise.balochistan.gov.pk/', input: 'Visit district Excise & Taxation Office', status: 'No working public online verification confirmed', warning: 'Balochistan lists smart-card verification as “under process”. Do not trust third-party verification sites for Balochistan plates; visit the district ETO.' },
};

/** Vehicle Verification Checker — official portals only; no ownership/CNIC data is fetched or shown. */
export function calculateVehicleVerification(inputs: Record<string, any>): CalculatorOutput {
  const province = VEHICLE_PORTALS[inputs.province || 'punjab'] || VEHICLE_PORTALS.punjab;
  const reg = String(inputs.registrationNumber || '').trim().toUpperCase();
  return {
    primaryResult: { id: 'vehiclePortal', label: province.name, value: province.status, type: 'text', highlight: true, color: province.warning ? 'warning' : 'success', subtext: province.url },
    secondaryResults: [
      { id: 'portal', label: 'Official portal', value: province.url, type: 'text' },
      { id: 'inputNeeded', label: 'You will enter', value: province.input, type: 'text' },
      ...(reg ? [{ id: 'reg', label: 'Registration entered here (not sent anywhere)', value: reg, type: 'text' as const }] : []),
    ],
    breakdown: [
      { label: 'Step 1', amount: `Open ${province.url}` },
      { label: 'Step 2', amount: `Enter ${province.input.toLowerCase()} on the official form${reg ? ` (${reg})` : ''}` },
      { label: 'Step 3', amount: 'Match engine/chassis, make, model and tax status shown there with the vehicle documents', isTotal: true },
    ],
    notes: ['Pak Calc Hub does not fetch, store or display vehicle ownership records — verification happens only on the provincial Excise portal.', 'Never pay a third-party site for a vehicle “owner CNIC” report; use the official Excise department channels above.', ...(province.warning ? [province.warning] : [])],
  };
}

/** Punjab Property Transfer Cost Calculator — PLRA/FBR verified ATL rates (checked 9 Oct 2026). */
export function calculatePropertyTransferCost(inputs: Record<string, any>): CalculatorOutput {
  const value = Math.max(safeNumber(inputs.propertyValue, 18000000), 0);
  const urban = (inputs.locationType || 'urban') !== 'rural';
  const filer = (inputs.filerStatus || 'filer') !== 'non-filer';
  const role = inputs.role || 'buyer';
  const stampRate = urban ? 0.02 : 0.01;
  const stampDuty = value * stampRate;
  const deedFee = value <= 500000 ? 500 : 1000;
  const buyer236kRate = filer ? 0.0125 : value <= 50000000 ? 0.105 : value <= 100000000 ? 0.145 : 0.185;
  const seller236cRate = filer ? 0.0275 : 0.115;
  const buyerTotal = stampDuty + deedFee + value * buyer236kRate;
  const sellerTotal = value * seller236cRate;
  const primary = role === 'seller' ? sellerTotal : role === 'both' ? buyerTotal + sellerTotal : buyerTotal;
  const primaryLabel = role === 'seller' ? 'Seller’s estimated transfer taxes (236C)' : role === 'both' ? 'Combined buyer + seller transfer taxes' : 'Buyer’s estimated transfer cost';
  return {
    primaryResult: { id: 'transferCost', label: primaryLabel, value: formatPKR(primary), type: 'currency', highlight: true, color: 'warning', subtext: `Punjab ${urban ? 'urban (2% stamp)' : 'rural/other (1% stamp)'} • ${filer ? 'Filer / ATL' : 'Non-filer'} • excludes system registration/mutation fee` },
    secondaryResults: [
      { id: 'buyerTotal', label: `Buyer total (stamp + deed fee + 236K ${(buyer236kRate * 100).toFixed(2)}%)`, value: formatPKR(buyerTotal), type: 'currency' },
      { id: 'sellerTotal', label: `Seller total (236C ${(seller236cRate * 100).toFixed(2)}%)`, value: formatPKR(sellerTotal), type: 'currency' },
      { id: 'stamp', label: `Stamp duty (${urban ? '2% urban' : '1% rural/other'})`, value: formatPKR(stampDuty), type: 'currency' },
    ],
    breakdown: [
      { label: 'Taxable value used (enter the higher of declared, DC and FBR value)', amount: formatPKR(value) },
      { label: `Buyer — Stamp duty (${urban ? '2% urban' : '1% rural/other'})`, amount: formatPKR(stampDuty) },
      { label: 'Buyer — Additional stamp on deed registration', amount: formatPKR(deedFee) },
      { label: `Buyer — FBR 236K advance tax (${(buyer236kRate * 100).toFixed(2)}%)`, amount: formatPKR(value * buyer236kRate) },
      { label: 'Buyer estimated total (registration/mutation system fee excluded)', amount: formatPKR(buyerTotal), isTotal: role !== 'seller' },
      { label: `Seller — FBR 236C advance tax (${(seller236cRate * 100).toFixed(2)}%)`, amount: formatPKR(sellerTotal), isTotal: role === 'seller' },
    ],
    notes: ['Punjab stamp duty: 2% urban / 1% other areas (Stamp (Amendment) Act 2026). Punjab CVT was abolished as a separate levy in 2017 and merged into stamp duty — do not add another 2% CVT.', 'FBR Finance Act 2026 (from 1 July 2026): 236K buyer 1.25% filer; non-filer buyer 10.5% up to Rs 50m, 14.5% Rs 50–100m, 18.5% above; 236C seller 2.75% filer / 11.5% non-filer. Late-filer TY2027 rates were not verified, so this tool offers filer and non-filer only.', 'PLRA e-Registration calculates the registration/mutation/service fee in its own system and it is not included above. Use the higher of declared, DC and FBR valuation as the taxable value; seller capital-gains tax (Section 37) is separate.'],
  };
}

/** PTA Mobile Tax — honest DIRBS checker. No unofficial rate table is presented as an FBR tax. */
export function calculatePtaMobileTax(inputs: Record<string, any>): CalculatorOutput {
  const route = inputs.registrationRoute || 'passport';
  const usd = Math.max(safeNumber(inputs.deviceValueUsd, 0), 0);
  return {
    primaryResult: { id: 'ptaTax', label: 'Your exact PTA/FBR mobile tax', value: 'Generated by DIRBS on your PSID', type: 'text', highlight: true, color: 'info', subtext: 'FBR — not PTA — sets and collects this tax. No website can quote it exactly without your IMEI in DIRBS.' },
    secondaryResults: [
      { id: 'official', label: 'Official DIRBS portal', value: 'https://dirbs.pta.gov.pk/drs', type: 'text' },
      { id: 'route', label: 'Registration route selected', value: route === 'passport' ? 'Passport (within 60 days of arrival)' : 'CNIC (local applicant)', type: 'text' },
      ...(usd > 0 ? [{ id: 'deviceValue', label: 'Device C&F value entered', value: `$${usd.toLocaleString()}`, type: 'text' as const }] : []),
    ],
    breakdown: [
      { label: 'Step 1', amount: 'Create your DIRBS account at dirbs.pta.gov.pk/drs and enter the IMEI(s)' },
      { label: 'Step 2', amount: route === 'passport' ? 'Choose Passport registration (only within 60 days of arrival in Pakistan)' : 'Choose CNIC registration and enter your CNIC details' },
      { label: 'Step 3', amount: 'DIRBS generates a PSID with the exact FBR duty/taxes — pay it within 7 days via bank/ATM/mobile wallet', isTotal: true },
    ],
    notes: ['Why no instant figure? The current official FBR rate SROs for 2026-27 could not be verified from fbr.gov.pk during our 9 Oct 2026 check, and older online tables (2021-22) are out of date. Publishing them as “2026 tax” would mislead you, so this checker sends you to the only exact source: your DIRBS PSID.', 'PTA directs travellers to FBR for rates and process; phones used beyond the allowed traveller period must be registered and taxed. Late registration can add a fine — register promptly.'],
  };
}

/** NADRA Fee Checker — official Pak-ID guide; unverified third-party fee tables are not quoted as official. */
export function calculateNadraFeeGuide(inputs: Record<string, any>): CalculatorOutput {
  const service = inputs.serviceType || 'cnic';
  const priority = inputs.priority || 'normal';
  const labels: Record<string, string> = { cnic: 'CNIC (standard)', 'smart-nic': 'Smart NIC (chip)', nicop: 'NICOP (overseas)', frc: 'Family Registration Certificate (FRC)' };
  return {
    primaryResult: { id: 'nadraFee', label: `${labels[service] || 'NADRA service'} — ${priority}`, value: 'Exact fee is generated in Pak-ID / at NADRA', type: 'text', highlight: true, color: 'info', subtext: 'NADRA calculates the fee for your exact application type (new, renewal, modification or duplicate) before payment.' },
    secondaryResults: [
      { id: 'official', label: 'Official NADRA fees page', value: 'https://www.nadra.gov.pk/feeStructure', type: 'text' },
      { id: 'apply', label: 'Apply / renew online', value: 'Pak-ID (pakid.nadra.gov.pk)', type: 'text' },
      { id: 'firstCnic', label: 'Good to know', value: service === 'cnic' ? 'A first-time standard CNIC at Normal priority is widely reported as free — confirm in Pak-ID for your application.' : 'Fees differ by document and priority; NICOP is charged in foreign currency by zone.', type: 'text' },
    ],
    breakdown: [
      { label: 'Step 1', amount: 'Open Pak-ID or visit a NADRA Registration Centre and choose the exact service' },
      { label: 'Step 2', amount: `Select ${labels[service] || 'your document'} and ${priority} priority` },
      { label: 'Step 3', amount: 'NADRA shows the exact payable fee before you pay — use that figure, not a third-party table', isTotal: true },
    ],
    notes: ['Why no instant fee table? NADRA’s official fee page could not be independently loaded during our 9 Oct 2026 verification, and third-party tables conflict on fees and processing days. Rather than quote an unverified fee, this checker routes you to NADRA/Pak-ID, where the exact fee for your application is generated.', 'CNIC, Smart NIC and NICOP are three different fee scales, and FRC is normally Executive-only — do not use one document’s fee for another.'],
  };
}

/** Salary Slip Generator — planning document, never proof of employment or income. */
export function calculateSalarySlip(inputs: Record<string, any>): CalculatorOutput {
  const basic = Math.max(safeNumber(inputs.basicSalary, 0), 0);
  const house = Math.max(safeNumber(inputs.houseRentAllowance, 0), 0);
  const conveyance = Math.max(safeNumber(inputs.conveyanceAllowance, 0), 0);
  const medical = Math.max(safeNumber(inputs.medicalAllowance, 0), 0);
  const otherAllowances = Math.max(safeNumber(inputs.otherAllowances, 0), 0);
  const bonus = Math.max(safeNumber(inputs.bonusOvertime, 0), 0);
  const gross = basic + house + conveyance + medical + otherAllowances + bonus;
  const tax = Math.max(safeNumber(inputs.incomeTax, 0), 0);
  const eobi = Math.max(safeNumber(inputs.eobi, 0), 0);
  const pf = Math.max(safeNumber(inputs.providentFund, 0), 0);
  const otherDeductions = Math.max(safeNumber(inputs.otherDeductions, 0), 0);
  const deductions = tax + eobi + pf + otherDeductions;
  const net = gross - deductions;
  const employee = String(inputs.employeeName || 'Employee');
  const company = String(inputs.companyName || 'Company');
  const month = String(inputs.payMonth || 'This month');
  const earningRows = [
    { label: 'Basic Salary', amount: formatPKR(basic), type: 'earning' as const },
    ...(house ? [{ label: 'House Rent Allowance', amount: formatPKR(house), type: 'earning' as const }] : []),
    ...(conveyance ? [{ label: 'Conveyance Allowance', amount: formatPKR(conveyance), type: 'earning' as const }] : []),
    ...(medical ? [{ label: 'Medical Allowance', amount: formatPKR(medical), type: 'earning' as const }] : []),
    ...(otherAllowances ? [{ label: 'Other Allowances', amount: formatPKR(otherAllowances), type: 'earning' as const }] : []),
    ...(bonus ? [{ label: 'Bonus / Overtime', amount: formatPKR(bonus), type: 'earning' as const }] : []),
  ];
  return {
    primaryResult: { id: 'netPay', label: `Net Pay — ${employee} (${month})`, value: formatPKR(net), type: 'currency', highlight: true, color: 'success', subtext: `${company} • Gross ${formatPKR(gross)} − deductions ${formatPKR(deductions)}` },
    secondaryResults: [
      { id: 'gross', label: 'Gross Monthly Pay', value: formatPKR(gross), type: 'currency' },
      { id: 'deductions', label: 'Total Deductions', value: formatPKR(deductions), type: 'currency', color: 'warning' },
      { id: 'annualNet', label: 'Annualised Net (×12, if unchanged)', value: formatPKR(net * 12), type: 'currency' },
    ],
    breakdown: [
      ...earningRows,
      { label: 'Gross Pay', amount: formatPKR(gross), isTotal: true },
      ...(tax ? [{ label: 'Income Tax Withheld', amount: formatPKR(tax), isDeduction: true }] : []),
      ...(eobi ? [{ label: 'EOBI (employee share)', amount: formatPKR(eobi), isDeduction: true }] : []),
      ...(pf ? [{ label: 'Provident Fund (employee share)', amount: formatPKR(pf), isDeduction: true }] : []),
      ...(otherDeductions ? [{ label: 'Other Deductions / Loan Recovery', amount: formatPKR(otherDeductions), isDeduction: true }] : []),
      { label: 'Net Pay (take-home)', amount: formatPKR(net), isTotal: true },
    ],
    notes: ['Sample salary slip for payroll planning and personal records only. It is generated from the figures you enter and is not proof of employment or income — banks and employers rely on employer-issued, signed/stamped slips and payroll records.', 'Use the Print / PDF button on this page to save the slip. Government employees: cross-check the components with the BPS Salary Calculator; private employees: confirm tax withholding with the FBR Income Tax Calculator.'],
  };
}

function exactAge(from: Date, to: Date): { years: number; months: number; days: number; totalYears: number } {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) { months -= 1; days += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  return { years, months, days, totalYears: years + months / 12 + days / 365 };
}

function parseDate(value: any, fallback: Date): Date {
  const d = new Date(String(value || ''));
  return Number.isNaN(d.getTime()) ? fallback : d;
}

/** CSS & Government Job Age Eligibility — FPSC/Establishment Division rules verified 9 Oct 2026. */
export function calculateCssAgeEligibility(inputs: Record<string, any>): CalculatorOutput {
  const mode = inputs.mode || 'css';
  const dob = parseDate(inputs.birthDate, new Date('1998-01-01'));
  if (mode === 'css') {
    const examYear = Math.round(safeNumber(inputs.cssExamYear, 2027));
    const cutoff = new Date(`${examYear - 1}-12-31T00:00:00`);
    const age = exactAge(dob, cutoff);
    const hasRelaxation = inputs.cssCategory === 'relaxation';
    const maxAge = hasRelaxation ? 32 : 30;
    const eligible = age.totalYears >= 21 && age.totalYears <= maxAge;
    return {
      primaryResult: { id: 'cssEligibility', label: `CSS ${examYear} eligibility`, value: eligible ? 'Eligible on age' : 'Not eligible on age', type: 'text', highlight: true, color: eligible ? 'success' : 'error', subtext: `Age on 31 Dec ${examYear - 1}: ${age.years} years, ${age.months} months, ${age.days} days • Limit 21–${maxAge}` },
      secondaryResults: [
        { id: 'age', label: `Age at cutoff (31 Dec ${examYear - 1})`, value: `${age.years}y ${age.months}m ${age.days}d`, type: 'text' },
        { id: 'limit', label: 'CSS upper age limit for you', value: `${maxAge} years`, type: 'text' },
        { id: 'cutoff', label: 'Cutoff rule', value: '31 December of the year before the exam', type: 'text' },
      ],
      breakdown: [
        { label: 'Exam year', amount: String(examYear) },
        { label: 'Age counted on', amount: `31 December ${examYear - 1}` },
        { label: 'Your age then', amount: `${age.years} years, ${age.months} months, ${age.days} days` },
        { label: `Rule: 21–30 years${hasRelaxation ? ' + 2 years listed-category relaxation (ceiling 32)' : ''}`, amount: eligible ? 'Within limit' : 'Outside limit', isTotal: true },
      ],
      notes: ['CSS Competitive Examination Rules 2019: age 21–30 on 31 December of the year before the exam — not the application closing date. This is the most common CSS age mistake.', 'The +2-year relaxation (hard ceiling 32) is only for listed categories (scheduled caste/Buddhist community, recognised tribes of specified areas, permanent residents of AJK/Gilgit-Baltistan, disabled candidates, and government servants with at least 2 years’ continuous service with departmental permission) with the required certificate. The federal +5-year general relaxation does NOT apply to CSS.'],
    };
  }
  const closing = parseDate(inputs.closingDate, new Date());
  const baseMax = Math.max(safeNumber(inputs.baseMaxAge, 30), 0);
  const category = inputs.federalCategory || 'none';
  const yearsServed = Math.max(safeNumber(inputs.armedForcesYears, 0), 0);
  let categoryRelaxation = 0;
  let categoryLabel = 'None';
  if (category === 'scheduled-ajk') { categoryRelaxation = 3; categoryLabel = 'Scheduled caste / Buddhist / recognised tribe / AJK / Northern Areas: +3'; }
  if (category === 'sindh-balochistan-low') { categoryRelaxation = 3; categoryLabel = 'Sindh (Rural) / Balochistan, BPS-15 and below: +3'; }
  if (category === 'armed-forces') { categoryRelaxation = Math.min(15, yearsServed); categoryLabel = `Released/retired Armed Forces: +${categoryRelaxation} (15 or years served, whichever is less)`; }
  if (category === 'govt-servant') { categoryRelaxation = 10; categoryLabel = 'Government servant with 2+ years’ service: +10 (up to age 55)'; }
  if (category === 'disabled-low') { categoryRelaxation = 10; categoryLabel = 'Disabled candidate, BPS-15 and below: +10'; }
  if (category === 'deceased-servant-family') { categoryRelaxation = 5; categoryLabel = 'Widow/son/daughter of civil servant who died in service: +5'; }
  let maxAge = baseMax + 5 + categoryRelaxation;
  if (category === 'govt-servant') maxAge = Math.min(maxAge, 55);
  const age = exactAge(dob, closing);
  const eligible = age.totalYears <= maxAge;
  return {
    primaryResult: { id: 'federalEligibility', label: 'Federal job age eligibility', value: eligible ? 'Eligible on age' : 'Over the age limit', type: 'text', highlight: true, color: eligible ? 'success' : 'error', subtext: `Age at closing date: ${age.years}y ${age.months}m ${age.days}d • Your maximum: ${maxAge} years` },
    secondaryResults: [
      { id: 'age', label: 'Age at closing date', value: `${age.years}y ${age.months}m ${age.days}d`, type: 'text' },
      { id: 'max', label: 'Maximum age for you', value: `${maxAge} years`, type: 'text' },
      { id: 'formula', label: 'Formula', value: `${baseMax} + 5 general${categoryRelaxation ? ` + ${categoryRelaxation} category` : ''}`, type: 'text' },
    ],
    breakdown: [
      { label: 'Advertised maximum age you entered', amount: `${baseMax} years` },
      { label: 'General relaxation (all candidates)', amount: '+5 years' },
      { label: categoryLabel, amount: categoryRelaxation ? `+${categoryRelaxation} years` : 'No category relaxation' },
      { label: 'Your maximum age at the closing date', amount: `${maxAge} years`, isTotal: true },
    ],
    notes: ['Initial Appointment to Civil Posts (Relaxation of Upper Age Limit) Rules 1993: every federal candidate gets +5 years general relaxation, plus at most ONE category relaxation. Age is counted on the advertisement’s closing date.', 'Many FPSC advertisements already print the maximum as “base + five (5) years general relaxation” — if your ad already includes the +5, do not add it twice: enter the pre-relaxation base maximum from the post’s rules, or subtract 5 from the printed maximum. Category relaxations need the prescribed certificate/departmental permission.'],
  };
}

/** Pakistan IBAN Checker — SWIFT IBAN Registry Release 102 structure + MOD-97 (ISO 13616). */
export function calculatePakistanIban(inputs: Record<string, any>): CalculatorOutput {
  const raw = String(inputs.iban || '').toUpperCase().replace(/\s+/g, '');
  const rearranged = raw.length >= 4 ? raw.slice(4) + raw.slice(0, 4) : raw;
  let remainder = 0;
  let modValid = false;
  if (/^[A-Z0-9]+$/.test(rearranged) && rearranged.length > 0) {
    let numeric = '';
    for (const ch of rearranged) numeric += /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    // Process in chunks to avoid huge-number precision loss
    let rem = 0;
    for (let i = 0; i < numeric.length; i += 7) {
      rem = Number(String(rem) + numeric.slice(i, i + 7)) % 97;
    }
    remainder = rem;
    modValid = rem === 1;
  }
  const patternValid = /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(raw);
  const valid = patternValid && modValid;
  const bankCode = raw.length >= 8 ? raw.slice(4, 8) : '—';
  const accountPart = raw.length > 8 ? raw.slice(8) : '—';
  const reason = !raw ? 'Enter an IBAN to check it.' : raw.length !== 24 ? `Pakistan IBANs are exactly 24 characters — yours has ${raw.length}.` : !patternValid ? 'Format must be PK + 2 check digits + 4-letter bank code + 16-character account portion.' : !modValid ? 'Check digits fail the MOD-97 test — a character is mistyped.' : 'Structure and MOD-97 check digits both pass.';
  return {
    primaryResult: { id: 'ibanValid', label: 'Pakistan IBAN check', value: valid ? 'Valid Pakistan IBAN' : 'Not a valid Pakistan IBAN', type: 'text', highlight: true, color: valid ? 'success' : 'error', subtext: reason },
    secondaryResults: [
      { id: 'bankCode', label: 'Bank code (characters 5–8)', value: bankCode, type: 'text' },
      { id: 'checkDigits', label: 'Check digits (characters 3–4)', value: raw.length >= 4 ? raw.slice(2, 4) : '—', type: 'text' },
      { id: 'length', label: 'Length', value: `${raw.length} / 24 characters`, type: 'text' },
    ],
    breakdown: [
      { label: 'Country', amount: 'PK — Pakistan' },
      { label: 'Bank code (as printed in the IBAN)', amount: bankCode },
      { label: 'Account portion (characters 9–24)', amount: accountPart },
      { label: 'MOD-97 check (ISO 13616)', amount: patternValid ? (modValid ? 'Pass (remainder 1)' : `Fail (remainder ${remainder})`) : 'Not run — fix the format first', isTotal: true },
    ],
    notes: ['Structure verified from the SWIFT IBAN Registry (Release 102, June 2026): PK + 2 check digits + 4-letter bank code + 16-character account portion = 24 characters. A valid result means the IBAN is well-formed and its check digits match — it does not prove the account exists or belongs to a particular person.', 'No official State Bank list of 4-letter bank codes was verified for this tool, so it shows your bank code exactly as printed instead of guessing a bank name. Confirm the bank name inside your own banking app before sending money.', 'Never share your full IBAN, account number or CNIC publicly.'],
  };
}
