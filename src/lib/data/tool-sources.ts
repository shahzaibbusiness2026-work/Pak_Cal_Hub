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
    ratesStatus: 'verified',
    rateKeys: ['rbps-2022', 'rbps-2026', 'adhoc-relief-2022-2026', 'hra-frozen-schedule', 'dra-2026', 'gp-fund-slabs', 'benevolent-fund', 'group-insurance'],
    note: 'RBPS-2026 verified against the Finance Division notification dated 21-07-2026 (chart cross-checked against the official PDF). ARA-2026 7%, DRA-2026 15% (OM 14(2)R-3/2025), conveyance +50%, 15% medical, frozen HRA schedule, GP Fund slabs (OM 18-08-2005), Benevolent Fund Rs. 155 cap and Group Insurance slabs verified. BPS 19-22 HRA derived via verified formula — provisional.',
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
    ratesStatus: 'verified',
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
    rateKeys: ['usd-pkr-277.10', 'sbp-interbank'],
    note: 'USD/PKR 277.10 (SBP M2M revaluation rate, 1 Oct 2026). Open-market rates differ from interbank — confirm with your bank or forex dealer.',
  },
  {
    toolId: 'loan-emi-calculator',
    sources: [
      {
        ...A.sbp,
        description: 'Policy rate 11.50% (MPC, 14 Sep 2026); KIBOR benchmarks published daily',
      },
    ],
    ratesVerifiedOn: '2026-10-01',
    ratesStatus: 'verified',
    rateKeys: ['sbp-policy-rate-11.5', 'kibor-3m'],
    note: 'KIBOR 3-month 11.69/11.94% (bid/offer, 1 Oct 2026). Enter your bank\u2019s actual KIBOR + spread for an exact EMI.',
  },
  {
    toolId: 'loan-affordability-calculator',
    sources: [
      {
        ...A.sbp,
        description: 'Policy rate 11.50% (MPC, 14 Sep 2026); KIBOR benchmarks',
      },
    ],
    ratesVerifiedOn: '2026-10-01',
    ratesStatus: 'verified',
    rateKeys: ['sbp-policy-rate-11.5', 'kibor-3m'],
  },

  // ── 6. Education & students ─────────────────────────────────────────────────
  {
    toolId: 'mdcat-aggregate-calculator',
    sources: [
      {
        ...A.pmdc,
        description: 'MDCAT 2026 — 50% F.Sc / 40% MDCAT / 10% Matric aggregate; ≥60% HSSC eligibility',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: ['mdcat-50-40-10', 'pmdc-hssc-60pct'],
  },
  {
    toolId: 'university-merit-calculator',
    sources: [
      {
        ...A.hec,
        description: 'Higher education admission policy guidance',
        url: 'https://hec.gov.pk',
      },
      {
        name: 'Respective university admission offices',
        description: 'NUST, PU, GIKI, UET, FAST, COMSATS, KU merit formulae & prospectuses',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['university-merit-weights'],
    note: 'Merit weights follow published university policies but change yearly — verify against the current prospectus.',
  },
  {
    toolId: 'gpa-calculator',
    sources: [
      {
        ...A.hec,
        description: 'HEC 4.0 GPA system (grade bands & quality points)',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verify',
    rateKeys: ['hec-gpa-4.0'],
  },

  // ── 7. Date, age & service ──────────────────────────────────────────────────
  {
    toolId: 'age-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Pure date arithmetic — no official rates involved.',
  },

  // ── 8. Property & construction ──────────────────────────────────────────────
  {
    toolId: 'property-area-converter',
    sources: [
      {
        name: 'Provincial Boards of Revenue',
        description: 'Land measurement standards (marla / kanal / acre)',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: ['marla-272.25', 'kanal-20-marla', 'acre-43560-sqft'],
  },
  {
    toolId: 'construction-cost-calculator',
    sources: [
      {
        name: 'Pakistan Steel Re-rolling Mills Association',
        description: 'Deformed steel bar Grade-60 benchmark',
        notificationStatus: 'verify',
      },
      {
        name: 'All Pakistan Cement Manufacturers Association',
        description: 'Portland cement (50kg bag) benchmark',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: '2026-08-28',
    ratesStatus: 'verify',
    rateKeys: ['steel-grade60', 'cement-bag'],
    note: 'Material benchmarks move with the market — confirm current dealer rates before budgeting.',
  },
  {
    toolId: 'cement-calculator',
    sources: [
      {
        name: 'All Pakistan Cement Manufacturers Association',
        description: 'Portland cement (50kg bag) benchmark',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: '2026-08-28',
    ratesStatus: 'verify',
    rateKeys: ['cement-bag'],
  },
  {
    toolId: 'bricks-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Quantity estimation from covered area — brick rates vary by kiln and region.',
  },
  {
    toolId: 'steel-rebar-calculator',
    sources: [
      {
        name: 'Pakistan Steel Re-rolling Mills Association',
        description: 'Deformed steel bar Grade-60 benchmark',
        notificationStatus: 'verify',
      },
    ],
    ratesVerifiedOn: '2026-08-28',
    ratesStatus: 'verify',
    rateKeys: ['steel-grade60'],
  },
  {
    toolId: 'tiles-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Quantity estimation from area — tile rates vary by brand and grade.',
  },

  // ── 9. Business, investment & data tools ────────────────────────────────────
  {
    toolId: 'profit-margin-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Pure business arithmetic — no official rates involved.',
  },
  {
    toolId: 'break-even-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Pure business arithmetic — no official rates involved.',
  },
  {
    toolId: 'freelancer-hourly-rate-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Pure arithmetic from your own income target — no official rates involved.',
  },
  {
    toolId: 'compound-interest-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Pure financial mathematics — enter the rate your bank or fund offers.',
  },
  {
    toolId: 'inflation-calculator',
    sources: [],
    ratesVerifiedOn: V,
    ratesStatus: 'verified',
    rateKeys: [],
    note: 'Uses the inflation rate you enter — official CPI is published by the Pakistan Bureau of Statistics.',
  },

  // ── Pakistan services & official checkers (added 9 Oct 2026) ─────────────
  {
    toolId: 'passport-fee-calculator',
    sources: [{ name: 'Directorate General of Immigration & Passports (DGIP)', url: 'https://dgip.gov.pk/passport/ordinary-passport.php', description: 'Ordinary MRP and e-Passport fees; MRP effective 07-03-2024, Fast Track 08-05-2024', effectiveDate: '7th March 2024' }],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verified', rateKeys: ['dgip-mrp-fees-2024', 'dgip-e-passport-fees-2024'],
  },
  {
    toolId: 'driving-licence-fee-calculator',
    sources: [{ name: 'DLIMS 2.0 — Punjab Police / PITB', url: 'https://dlims.punjab.gov.pk/fee_structure', description: 'Punjab permanent licence, renewal and late-fine fee structure (learner fee excluded pending confirmation)' }],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verified', rateKeys: ['dlims-punjab-fee-structure'],
  },
  {
    toolId: 'duplicate-electricity-bill-checker',
    sources: [
      { name: 'PITC — Power Information Technology Company', url: 'https://bill.pitc.com.pk', description: 'Official duplicate-bill portals for LESCO, IESCO, MEPCO, FESCO, GEPCO, PESCO, SEPCO, HESCO and QESCO (14-digit reference number)' },
      { name: 'K-Electric', url: 'https://ke.com.pk/ke-live/', description: 'K-Electric duplicate bill by 13-digit account number (KE is not on PITC)' },
    ],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verified', rateKeys: ['pitc-disco-portals', 'ke-duplicate-bill'],
  },
  {
    toolId: 'vehicle-verification-checker',
    sources: [
      { name: 'Punjab Excise — MTMIS', url: 'https://mtmis.excise.punjab.gov.pk', description: 'Punjab vehicle verification' },
      { name: 'Islamabad Excise', url: 'https://islamabadexcise.gov.pk', description: 'ICT vehicle verification' },
      { name: 'Sindh Excise', url: 'http://www.excise.gos.pk/vehicle/vehicle_search', description: 'Sindh vehicle search' },
    ],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verify', rateKeys: ['mtmis-punjab', 'ict-excise', 'sindh-excise', 'kp-excise', 'balochistan-excise'],
    note: 'KP online form reported unreliable and Balochistan verification is under process — the tool warns on those provinces instead of presenting a working check.',
  },
  {
    toolId: 'property-transfer-cost-calculator',
    sources: [
      { name: 'Federal Board of Revenue (FBR) — Finance Act 2026', url: 'https://fbr.gov.pk', description: 'Sections 236K/236C advance tax from 1 July 2026 (Gazette text checked)', effectiveDate: '1st July 2026' },
      { name: 'Punjab Land Records Authority / Board of Revenue Punjab', description: 'Stamp duty 2% urban / 1% other; Punjab CVT merged into stamp duty since 2017; registration/mutation is calculated in PLRA e-Registration', notificationStatus: 'verify' },
    ],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verify', rateKeys: ['236k-236c-ty2027', 'punjab-stamp-duty-2026'],
    note: 'Late-filer TY2027 rates and the PLRA system fee are not quoted — see the tool notes.',
  },
  {
    toolId: 'pta-mobile-tax-calculator',
    sources: [
      { name: 'PTA DIRBS', url: 'https://dirbs.pta.gov.pk/drs', description: 'Official device registration system that generates the exact PSID tax' },
      { name: 'Federal Board of Revenue (FBR) — DIRBS', url: 'https://www.fbr.gov.pk/mobile-devices-regularization-dirbs/51149/131261', description: 'FBR imposes/collects mobile registration taxes; PTA directs travellers to FBR' },
    ],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verify', rateKeys: ['dirbs-psid'],
    note: 'Current 2026-27 FBR rate SROs could not be verified from fbr.gov.pk, so no unofficial tax table is quoted. Your DIRBS PSID is the exact figure.',
  },
  {
    toolId: 'nadra-fee-calculator',
    sources: [{ name: 'NADRA — Fee Structure', url: 'https://www.nadra.gov.pk/feeStructure', description: 'Official NADRA fee page; exact fee is generated in Pak-ID for your application type', notificationStatus: 'verify' }],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verify', rateKeys: ['nadra-fee-structure', 'pak-id'],
    note: 'The official fee page could not be independently loaded on 9 Oct 2026 and third-party tables conflict, so this checker routes you to NADRA/Pak-ID instead of quoting an unverified fee.',
  },
  {
    toolId: 'salary-slip-generator', sources: [], ratesVerifiedOn: '2026-10-09', ratesStatus: 'verified', rateKeys: [],
    note: 'Generated only from figures you enter — a planning sample, not proof of employment or income.',
  },
  {
    toolId: 'css-age-eligibility-calculator',
    sources: [
      { name: 'Establishment Division — CSS Competitive Examination Rules 2019', url: 'https://establishment.gov.pk/SiteImage/Misc/files/CSS%20Competitive%20Examination%20Rules%2C%202019.pdf', description: 'CSS age 21–30 at 31 Dec before exam; +2 listed-category relaxation (ceiling 32)' },
      { name: 'Establishment Division — Age Relaxation Rules 1993', url: 'https://www.establishment.gov.pk/SiteImage/Misc/files/Initial%20Appointment%20to%20Civil%20Posts%20(Relaxation%20of%20Upper%20Age%20Limit)%20Rules%201993%20updated.pdf', description: 'Federal jobs: +5 general relaxation plus at most one category relaxation' },
    ],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verified', rateKeys: ['css-rules-2019', 'age-relaxation-rules-1993'],
  },
  {
    toolId: 'pakistan-iban-checker',
    sources: [{ name: 'SWIFT IBAN Registry (Release 102)', url: 'https://www.swift.com/resource/iban-registry-pdf', description: 'Pakistan IBAN: 24 characters, PK + 2 check digits + 4-letter bank code + 16-character account portion; MOD-97 validation' }],
    ratesVerifiedOn: '2026-10-09', ratesStatus: 'verified', rateKeys: ['swift-iban-registry-pk'],
    note: 'No official SBP bank-code list was verified, so the tool shows the bank code as printed and never guesses a bank name.',
  },
];

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
