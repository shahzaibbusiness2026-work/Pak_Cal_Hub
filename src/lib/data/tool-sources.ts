/**
 * OFFICIAL SOURCE REGISTRY — every calculator tool mapped to its authoritative source(s).
 *
 * Why this file exists: every tool on Pak Calc Hub must show the user WHERE its
 * rates and rules come from, and WHEN they were last verified. The <DataSource>
 * component renders from this registry by tool id — no hardcoded source claims
 * on pages.
 *
 * URL policy: only URLs verified by loading them are listed. Where an authority
 * has no verifiable public URL, the entry carries the name with no `url`
 * (and typically a 'verify' status) rather than an invented link.
 *
 * Verification status:
 *   'verified' — source URL loaded and the cited rates/rules corroborated.
 *   'verify'   — provisional: needs re-check against the latest official
 *                notification before the numbers are treated as settled.
 */

export type SourceVerificationStatus = 'verified' | 'verify';

export interface ToolSourceLink {
  /** Official authority name, e.g. 'National Electric Power Regulatory Authority (NEPRA)' */
  name: string;
  /** Verified homepage URL only — omitted when no public URL could be verified. */
  url?: string;
  /** What this authority governs for this tool. */
  description?: string;
  /** Official notification / SRO / Act reference — only when verified. */
  notificationRef?: string;
  /** 'verify' flags a notification reference or schedule that is not yet corroborated. */
  notificationStatus?: SourceVerificationStatus;
  /** Human-readable effective date, e.g. '1st January 2026'. */
  effectiveDate?: string;
}

export interface ToolSourceEntry {
  toolId: string;
  sources: ToolSourceLink[];
  /** YYYY-MM-DD — when the rates/rules behind this tool were last verified. */
  ratesVerifiedOn: string;
  /** 'verify' renders a provisional badge instead of the verified badge. */
  ratesStatus: SourceVerificationStatus;
  /** Rate/dataset keys this tool depends on (informational). */
  rateKeys: string[];
  /** Optional user-facing note, e.g. where no government source applies. */
  note?: string;
}

/** Verified authority homepages — every URL below was loaded successfully. */
const A = {
  nepra: {
    name: 'National Electric Power Regulatory Authority (NEPRA)',
    url: 'https://nepra.org.pk',
  },
  fbr: {
    name: 'Federal Board of Revenue (FBR)',
    url: 'https://fbr.gov.pk',
  },
  ogra: {
    name: 'Oil & Gas Regulatory Authority (OGRA)',
    url: 'https://ogra.org.pk',
  },
  sbp: {
    name: 'State Bank of Pakistan (SBP)',
    url: 'https://www.sbp.org.pk',
  },
  financeDiv: {
    name: 'Finance Division, Government of Pakistan',
    url: 'https://finance.gov.pk',
  },
  pmdc: {
    name: 'Pakistan Medical & Dental Council (PM&DC)',
    url: 'https://www.pmdc.pk',
  },
  hec: {
    name: 'Higher Education Commission (HEC)',
    url: 'https://hec.gov.pk',
  },
  fdPunjab: {
    name: 'Finance Department, Government of the Punjab',
    url: 'https://finance.punjab.gov.pk',
  },
  /** No verifiable public homepage — name only, never an invented URL. */
  fdSindh: { name: 'Finance Department, Government of Sindh' },
  fdKpk: { name: 'Finance Department, Government of Khyber Pakhtunkhwa' },
  fdBalochistan: { name: 'Finance Department, Government of Balochistan' },
  /** Association site unreachable — name only. */
  sarafa: { name: 'All Pakistan Sarafa Gems & Jewellers Association' },
};

const V = '2026-10-04'; // default verification date for entries verified in the Oct 2026 review pass

const ENTRIES: ToolSourceEntry[] = [
  {
    toolId: 'remittance-calculator', ratesVerifiedOn: '2026-11-11', ratesStatus: 'verify',
    sources: [
      { name: 'World Bank Remittance Prices Worldwide methodology', url: 'https://remittanceprices.worldbank.org/methodology', description: 'Distinguish transfer fees from the exchange-rate margin when comparing remittance cost.' },
      { name: 'ExchangeRate-API', url: 'https://www.exchangerate-api.com/docs/free', description: 'Daily indicative currency-conversion references; not transfer-provider quotes or fee schedules.' },
      { name: 'Unicode CLDR', url: 'https://github.com/unicode-org/cldr-json', description: 'Country/territory names, currency suggestions and currency display precision. Data reviewed 11 November 2026.' },
    ],
    rateKeys: [],
    note: '257 country/territory choices and 153 currencies. Reference coverage depends on the upstream pair; unsupported pairs require a provider quote. Currency choices do not establish corridor availability, legal eligibility or provider pricing. Fees are entered by the user.',
  },
  // ── 1. Government salary & service ──────────────────────────────────────────
  {
    toolId: 'bps-salary-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Revised Basic Pay Scales, ad-hoc relief allowances, HRA & conveyance schedules',
        notificationRef: 'RBPS-2022 (Finance Division OM dated 01-07-2022)',
        notificationStatus: 'verified',
        effectiveDate: '1st July 2022',
      },
      { ...A.fdPunjab, description: 'Punjab provincial allowances (Special Allowance / DRA)' },
      { ...A.fdSindh, description: 'Sindh differential allowance', notificationStatus: 'verify' },
      { ...A.fdKpk, description: 'KPK executive allowance', notificationStatus: 'verify' },
      { ...A.fdBalochistan, description: 'Balochistan hardship allowance', notificationStatus: 'verify' },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['rbps-2022', 'rbps-2026', 'adhoc-relief-2022-2026', 'hra-frozen-schedule', 'dra-2026', 'gp-fund-slabs', 'benevolent-fund', 'group-insurance'],
    note: 'Payroll estimate. Federal RBPS-2026 basic pay and selected notifications have been checked; frozen allowances require individual payroll amounts. Income tax is annualised or entered. Provincial/historical deductions and special allowances remain provisional. See the 11 November government accuracy review.',
  },
  {
    toolId: 'basic-pay-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Revised Basic Pay Scales (running basic pay & annual increments)',
        notificationRef: 'RBPS-2022 (Finance Division OM dated 01-07-2022)',
        notificationStatus: 'verified',
        effectiveDate: '1st July 2022',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['rbps-2022', 'rbps-2026-provisional'],
    note: 'RBPS-2022 verified. 2026-27 scale figures are provisional.',
  },
  {
    toolId: 'pension-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Civil pension rules, commutation (Appendix I), minimum pension, 2024 pension reforms',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['pension-gross-formula', 'commutation-appendix-I', 'minimum-pension', 'post-2024-dc-scheme', 'pension-24mo-average'],
    note: 'Commutation factors per the official Appendix I table; 35% max, 12,000 minimum pension and 25%/20% pensioner medical verified. Post-Jan-2025 retirements use 24-month average emoluments (OM F.No.9(3)R-6/2024-403). Family-pension 10-year rule details: verification in progress.',
  },
  {
    toolId: 'family-pension-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Family pension rules (75% entitlement, 10-year federal cap)',
        notificationStatus: 'verify',
      },
      {
        ...A.fdPunjab,
        description: 'Punjab lifetime family-pension restoration for widows (July 2026)',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['family-pension-75pct', 'punjab-lifetime-restoration'],
  },
  {
    toolId: 'leave-encashment-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Leave encashment under the Revised Leave Rules 1980 (up to 365 days)',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['leave-encashment-365-days'],
  },
  {
    toolId: 'promotion-pay-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Pay fixation on promotion under Fundamental Rule FR-22(a)(i)',
        notificationRef: 'FR-22(a)(i)',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['rbps-2022', 'fr-22a-i'],
  },
  {
    toolId: 'gp-fund-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'GP Fund mark-up rates (FY2024-25: 12.46% p.a.)',
        notificationRef: 'Finance Division Resolution F.2(1)-Reg.7/2014',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['gpf-markup-2024-25', 'gpf-markup-2025-26'],
    note: 'FY2024-25 rate 12.46% and FY2025-26 rate 12.05% per Finance Division resolutions. The 2026-27 projection rate is provisional.',
  },
  {
    toolId: 'increment-arrears-calculator',
    sources: [
      {
        ...A.financeDiv,
        description: 'Annual increment arrears on running basic pay',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['rbps-increments'],
  },

  // ── 2. Tax ──────────────────────────────────────────────────────────────────
  {
    toolId: 'income-tax-calculator',
    sources: [
      {
        ...A.fbr,
        description: 'Income tax slabs — Finance Act 2026 (TY2027), Finance Act 2025 (TY2026), Finance Act 2024 (TY2025)',
        notificationRef: 'Finance Act 2026 / Finance Act 2025',
        notificationStatus: 'verified',
        effectiveDate: '1st July 2026 (TY2027)',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: ['fbr-salaried-slabs-ty2027', 'fbr-salaried-slabs-ty2026', 'fbr-nonsalaried-slabs', 'surcharge-4ab'],
  },
  {
    toolId: 'freelancer-tax-calculator',
    sources: [
      {
        ...A.fbr,
        description: 'Section 154A — 0.25% final tax for PSEB-registered IT exporters',
        notificationRef: 'Section 154A, Income Tax Ordinance 2001',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['154a-pseb-0.25pct', '154a-general-1pct'],
    note: 'PSEB 0.25% rate verified. Non-PSEB IT-export rate applied as 1% — verify against the latest FBR WHT rate card.',
  },
  {
    toolId: 'property-tax-calculator',
    sources: [
      {
        ...A.fbr,
        description: 'Advance tax on property transactions — Sections 236C (seller) & 236K (buyer)',
        notificationRef: 'Sections 236C / 236K, Income Tax Ordinance 2001',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['236c-seller', '236k-buyer'],
    note: 'Filer/non-filer rates per tax year from the FBR dataset. Stamp duty and TMA rates vary by province — verify locally.',
  },

  // ── 3. Electricity & energy ─────────────────────────────────────────────────
  {
    toolId: 'electricity-bill-calculator',
    sources: [
      {
        ...A.nepra,
        description: 'Uniform domestic Schedule of Tariff (lifeline / protected / unprotected slabs)',
        effectiveDate: '1st January 2026',
        notificationStatus: 'verify',
      },
      {
        ...A.nepra,
        description: 'Financing Cost (FC) debt surcharge Rs. 3.23/unit',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: ['nepra-sot-2026', 'fc-surcharge-3.23', 'electricity-duty-1.5pct', 'gst-18pct', 'ptv-fee-35', 'fixed-charge-per-kw'],
    note: 'Slab rates per the NEPRA uniform domestic SOT effective 1 Jan 2026 (fixed charges per kW of sanctioned load since Feb 2026). FPA and QTA vary monthly/quarterly — enter the figures from your bill.',
  },
  {
    toolId: 'solar-system-calculator',
    sources: [
      {
        ...A.nepra,
        description: 'Net-metering / prosumer compensation framework (NEPRA Prosumer Regulations 2026)',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['solar-buyback-rate', 'net-billing-2026'],
    note: 'Export buyback rate and metering regime per NEPRA prosumer regulations — verify the current buyback rate before investing.',
  },
  {
    toolId: 'appliance-electricity-cost-calculator',
    sources: [
      {
        ...A.nepra,
        description: 'Reference domestic tariff per unit',
        effectiveDate: '1st January 2026',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: ['nepra-sot-2026'],
  },
  {
    toolId: 'ev-charging-cost-calculator',
    sources: [
      {
        ...A.nepra,
        description: 'Domestic tariff reference for EV charging cost',
        effectiveDate: '1st January 2026',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: ['nepra-sot-2026'],
  },

  // ── 4. Fuel & vehicles ──────────────────────────────────────────────────────
  {
    toolId: 'fuel-cost-calculator',
    sources: [
      {
        ...A.ogra,
        description: 'Petrol & diesel ex-depot prices — Petroleum Division notification (official authority)',
        effectiveDate: '3rd October 2026',
      },
      {
        name: 'autoones.com Fuel Prices API',
        url: 'https://autoones.com/fuel-prices-api',
        description:
          'Free aggregator that republishes OGRA-notified prices nightly — this is what the app polls automatically, not OGRA itself',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: '2026-10-03',
    ratesStatus: 'verified',
    rateKeys: ['petrol-live', 'diesel-live'],
    note: 'Fuel rates now update automatically every day via the autoones.com API (which republishes OGRA-notified prices). Shown with a "Live rate" badge in the calculator; if the feed fails, the last verified rate is kept.',
  },
  {
    toolId: 'token-tax-calculator',
    sources: [
      {
        ...A.fbr,
        description: 'Withholding tax on vehicles — Section 231B (value-based)',
        notificationRef: 'Section 231B, Income Tax Ordinance 2001',
        notificationStatus: 'verify',
      },
      {
        name: 'Provincial Excise & Taxation Departments',
        description: 'Motor vehicle token tax schedules (Punjab / ICT / Sindh / KPK)',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['token-tax-provincial', '231b-wht'],
    note: 'Token-tax schedules differ by province and change with provincial finance bills — verify against your Excise & Taxation Department schedule.',
  },
  {
    toolId: 'car-depreciation-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Pure arithmetic (declining-balance depreciation) — no official rates involved.',
  },

  // ── 5. Gold, silver, currency, loans ────────────────────────────────────────
  {
    toolId: 'gold-price-calculator',
    sources: [
      {
        ...A.sarafa,
        description: 'Daily 24K gold & silver bullion benchmarks (Karachi sarafa market) — official authority; publishes to the press, no machine feed',
      },
      {
        name: 'Live derived rate (indicative)',
        description:
          'Auto-updated from international XAU/XAG spot × USD/PKR (PKR/tola = spot × FX × 0.375 × 1.02 premium). Tracks the market but is NOT the official APGJSA announcement — confirm the sarafa rate before trading.',
        notificationStatus: 'verified',
      },
    ],
    ratesVerifiedOn: '2026-10-02',
    ratesStatus: 'verified',
    rateKeys: ['gold-24k-tola-live-derived', 'silver-tola-live-derived'],
    note: 'Gold/silver rates now refresh automatically from international spot prices (indicative). The official APGJSA sarafa announcement may differ slightly — confirm before trading.',
  },
  {
    toolId: 'zakat-calculator',
    sources: [
      {
        ...A.sarafa,
        description: 'Gold & silver rates for Nisab valuation',
      },
    ],
    ratesVerifiedOn: '2026-10-02',
    ratesStatus: 'verified',
    rateKeys: ['gold-24k-tola-live-derived', 'silver-tola-live-derived', 'zakat-nisab-7.5-tola', 'zakat-nisab-52.5-tola'],
    note: 'Zakat 2.5% on net zakatable wealth; Nisab = 7.5 tola gold or 52.5 tola silver, valued at the current (auto-updated, indicative) bullion rates.',
  },
  {
    toolId: 'islamic-inheritance-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Faraid distribution per Islamic jurisprudence (Quran & Sunnah) — consult a qualified scholar for complex cases.',
  },
  {
    toolId: 'pkr-currency-converter',
    sources: [
      {
        ...A.sbp,
        description: 'Interbank closing / M2M revaluation rates',
      },
    ],
    ratesVerifiedOn: '2026-10-01',
    ratesStatus: 'verified',
    rateKeys: ['usd-pkr-276.7040', 'sbp-interbank'],
    note: 'USD/PKR 276.7040 (SBP M2M revaluation rate, 1 Oct 2026). Open-market rates differ from interbank — confirm with your bank or forex dealer.',
  },
  {
    toolId: 'tenant-bill-splitter',
    sources: [
      { name: 'Average-rate apportionment of the actual bill', url: 'https://www.nepra.org.pk', description: 'Bill amount divided by main-meter units, applied per portion; shared units split equally' },
    ],
    ratesStatus: 'verified',
    ratesVerifiedOn: '2026-10-09',
    rateKeys: [],
    note: 'Uses your real bill total, so taxes and fixed charges are already inside the per-unit rate.',
  },
  {
    toolId: 'prize-bond-draw-checker',
    sources: [
      { name: 'National Savings (CDNS) — prize bond draw calendar & official results', url: 'https://savings.gov.pk', description: 'Draw months follow the recurring quarterly pattern; winning numbers are valid only in the official gazette' },
    ],
    ratesStatus: 'verify',
    ratesVerifiedOn: '2026-10-09',
    rateKeys: [],
    note: 'This page never publishes winning numbers — always verify in the official National Savings result.',
  },
];

// Formula-only tools do not have official market rates. Say so explicitly.
const formulaTools: Record<string, string> = {
  'salary-slip-generator': 'Sample payroll statement from entered earnings and deductions; not proof of employment.',
  'property-area-converter': 'Unit conversion using the selected marla standard; society and revenue-record conventions differ.',
  'gpa-calculator': 'Credit-weighted GPA from entered courses; percentage and letter-grade mappings are illustrative and institution-specific.',
  'percentage-calculator': 'Percentage arithmetic from entered values; no statutory rates.',
  'profit-margin-calculator': 'Margin = profit / revenue; markup = profit / cost. No official rates.',
  'break-even-calculator': 'Fixed costs / unit contribution, rounded up. Break-even is unavailable when contribution is non-positive.',
  'freelancer-hourly-rate-calculator': 'Planning quote from income target, billable hours, expenses, buffer and commission assumptions.',
  'compound-interest-calculator': 'Illustrative compound growth from the entered return; returns are not guaranteed.',
  'inflation-calculator': 'Planning scenario using the entered inflation assumption, not a live PBS inflation forecast.',
  'age-calculator': 'Calendar date arithmetic; month-end anniversaries clamp to the last day of the month.',
  'hijri-date-converter': 'Computed calendar conversion; locally observed lunar dates can differ.',
};
for (const [toolId, note] of Object.entries(formulaTools)) {
  ENTRIES.push({ toolId, sources: [], ratesVerifiedOn: '2026-11-05', ratesStatus: 'verified', rateKeys: [], note });
}
for (const toolId of ['construction-cost-calculator', 'cement-calculator', 'bricks-calculator', 'steel-rebar-calculator', 'tiles-calculator']) {
  ENTRIES.push({ toolId, sources: [], ratesVerifiedOn: '2026-11-05', ratesStatus: 'verify', rateKeys: [], note: 'Material quantities, labour and prices are planning assumptions. Obtain local quotations and an engineer-approved bill of quantities.' });
}
const additionalSources: Array<[string, ToolSourceLink, string]> = [
  ['mdcat-aggregate-calculator', { ...A.pmdc, url: 'https://pmdc.pk/Home/FAQs' }, '50% MDCAT + 40% HSSC + 10% SSC; 2026 MDCAT has 180 marks. Passing and admission eligibility are separate.'],
  ['university-merit-calculator', { ...A.hec }, 'Verify the program-specific prospectus and qualification basis.'],
  ['loan-emi-calculator', { ...A.sbp }, 'Reducing-balance illustration using the entered bank rate; fees, floating-rate resets and contract terms can differ.'],
  ['loan-affordability-calculator', { ...A.sbp }, 'Debt-burden estimate; the lender decides eligibility, approved tenor and pricing.'],
  ['passport-fee-calculator', { name: 'Directorate General of Immigration & Passports', url: 'https://dgip.gov.pk/passport/ordinary-passport.php/1000' }, 'Published MRP and e-passport fee schedules; additional office services and lost-passport charges can apply.'],
  ['driving-licence-fee-calculator', { name: 'Punjab DLIMS official fee structure', url: 'https://dlims.punjab.gov.pk/fee_structure' }, 'Punjab only. Confirm category, renewal fine and receipt in DLIMS.'],
  ['pta-mobile-tax-calculator', { name: 'PTA DIRBS / FBR' }, 'The official PSID determines exact device tax; no unverified fixed mobile-tax table is quoted.'],
  ['nadra-fee-calculator', { name: 'NADRA / Pak-ID' }, 'Get the current fee in the official application flow for the selected document and service.'],
  ['duplicate-electricity-bill-checker', { name: 'PITC and the selected electricity supplier' }, 'Reference validation and directions to the official provider portal; this tool does not retrieve private bill records.'],
  ['vehicle-verification-checker', { name: 'Provincial Excise & Taxation / official MTMIS portals' }, 'Verification guidance; the official province portal determines the record.'],
  ['property-transfer-cost-calculator', { name: 'Punjab Board of Revenue and FBR' }, 'Punjab transfer estimate; valuation, stamp duty, deed type, location and filer status affect charges.'],
  ['css-age-eligibility-calculator', { name: 'Federal Public Service Commission' }, 'Verify the examination year, cutoff date and documentary relaxation requirements with FPSC.'],
  ['pakistan-iban-checker', { name: 'SWIFT IBAN Registry / ISO 13616' }, 'Checks Pakistan IBAN format and MOD-97 checksum; does not establish account ownership or existence.'],
];
for (const [toolId, source, note] of additionalSources) {
  ENTRIES.push({ toolId, sources: [source], ratesVerifiedOn: '2026-11-05', ratesStatus: 'verify', rateKeys: [], note });
}

const reviewedSources: Record<string, Partial<ToolSourceEntry>> = {
  'fuel-cost-calculator': {
    ratesVerifiedOn: '2026-11-05',
    sources: [{ name: 'Pakistan State Oil published fuel prices', url: 'https://www.psopk.com/en/fuels/fuel-prices', effectiveDate: '5 November 2026', description: 'Petrol Rs 362/L; diesel Rs 387.81/L. Live aggregator quotes are indicative.' }],
  },
  'pension-calculator': {
    ratesVerifiedOn: '2026-11-05',
    sources: [{ ...A.financeDiv, url: 'https://finance.gov.pk/publications/compenduim_of_pension_rules_2018.pdf', description: '2001 commutation table, page 116: age next birthday 60 = 12.3719; 61 = 11.8632.' }],
    note: 'The age input is completed age at retirement; the factor uses age at next birthday. Other pension entitlements depend on the scheme and applicable notifications.',
  },
  'electricity-bill-calculator': {
    ratesVerifiedOn: '2026-11-05',
    sources: [{ name: 'IESCO official tariff guide', url: 'https://www.iesco.com.pk/tariff-guide', notificationRef: 'S.R.O. 279(I)/2026', description: 'Residential schedule: only protected consumers receive previous-slab benefit; fixed charges use sanctioned load.' }],
    note: 'FPA/QTA can be credits or charges. Enter the signed values from the bill. This estimator models non-TOU residential consumption; account-specific taxes and exemptions can differ.',
  },
  'solar-system-calculator': {
    ratesVerifiedOn: '2026-11-05',
    note: 'CY2026 NAEPP reference is Rs 8.13/kWh (NEPRA purchase-price forecast decision, 7 January 2026). Edit the export credit to match the current determination or executed agreement. Installed costs and solar yield are planning assumptions.',
  },
  'university-merit-calculator': {
    ratesVerifiedOn: '2026-11-05',
    ratesStatus: 'verify',
    sources: [{ name: 'UET Fall 2026 prospectus and admissions portal', url: 'https://admission.uet.edu.pk/downloads/', description: 'ECAT-based merit: 33% test plus 67% applicable academic marks.' }, { name: 'Punjab University 2026 admission test announcement', url: 'https://pu.edu.pk/home/section/allpress/17205', description: '25% admission-test weight. Academic merit varies by department.' }],
    note: 'University/program and qualification rules vary. Verify the current prospectus before using an aggregate to decide eligibility.',
  },
};
Object.assign(reviewedSources['pension-calculator'], {
  ratesStatus: 'verify', ratesVerifiedOn: '2026-11-11',
  note: 'The form now forwards 24-month average emoluments and retirement date. Retiring-year increment, sanctioned medical, prior increases and the federal 2026 baseline increase are explicit inputs. Provincial rules, transitional exceptions and voluntary retirement remain unverified.',
});
for (const entry of ENTRIES) Object.assign(entry, reviewedSources[entry.toolId] || {});

const BY_ID: Record<string, ToolSourceEntry> = Object.fromEntries(
  ENTRIES.map((e) => [e.toolId, e])
);

/** Look up the official-source entry for a tool id (or slug — ids and slugs match in categories.ts). */
export function getToolSource(toolId: string): ToolSourceEntry | undefined {
  return BY_ID[toolId];
}

/** Every registered tool id — used by tests to verify full coverage. */
export function getAllRegisteredToolIds(): string[] {
  return ENTRIES.map((e) => e.toolId);
}

/** Format a YYYY-MM-DD verification date for display, e.g. '4th October 2026'. */
export function formatVerifiedDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th';
  const month = d.toLocaleString('en-GB', { month: 'long' });
  return `${day}${suffix} ${month} ${d.getFullYear()}`;
}
